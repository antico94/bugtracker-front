import { useRepositories } from "@/repositories"
import { useApiQuery } from "@/hooks/use-api-query"
import { useApiMutation } from "@/hooks/use-api-mutation"
import type { CreateClientDto, UpdateClientDto } from "@/types"

export function useClients() {
  const { clients } = useRepositories()

  const query = useApiQuery(() => clients.getAll())

  const createMutation = useApiMutation((data: CreateClientDto) => clients.create(data))

  const updateMutation = useApiMutation(({ id, data }: { id: string; data: UpdateClientDto }) =>
    clients.update(id, data),
  )

  const deleteMutation = useApiMutation((id: string) => clients.remove(id))

  return {
    clients: query.data || [],
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    createLoading: createMutation.loading,
    updateLoading: updateMutation.loading,
    deleteLoading: deleteMutation.loading,
  }
}

export function useClient(id: string) {
  const { clients } = useRepositories()
  return useApiQuery(() => clients.getById(id), [id])
}
