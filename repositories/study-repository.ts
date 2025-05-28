import { BaseRepository } from "@/repositories/base-repository"
import type { StudyResponseDto, CreateStudyDto, UpdateStudyDto } from "@/types"

export class StudyRepository extends BaseRepository {
  private endpoint = "/Study"

  async getAll(): Promise<StudyResponseDto[]> {
    return this.get<StudyResponseDto[]>(this.endpoint)
  }

  async getById(id: string): Promise<StudyResponseDto> {
    return this.get<StudyResponseDto>(`${this.endpoint}/${id}`)
  }

  async getByClient(clientId: string): Promise<StudyResponseDto[]> {
    return this.get<StudyResponseDto[]>(`${this.endpoint}/by-client/${clientId}`)
  }

  async create(study: CreateStudyDto): Promise<StudyResponseDto> {
    return this.post<StudyResponseDto>(this.endpoint, study)
  }

  async update(id: string, study: UpdateStudyDto): Promise<void> {
    return this.put<void>(`${this.endpoint}/${id}`, study)
  }

  async remove(id: string): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`)
  }
}
