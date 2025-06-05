// repositories/workflow-repository.ts
import { BaseRepository } from './base-repository'

// Workflow DTOs
export interface WorkflowStateDto {
  taskId: string
  taskStatus: Status
  currentStep: TaskStepDto | null
  availableActions: WorkflowActionDto[]
  progressInfo: WorkflowProgressDto
  validationRules: WorkflowValidationDto
  completedSteps: StepSummaryDto[]
  upcomingSteps: StepSummaryDto[]
  isTaskComplete: boolean
  uiHints: WorkflowUIHintsDto
}

export interface TaskStepDto {
  taskStepId: string
  action: string
  description: string
  order: number
  isDecision: boolean
  isAutoCheck: boolean
  isTerminal: boolean
  requiresNote: boolean
  status: Status
  completedAt: string | null
  decisionAnswer: string | null
  notes: string | null
  autoCheckResult: boolean | null
}

export interface WorkflowActionDto {
  actionType: 'complete' | 'decide_yes' | 'decide_no' | 'add_note'
  label: string
  buttonVariant: 'workflow-decision' | 'workflow-action'
  isEnabled: boolean
  disabledReason?: string
  description?: string
}

export interface WorkflowProgressDto {
  completedSteps: number
  totalSteps: number
  percentComplete: number
  statusText: string
  isInProgress: boolean
}

export interface WorkflowValidationDto {
  requiresNote: boolean
  minNoteLength: number
  maxNoteLength: number
  notePrompt?: string
  validationMessages: string[]
  requirements: string[]
}

export interface StepSummaryDto {
  taskStepId: string
  action: string
  description: string
  order: number
  isDecision: boolean
  isTerminal: boolean
  status: Status
  completedAt: string | null
  decisionAnswer: string | null
  notes: string | null
  statusIcon: string
  statusColor: string
}

export interface WorkflowUIHintsDto {
  currentStepType: 'decision' | 'action' | 'terminal' | 'complete'
  themeColor: string
  showProgressBar: boolean
  showStepHistory: boolean
  showUpcomingSteps: boolean
  nextStepPreview: string
}

export interface WorkflowActionRequestDto {
  taskId: string
  actionType: 'complete' | 'decide_yes' | 'decide_no' | 'add_note'
  note?: string
  metadata?: Record<string, any>
}

export interface WorkflowActionResultDto {
  success: boolean
  errorMessages: string[]
  warningMessages: string[]
  infoMessages: string[]
  newWorkflowState: WorkflowStateDto
  nextAction?: string
}

export interface WorkflowHistoryDto {
  events: WorkflowEventDto[]
  totalDuration: string
  startedAt: string
  completedAt?: string
}

export interface WorkflowEventDto {
  eventId: string
  eventType: string
  timestamp: string
  description: string
  stepName?: string
  decision?: string
  notes?: string
  userName?: string
}

// Convenience request types
export interface CompleteStepRequestDto {
  note?: string
}

export interface MakeDecisionRequestDto {
  decision: 'Yes' | 'No'
  note?: string
}

export interface AddNoteRequestDto {
  note: string
}

// Import Status enum from existing types
import { Status } from '../types'

export class WorkflowRepository extends BaseRepository {
  /**
   * Get the complete workflow state for a task
   */
  async getWorkflowState(taskId: string): Promise<WorkflowStateDto> {
    return this.get(`/workflow/${taskId}/state`)
  }

  /**
   * Get the workflow history for a task
   */
  async getWorkflowHistory(taskId: string): Promise<WorkflowHistoryDto> {
    return this.get(`/workflow/${taskId}/history`)
  }

  /**
   * Process a workflow action (complete step, make decision, add note)
   */
  async processAction(request: WorkflowActionRequestDto): Promise<WorkflowActionResultDto> {
    return this.post(`/workflow/${request.taskId}/action`, request)
  }

  /**
   * Get available actions for a task's current step
   */
  async getAvailableActions(taskId: string): Promise<WorkflowActionDto[]> {
    return this.get(`/workflow/${taskId}/actions`)
  }

  /**
   * Get validation rules for a task's current step
   */
  async getValidationRules(taskId: string): Promise<WorkflowValidationDto> {
    return this.get(`/workflow/${taskId}/validation`)
  }

  /**
   * Quick action: Complete the current step
   */
  async completeCurrentStep(taskId: string, request: CompleteStepRequestDto): Promise<WorkflowActionResultDto> {
    return this.post(`/workflow/${taskId}/complete`, request)
  }

  /**
   * Quick action: Make a decision on the current step
   */
  async makeDecision(taskId: string, request: MakeDecisionRequestDto): Promise<WorkflowActionResultDto> {
    return this.post(`/workflow/${taskId}/decide`, request)
  }

  /**
   * Add a note to the task
   */
  async addNote(taskId: string, request: AddNoteRequestDto): Promise<WorkflowActionResultDto> {
    return this.post(`/workflow/${taskId}/note`, request)
  }
}

// Create and export singleton instance
export const workflowRepository = new WorkflowRepository()