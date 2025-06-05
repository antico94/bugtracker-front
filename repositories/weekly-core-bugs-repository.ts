import { BaseRepository, ApiError } from "@/repositories/base-repository"
import type {
  WeeklyCoreBugsResponseDto,
  CreateWeeklyCoreBugsDto,
  UpdateWeeklyCoreBugsDto,
  WeeklyCoreBugsQueryParams,
  AddBugsToWeeklyDto,
  RemoveBugsFromWeeklyDto,
  Status,
} from "@/types"

export class WeeklyCoreBugsRepository extends BaseRepository {
  private endpoint = "WeeklyCoreBugs"

  async getAll(params?: WeeklyCoreBugsQueryParams): Promise<WeeklyCoreBugsResponseDto[]> {
    try {
      const queryString = params ? this.buildQueryString(params) : ""
      return await this.get<WeeklyCoreBugsResponseDto[]>(`${this.endpoint}${queryString}`)
    } catch (error) {
      console.error("Failed to fetch weekly core bugs:", error)
      // Return empty array instead of throwing for better UX
      if (error instanceof ApiError && (error.status === 404 || error.status === 0)) {
        console.log("No weekly core bugs found or server unavailable - returning empty array")
        return []
      }
      throw error
    }
  }

  async getById(id: string): Promise<WeeklyCoreBugsResponseDto> {
    return this.get<WeeklyCoreBugsResponseDto>(`${this.endpoint}/${id}`)
  }

  // Modified method with proper error handling
  async getCurrentWeek(): Promise<WeeklyCoreBugsResponseDto | null> {
    try {
      return await this.get<WeeklyCoreBugsResponseDto>(`${this.endpoint}/current-week`)
    } catch (error) {
      // Handle 404 errors and network errors for this endpoint
      if (error instanceof ApiError && (error.status === 404 || error.status === 0)) {
        console.log("No weekly core bugs found for current week or server unavailable - this is expected behavior")
        return null
      }
      // Re-throw other errors
      throw error
    }
  }

  async getStatistics(): Promise<{
    totalWeeks: number
    completedWeeks: number
    inProgressWeeks: number
    totalBugs: number
    totalTasks: number
    completedTasks: number
    overallCompletionRate: number
    weeklyBreakdown: any[]
  }> {
    return this.get(`${this.endpoint}/statistics`)
  }

  async create(weeklyCoreBugs: CreateWeeklyCoreBugsDto): Promise<WeeklyCoreBugsResponseDto> {
    return this.post<WeeklyCoreBugsResponseDto>(this.endpoint, weeklyCoreBugs)
  }

  async update(id: string, weeklyCoreBugs: UpdateWeeklyCoreBugsDto): Promise<void> {
    return this.put<void>(`${this.endpoint}/${id}`, weeklyCoreBugs)
  }

  async addBugs(
    id: string,
    bugsData: AddBugsToWeeklyDto,
  ): Promise<{
    message: string
    addedCount: number
  }> {
    return this.post<{ message: string; addedCount: number }>(`${this.endpoint}/${id}/add-bugs`, bugsData)
  }

  async removeBugs(
    id: string,
    bugsData: RemoveBugsFromWeeklyDto,
  ): Promise<{
    message: string
    removedCount: number
  }> {
    return this.delete<{ message: string; removedCount: number }>(`${this.endpoint}/${id}/remove-bugs`, bugsData)
  }

  async updateStatus(id: string, status: Status): Promise<{ message: string }> {
    return this.put<{ message: string }>(`${this.endpoint}/${id}/status`, status)
  }

  async generateExcelReport(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/${this.endpoint}/${id}/excel-report`)
    if (!response.ok) {
      throw new Error(`Failed to generate Excel report: ${response.statusText}`)
    }
    return response.blob()
  }

  async remove(id: string): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`)
  }
}
