import { useRepositories } from "@/repositories"
import { useApiQuery } from "@/hooks/use-api-query"
import { useApiMutation } from "@/hooks/use-api-mutation"
import type { CreateIRTDto, UpdateIRTDto } from "@/types"

export function useIRTs() {
  const { irts } = useRepositories()

  const query = useApiQuery(() => irts.getAll())

  const createMutation = useApiMutation((data: CreateIRTDto) => irts.create(data))

  const updateMutation = useApiMutation(({ id, data }: { id: string; data: UpdateIRTDto }) =>
    irts.update(id, data),
  )

  const deleteMutation = useApiMutation((id: string) => irts.remove(id))

  return {
    irts: query.data || [],
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

export function useIRT(id: string) {
  const { irts } = useRepositories()
  return useApiQuery(() => irts.getById(id), [id])
}

export function useIRTsByStudy(studyId: string) {
  const { irts } = useRepositories()
  return useApiQuery(() => irts.getByStudy(studyId), [studyId])
}
