import { useRepositories } from "@/repositories"
import { useApiQuery } from "@/hooks/use-api-query"
import { useApiMutation } from "@/hooks/use-api-mutation"
import type {
  CreateCustomTaskDto,
  UpdateCustomTaskDto,
  CustomTaskQueryParams,
  CompleteTaskStepDto,
  MakeDecisionDto,
  CreateTaskNoteDto,
  Status,
} from "@/types"

export function useCustomTasks(params?: CustomTaskQueryParams) {
  const { customTasks } = useRepositories()

  const query = useApiQuery(() => customTasks.getAll(params), [params])

  const createMutation = useApiMutation((data: CreateCustomTaskDto) => customTasks.create(data))

  const updateMutation = useApiMutation(({ id, data }: { id: string; data: UpdateCustomTaskDto }) =>
    customTasks.update(id, data),
  )

  const completeStepMutation = useApiMutation(({ id, stepData }: { id: string; stepData: CompleteTaskStepDto }) =>
    customTasks.completeStep(id, stepData),
  )

  const makeDecisionMutation = useApiMutation(({ id, decisionData }: { id: string; decisionData: MakeDecisionDto }) =>
    customTasks.makeDecision(id, decisionData),
  )

  const updateStatusMutation = useApiMutation(({ id, status }: { id: string; status: Status }) =>
    customTasks.updateStatus(id, status),
  )

  const addNoteMutation = useApiMutation(({ id, note }: { id: string; note: CreateTaskNoteDto }) =>
    customTasks.addNote(id, note),
  )

  const deleteMutation = useApiMutation((id: string) => customTasks.remove(id))

  return {
    tasks: query.data || [],
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    completeStep: completeStepMutation.mutate,
    makeDecision: makeDecisionMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    addNote: addNoteMutation.mutate,
    delete: deleteMutation.mutate,
    createLoading: createMutation.loading,
    updateLoading: updateMutation.loading,
    completeStepLoading: completeStepMutation.loading,
    makeDecisionLoading: makeDecisionMutation.loading,
    updateStatusLoading: updateStatusMutation.loading,
    addNoteLoading: addNoteMutation.loading,
    deleteLoading: deleteMutation.loading,
  }
}

export function useCustomTask(id: string) {
  const { customTasks } = useRepositories()
  return useApiQuery(() => customTasks.getById(id), [id])
}
