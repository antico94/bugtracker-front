import { useRepositories } from "@/repositories"
import { useApiQuery } from "@/hooks/use-api-query"
import { useApiMutation } from "@/hooks/use-api-mutation"
import type { CreateTrialManagerDto, UpdateTrialManagerDto } from "@/types"

export function useTrialManagers() {
  const { trialManagers } = useRepositories()

  const query = useApiQuery(() => trialManagers.getAll())

  const createMutation = useApiMutation((data: CreateTrialManagerDto) => trialManagers.create(data))

  const updateMutation = useApiMutation(({ id, data }: { id: string; data: UpdateTrialManagerDto }) =>
    trialManagers.update(id, data),
  )

  const deleteMutation = useApiMutation((id: string) => trialManagers.remove(id))

  return {
    trialManagers: query.data || [],
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

export function useTrialManager(id: string) {
  const { trialManagers } = useRepositories()
  return useApiQuery(() => trialManagers.getById(id), [id])
}

export function useTrialManagersByClient(clientId: string) {
  const { trialManagers } = useRepositories()
  return useApiQuery(() => trialManagers.getByClient(clientId), [clientId])
}
