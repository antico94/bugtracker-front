import { useRepositories } from "@/repositories"
import { useApiQuery } from "@/hooks/use-api-query"
import { useApiMutation } from "@/hooks/use-api-mutation"
import type { CreateStudyDto, UpdateStudyDto } from "@/types"

export function useStudies() {
  const { studies } = useRepositories()

  const query = useApiQuery(() => studies.getAll())

  const createMutation = useApiMutation((data: CreateStudyDto) => studies.create(data))

  const updateMutation = useApiMutation(({ id, data }: { id: string; data: UpdateStudyDto }) =>
    studies.update(id, data),
  )

  const deleteMutation = useApiMutation((id: string) => studies.remove(id))

  return {
    studies: query.data || [],
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

export function useStudy(id: string) {
  const { studies } = useRepositories()
  return useApiQuery(() => studies.getById(id), [id])
}

export function useStudiesByClient(clientId: string) {
  const { studies } = useRepositories()
  return useApiQuery(() => studies.getByClient(clientId), [clientId])
}
