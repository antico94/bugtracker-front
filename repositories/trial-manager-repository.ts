import { BaseRepository } from "@/repositories/base-repository"
import type { TrialManagerResponseDto, CreateTrialManagerDto, UpdateTrialManagerDto } from "@/types"

export class TrialManagerRepository extends BaseRepository {
  private endpoint = "/TrialManager"

  async getAll(): Promise<TrialManagerResponseDto[]> {
    return this.get<TrialManagerResponseDto[]>(this.endpoint)
  }

  async getById(id: string): Promise<TrialManagerResponseDto> {
    return this.get<TrialManagerResponseDto>(`${this.endpoint}/${id}`)
  }

  async getByClient(clientId: string): Promise<TrialManagerResponseDto> {
    return this.get<TrialManagerResponseDto>(`${this.endpoint}/by-client/${clientId}`)
  }

  async create(trialManager: CreateTrialManagerDto): Promise<TrialManagerResponseDto> {
    return this.post<TrialManagerResponseDto>(this.endpoint, trialManager)
  }

  async update(id: string, trialManager: UpdateTrialManagerDto): Promise<void> {
    return this.put<void>(`${this.endpoint}/${id}`, trialManager)
  }

  async remove(id: string): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`)
  }
}
