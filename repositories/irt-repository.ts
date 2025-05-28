import { BaseRepository } from "@/repositories/base-repository"
import type { IRTResponseDto, CreateIRTDto, UpdateIRTDto } from "@/types"

export class IRTRepository extends BaseRepository {
  private endpoint = "/IRT"

  async getAll(): Promise<IRTResponseDto[]> {
    return this.get<IRTResponseDto[]>(this.endpoint)
  }

  async getById(id: string): Promise<IRTResponseDto> {
    return this.get<IRTResponseDto>(`${this.endpoint}/${id}`)
  }

  async getByStudy(studyId: string): Promise<IRTResponseDto[]> {
    return this.get<IRTResponseDto[]>(`${this.endpoint}/by-study/${studyId}`)
  }

  async getByClient(clientId: string): Promise<IRTResponseDto[]> {
    return this.get<IRTResponseDto[]>(`${this.endpoint}/by-client/${clientId}`)
  }

  async create(irt: CreateIRTDto): Promise<IRTResponseDto> {
    return this.post<IRTResponseDto>(this.endpoint, irt)
  }

  async update(id: string, irt: UpdateIRTDto): Promise<void> {
    return this.put<void>(`${this.endpoint}/${id}`, irt)
  }

  async remove(id: string): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`)
  }
}
