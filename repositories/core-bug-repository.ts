import { BaseRepository } from "@/repositories/base-repository"
import type {
  CoreBugResponseDto,
  CreateCoreBugDto,
  UpdateCoreBugDto,
  BugAssessmentDto,
  CoreBugQueryParams,
  ProductType,
  BulkImportResultDto,
} from "@/types"

export class CoreBugRepository extends BaseRepository {
  private endpoint = "CoreBug" // No /api prefix

  async getAll(params?: CoreBugQueryParams): Promise<CoreBugResponseDto[]> {
    const queryString = params ? this.buildQueryString(params) : ""
    return this.get<CoreBugResponseDto[]>(`${this.endpoint}${queryString}`)
  }

  async getById(id: string): Promise<CoreBugResponseDto> {
    return this.get<CoreBugResponseDto>(`${this.endpoint}/${id}`)
  }

  async create(coreBug: CreateCoreBugDto): Promise<CoreBugResponseDto> {
    return this.post<CoreBugResponseDto>(this.endpoint, coreBug)
  }

  async update(id: string, coreBug: UpdateCoreBugDto): Promise<void> {
    return this.put<void>(`${this.endpoint}/${id}`, coreBug)
  }

  async assess(id: string, assessment: BugAssessmentDto): Promise<CoreBugResponseDto> {
    return this.post<CoreBugResponseDto>(`${this.endpoint}/${id}/assess`, assessment)
  }

  async getProductVersions(productType: ProductType): Promise<string[]> {
    return this.get<string[]>(`${this.endpoint}/product-versions/${productType}`)
  }

  async importFromXml(file: File): Promise<BulkImportResultDto> {
    const formData = new FormData()
    formData.append("file", file)

    return this.post<BulkImportResultDto>(`${this.endpoint}/import-xml`, formData)
  }

  async remove(id: string): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`)
  }
}
