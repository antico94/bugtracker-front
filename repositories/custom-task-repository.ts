import { BaseRepository } from "@/repositories/base-repository"
import type {
  CustomTaskResponseDto,
  CreateCustomTaskDto,
  UpdateCustomTaskDto,
  CustomTaskQueryParams,
  CompleteTaskStepDto,
  MakeDecisionDto,
  CreateTaskNoteDto,
  TaskNoteResponseDto,
  Status,
} from "@/types"

export class CustomTaskRepository extends BaseRepository {
  private endpoint = "/CustomTask"

  async getAll(params?: CustomTaskQueryParams): Promise<CustomTaskResponseDto[]> {
    const queryString = params ? this.buildQueryString(params) : ""
    return this.get<CustomTaskResponseDto[]>(`${this.endpoint}${queryString}`)
  }

  async getById(id: string): Promise<CustomTaskResponseDto> {
    return this.get<CustomTaskResponseDto>(`${this.endpoint}/${id}`)
  }

  async create(task: CreateCustomTaskDto): Promise<CustomTaskResponseDto> {
    return this.post<CustomTaskResponseDto>(this.endpoint, task)
  }

  async update(id: string, task: UpdateCustomTaskDto): Promise<void> {
    return this.put<void>(`${this.endpoint}/${id}`, task)
  }

  async completeStep(id: string, stepData: CompleteTaskStepDto): Promise<{ message: string }> {
    return this.post<{ message: string }>(`${this.endpoint}/${id}/complete-step`, stepData)
  }

  async makeDecision(
    id: string,
    decisionData: MakeDecisionDto,
  ): Promise<{
    message: string
    decision: string
    nextStepId?: string
  }> {
    return this.post<{
      message: string
      decision: string
      nextStepId?: string
    }>(`${this.endpoint}/${id}/make-decision`, decisionData)
  }

  async updateStatus(id: string, status: Status): Promise<{ message: string }> {
    return this.put<{ message: string }>(`${this.endpoint}/${id}/status`, status)
  }

  async addNote(id: string, note: CreateTaskNoteDto): Promise<TaskNoteResponseDto> {
    return this.post<TaskNoteResponseDto>(`${this.endpoint}/${id}/notes`, note)
  }

  async remove(id: string): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`)
  }
}
