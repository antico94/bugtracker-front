import { BaseRepository } from "@/repositories/base-repository"
import type {
  ExternalModuleResponseDto,
  CreateExternalModuleDto,
  UpdateExternalModuleDto,
  ExternalModuleType,
} from "@/types"

export class ExternalModuleRepository extends BaseRepository {
  private endpoint = "/ExternalModule"

  async getAll(): Promise<ExternalModuleResponseDto[]> {
    return this.get<ExternalModuleResponseDto[]>(this.endpoint)
  }

  async getById(id: string): Promise<ExternalModuleResponseDto> {
    return this.get<ExternalModuleResponseDto>(`${this.endpoint}/${id}`)
  }

  async getByIRT(irtId: string): Promise<ExternalModuleResponseDto[]> {
    return this.get<ExternalModuleResponseDto[]>(`${this.endpoint}/by-irt/${irtId}`)
  }

  async getByType(moduleType: ExternalModuleType): Promise<ExternalModuleResponseDto[]> {
    return this.get<ExternalModuleResponseDto[]>(`${this.endpoint}/by-type/${moduleType}`)
  }

  async create(externalModule: CreateExternalModuleDto): Promise<ExternalModuleResponseDto> {
    return this.post<ExternalModuleResponseDto>(this.endpoint, externalModule)
  }

  async update(id: string, externalModule: UpdateExternalModuleDto): Promise<void> {
    return this.put<void>(`${this.endpoint}/${id}`, externalModule)
  }

  async remove(id: string): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`)
  }
}
