import { useRepositories } from "@/repositories"
import { useApiQuery } from "@/hooks/use-api-query"
import { useApiMutation } from "@/hooks/use-api-mutation"
import type { CreateCoreBugDto, UpdateCoreBugDto, BugAssessmentDto, CoreBugQueryParams, ProductType } from "@/types"

export function useCoreBugs(params?: CoreBugQueryParams) {
  const { coreBugs } = useRepositories()
  const paramsString = JSON.stringify(params || {})

  const query = useApiQuery(() => coreBugs.getAll(params), [paramsString])

  const createMutation = useApiMutation((data: CreateCoreBugDto) => coreBugs.create(data))

  const updateMutation = useApiMutation(({ id, data }: { id: string; data: UpdateCoreBugDto }) =>
    coreBugs.update(id, data),
  )

  const assessMutation = useApiMutation(({ id, assessment }: { id: string; assessment: BugAssessmentDto }) =>
    coreBugs.assess(id, assessment),
  )

  const importMutation = useApiMutation((file: File) => coreBugs.importFromXml(file))

  const deleteMutation = useApiMutation((id: string) => coreBugs.remove(id))

  return {
    bugs: query.data || [],
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    assess: assessMutation.mutate,
    import: importMutation.mutate,
    delete: deleteMutation.mutate,
    createLoading: createMutation.loading,
    updateLoading: updateMutation.loading,
    assessLoading: assessMutation.loading,
    importLoading: importMutation.loading,
    deleteLoading: deleteMutation.loading,
  }
}

export function useCoreBug(id: string) {
  const { coreBugs } = useRepositories()
  return useApiQuery(() => coreBugs.getById(id), [id])
}

export function useProductVersions(productType: ProductType) {
  const { coreBugs } = useRepositories()
  return useApiQuery(() => coreBugs.getProductVersions(productType), [productType])
}
