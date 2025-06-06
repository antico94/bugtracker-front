import { useApiQuery, useApiMutation } from './use-api-query'
import { toast } from './use-toast'

// API response types matching the backend WorkflowController
interface WorkflowStateResponse {
  taskId: string
  workflowName: string
  status: 'Active' | 'Completed' | 'Suspended' | 'Failed' | 'Cancelled'
  currentStep: WorkflowStepState | null
  availableActions: WorkflowActionState[]
  completedSteps: WorkflowStepState[]
  context: Record<string, any>
  lastUpdated: string
  errorMessage?: string
  executionMetadata: {
    startedAt: string
    performedBy: string
    totalSteps: number
    completedStepsCount: number
    progressPercentage: number
  }
}

interface WorkflowStepState {
  stepId: string
  name: string
  description: string
  type: 'Manual' | 'Decision' | 'AutoCheck' | 'Terminal'
  isTerminal: boolean
  order: number
  config: {
    requiresNote: boolean
    autoExecute: boolean
    validationRules: ValidationRule[]
  }
}

interface WorkflowActionState {
  actionId: string
  name: string
  label: string
  type: 'Complete' | 'Decide' | 'Skip'
  isEnabled: boolean
  description: string
}

interface ValidationRule {
  ruleId: string
  field: string
  type: string
  value: any
  errorMessage: string
}

interface WorkflowActionResponse {
  success: boolean
  message: string
  newState: WorkflowStateResponse | null
  validationErrors: string[]
  executedAt: string
  actionId: string
  previousStepId?: string
  nextStepId?: string
}

interface ExecuteActionRequest {
  actionId: string
  performedBy: string
  notes?: string
  additionalData?: Record<string, any>
}

/**
 * Hook for managing workflow state - replaces all frontend business logic
 * Single source of truth from backend WorkflowController
 */
export function useWorkflowState(taskId: string) {
  // Get workflow state from backend
  const {
    data: workflowState,
    loading,
    error,
    refetch
  } = useApiQuery<WorkflowStateResponse>({
    queryKey: ['workflow-state', taskId],
    endpoint: `/workflow/${taskId}/state`,
    enabled: !!taskId
  })

  // Execute workflow action mutation
  const executeActionMutation = useApiMutation<WorkflowActionResponse, ExecuteActionRequest>({
    endpoint: `/workflow/${taskId}/execute-action`,
    method: 'POST',
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Action Completed",
          description: data.message
        })
        // Refresh workflow state
        refetch()
      } else {
        toast({
          title: "Action Failed", 
          description: data.message,
          variant: "destructive"
        })
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to execute action",
        variant: "destructive"
      })
    }
  })

  // Helper functions for common actions
  const completeStep = async (notes?: string) => {
    if (!workflowState?.currentStep) return

    const completeAction = workflowState.availableActions.find(
      action => action.type === 'Complete'
    )

    if (!completeAction) {
      toast({
        title: "Error",
        description: "No complete action available for current step",
        variant: "destructive"
      })
      return
    }

    return executeActionMutation.mutate({
      actionId: completeAction.actionId,
      performedBy: "Current User", // TODO: Get from auth context
      notes,
      additionalData: {}
    })
  }

  const makeDecision = async (decision: 'Yes' | 'No', notes?: string) => {
    if (!workflowState?.currentStep) return

    const decisionAction = workflowState.availableActions.find(
      action => action.actionId === `decide_${decision.toLowerCase()}`
    )

    if (!decisionAction) {
      toast({
        title: "Error",
        description: `No ${decision} decision action available`,
        variant: "destructive"
      })
      return
    }

    return executeActionMutation.mutate({
      actionId: decisionAction.actionId,
      performedBy: "Current User", // TODO: Get from auth context
      notes,
      additionalData: { decision }
    })
  }

  const executeAction = async (actionId: string, notes?: string, additionalData?: Record<string, any>) => {
    return executeActionMutation.mutate({
      actionId,
      performedBy: "Current User", // TODO: Get from auth context
      notes,
      additionalData: additionalData || {}
    })
  }

  // Computed properties that replace frontend logic
  const isLoading = loading
  const isComplete = workflowState?.status === 'Completed'
  const hasError = !!error || !!workflowState?.errorMessage
  const errorMessage = error || workflowState?.errorMessage

  const currentStep = workflowState?.currentStep || null
  const availableActions = workflowState?.availableActions || []
  const completedSteps = workflowState?.completedSteps || []
  
  const progressPercentage = workflowState?.executionMetadata.progressPercentage || 0
  const totalSteps = workflowState?.executionMetadata.totalSteps || 0
  const completedStepsCount = workflowState?.executionMetadata.completedStepsCount || 0

  // Check if current step requires notes
  const currentStepRequiresNote = currentStep?.config.requiresNote || false

  // Check if current step is a decision step
  const isDecisionStep = currentStep?.type === 'Decision'

  // Check if current step is terminal
  const isTerminalStep = currentStep?.isTerminal || false

  // Get available decision actions for decision steps
  const decisionActions = availableActions.filter(action => 
    action.type === 'Decide'
  )

  // Get complete action for manual steps
  const completeAction = availableActions.find(action => 
    action.type === 'Complete'
  )

  return {
    // State
    workflowState,
    isLoading,
    isComplete,
    hasError,
    errorMessage,
    
    // Current step info
    currentStep,
    availableActions,
    completedSteps,
    progressPercentage,
    totalSteps,
    completedStepsCount,
    
    // Step properties
    currentStepRequiresNote,
    isDecisionStep,
    isTerminalStep,
    decisionActions,
    completeAction,
    
    // Actions
    completeStep,
    makeDecision,
    executeAction,
    refetch,
    
    // Loading states
    isExecutingAction: executeActionMutation.isLoading
  }
}