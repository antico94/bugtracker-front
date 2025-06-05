// hooks/use-workflow.ts
import { useApiQuery } from './use-api-query'
import { useApiMutation } from './use-api-mutation'
import { useRepositories } from '@/repositories'
import {
  WorkflowStateDto,
  WorkflowHistoryDto,
  WorkflowActionRequestDto,
  WorkflowActionResultDto,
  CompleteStepRequestDto,
  MakeDecisionRequestDto,
  AddNoteRequestDto
} from '@/repositories/workflow-repository'

/**
 * Hook to get the complete workflow state for a task
 */
export function useWorkflowState(taskId: string) {
  const { workflow } = useRepositories()
  return useApiQuery(() => workflow.getWorkflowState(taskId), [taskId])
}

/**
 * Hook to get the workflow history for a task
 */
export function useWorkflowHistory(taskId: string) {
  const { workflow } = useRepositories()
  return useApiQuery(() => workflow.getWorkflowHistory(taskId), [taskId])
}

/**
 * Hook to process workflow actions
 */
export function useWorkflowAction() {
  const { workflow } = useRepositories()
  return useApiMutation((request: WorkflowActionRequestDto) => workflow.processAction(request))
}

/**
 * Hook for quick step completion actions
 */
export function useCompleteStep() {
  const { workflow } = useRepositories()
  return useApiMutation(({ taskId, request }: { taskId: string; request: CompleteStepRequestDto }) =>
    workflow.completeCurrentStep(taskId, request)
  )
}

/**
 * Hook for quick decision actions
 */
export function useMakeDecision() {
  const { workflow } = useRepositories()
  return useApiMutation(({ taskId, request }: { taskId: string; request: MakeDecisionRequestDto }) =>
    workflow.makeDecision(taskId, request)
  )
}

/**
 * Hook for adding notes
 */
export function useAddNote() {
  const { workflow } = useRepositories()
  return useApiMutation(({ taskId, request }: { taskId: string; request: AddNoteRequestDto }) =>
    workflow.addNote(taskId, request)
  )
}

/**
 * Convenience hook that provides all workflow operations for a specific task
 */
export function useTaskWorkflow(taskId: string) {
  const workflowState = useWorkflowState(taskId)
  const workflowHistory = useWorkflowHistory(taskId)
  const processAction = useWorkflowAction()
  const completeStep = useCompleteStep()
  const makeDecision = useMakeDecision()
  const addNote = useAddNote()
  
  // Convenience functions that automatically include taskId
  const handleAction = (actionType: string, data?: { note?: string; metadata?: Record<string, any> }) => {
    processAction.mutate({
      taskId,
      actionType: actionType as 'complete' | 'decide_yes' | 'decide_no' | 'add_note',
      note: data?.note,
      metadata: data?.metadata
    })
  }
  
  const handleComplete = (note?: string) => {
    completeStep.mutate({
      taskId,
      request: { note }
    })
  }
  
  const handleDecision = (decision: 'Yes' | 'No', note?: string) => {
    makeDecision.mutate({
      taskId,
      request: { decision, note }
    })
  }
  
  const handleAddNote = (note: string) => {
    addNote.mutate({
      taskId,
      request: { note }
    })
  }
  
  return {
    // State
    workflowState: workflowState.data,
    workflowHistory: workflowHistory.data,
    
    // Loading states
    isLoading: workflowState.loading,
    isLoadingHistory: workflowHistory.loading,
    isProcessing: processAction.loading || completeStep.loading || 
                 makeDecision.loading || addNote.loading,
    
    // Error states
    error: workflowState.error,
    historyError: workflowHistory.error,
    actionError: processAction.error || completeStep.error || 
                makeDecision.error || addNote.error,
    
    // Actions
    handleAction,
    handleComplete,
    handleDecision,
    handleAddNote,
    
    // Direct mutation objects (for advanced usage)
    mutations: {
      processAction,
      completeStep,
      makeDecision,
      addNote
    },
    
    // Utility functions
    refresh: () => {
      workflowState.refetch()
      workflowHistory.refetch()
    },
    
    // Quick state checks
    isTaskComplete: workflowState.data?.isTaskComplete ?? false,
    hasCurrentStep: !!workflowState.data?.currentStep,
    hasAvailableActions: (workflowState.data?.availableActions.length ?? 0) > 0
  }
}

/**
 * Hook to get available actions for a task
 */
export function useAvailableActions(taskId: string) {
  const { workflow } = useRepositories()
  return useApiQuery(() => workflow.getAvailableActions(taskId), [taskId])
}

/**
 * Hook to get validation rules for a task
 */
export function useValidationRules(taskId: string) {
  const { workflow } = useRepositories()
  return useApiQuery(() => workflow.getValidationRules(taskId), [taskId])
}