import { BaseRepository } from "@/repositories/base-repository"
import type { ClientResponseDto, CreateClientDto, UpdateClientDto } from "@/types"

export class ClientRepository extends BaseRepository {
  private endpoint = "/Client"

  async getAll(): Promise<ClientResponseDto[]> {
    return this.get<ClientResponseDto[]>(this.endpoint)
  }

  async getById(id: string): Promise<ClientResponseDto> {
    return this.get<ClientResponseDto>(`${this.endpoint}/${id}`)
  }

  async create(client: CreateClientDto): Promise<ClientResponseDto> {
    return this.post<ClientResponseDto>(this.endpoint, client)
  }

  async update(id: string, client: UpdateClientDto): Promise<void> {
    return this.put<void>(`${this.endpoint}/${id}`, client)
  }

  async remove(id: string): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`)
  }
}
