// Enums
export enum Status {
  New = "New",
  InProgress = "InProgress",
  Done = "Done",
}

export enum BugSeverity {
  None = "None",
  Minor = "Minor",
  Moderate = "Moderate",
  Major = "Major",
  Critical = "Critical",
}

export enum ProductType {
  InteractiveResponseTechnology = "InteractiveResponseTechnology",
  TM = "TM",
  ExternalModule = "ExternalModule",
}

export enum ExternalModuleType {
  DrugAccountability = "DrugAccountability",
  Rollover = "Rollover",
  Fisher = "Fisher",
  Randomization = "Randomization",
}

// Base Types
export interface BaseEntity {
  createdAt: string
  updatedAt?: string
}

// Client Types
export interface Client extends BaseEntity {
  clientId: string
  name: string
  description: string
}

export interface CreateClientDto {
  name: string
  description: string
}

export interface UpdateClientDto {
  name: string
  description: string
}

export interface ClientResponseDto {
  clientId: string
  name: string
  description: string
  trialManager?: TrialManagerDto
  studies?: StudyDto[]
}

export interface ClientSummaryDto {
  clientId: string
  name: string
  description: string
}

// Trial Manager Types
export interface TrialManager extends BaseEntity {
  trialManagerId: string
  version: string
  jiraKey?: string
  jiraLink?: string
  webLink?: string
  protocol?: string
  clientId: string
}

export interface CreateTrialManagerDto {
  clientId: string
  version: string
  jiraKey?: string
  jiraLink?: string
  webLink?: string
  protocol?: string
}

export interface UpdateTrialManagerDto {
  version: string
  jiraKey?: string
  jiraLink?: string
  webLink?: string
  protocol?: string
}

export interface TrialManagerResponseDto {
  trialManagerId: string
  version: string
  jiraKey?: string
  jiraLink?: string
  webLink?: string
  protocol?: string
  clientId: string
  client?: ClientSummaryDto
  studies?: StudySummaryDto[]
  tasks?: TaskSummaryDto[]
}

export interface TrialManagerDto {
  trialManagerId: string
  version: string
  jiraKey?: string
  jiraLink?: string
  webLink?: string
  protocol?: string
}

export interface TrialManagerSummaryDto {
  trialManagerId: string
  version: string
  jiraKey?: string
}

// Study Types
export interface Study extends BaseEntity {
  studyId: string
  name: string
  protocol: string
  description: string
  clientId: string
  trialManagerId: string
}

export interface CreateStudyDto {
  clientId: string
  trialManagerId: string
  name: string
  protocol: string
  description: string
}

export interface UpdateStudyDto {
  name: string
  protocol: string
  description: string
}

export interface StudyResponseDto {
  studyId: string
  name: string
  protocol: string
  description: string
  clientId: string
  trialManagerId: string
  client?: ClientSummaryDto
  trialManager?: TrialManagerSummaryDto
  interactiveResponseTechnologies?: IRTSummaryDto[]
  tasks?: TaskSummaryDto[]
}

export interface StudyDto {
  studyId: string
  name: string
  protocol: string
  description: string
}

export interface StudySummaryDto {
  studyId: string
  name: string
  protocol: string
  description: string
}

export interface StudyBasicDto {
  studyId: string
  name: string
  protocol: string
  description: string
  client?: ClientSummaryDto
}

// IRT Types
export interface InteractiveResponseTechnology extends BaseEntity {
  interactiveResponseTechnologyId: string
  version: string
  jiraKey?: string
  jiraLink?: string
  webLink?: string
  protocol?: string
  studyId: string
  trialManagerId: string
}

export interface CreateIRTDto {
  studyId: string
  trialManagerId: string
  version: string
  jiraKey?: string
  jiraLink?: string
  webLink?: string
  protocol?: string
}

export interface UpdateIRTDto {
  version: string
  jiraKey?: string
  jiraLink?: string
  webLink?: string
  protocol?: string
}

export interface IRTResponseDto {
  interactiveResponseTechnologyId: string
  version: string
  jiraKey?: string
  jiraLink?: string
  webLink?: string
  protocol?: string
  studyId: string
  trialManagerId: string
  study?: StudyBasicDto
  trialManager?: TrialManagerSummaryDto
  externalModules?: ExternalModuleSummaryDto[]
  tasks?: TaskSummaryDto[]
}

export interface IRTSummaryDto {
  interactiveResponseTechnologyId: string
  version: string
  jiraKey?: string
  webLink?: string
}

export interface IRTBasicDto {
  interactiveResponseTechnologyId: string
  version: string
  jiraKey?: string
  webLink?: string
  study?: StudyBasicDto
}

// External Module Types
export interface ExternalModule extends BaseEntity {
  externalModuleId: string
  name: string
  version: string
  externalModuleType: ExternalModuleType
  interactiveResponseTechnologyId: string
}

export interface CreateExternalModuleDto {
  interactiveResponseTechnologyId: string
  name: string
  version: string
  externalModuleType: ExternalModuleType
}

export interface UpdateExternalModuleDto {
  name: string
  version: string
  externalModuleType: ExternalModuleType
}

export interface ExternalModuleResponseDto {
  externalModuleId: string
  name: string
  version: string
  externalModuleType: ExternalModuleType
  interactiveResponseTechnologyId: string
  interactiveResponseTechnology?: IRTBasicDto
}

export interface ExternalModuleSummaryDto {
  externalModuleId: string
  name: string
  version: string
  externalModuleType: string
}

// Core Bug Types
export interface CoreBug extends BaseEntity {
  bugId: string
  bugTitle: string
  jiraKey: string
  jiraLink: string
  bugDescription: string
  status: Status
  foundInBuild?: string
  affectedVersions: string[]
  severity: BugSeverity
  assessedProductType?: ProductType
  assessedImpactedVersions?: string[]
  isAssessed: boolean
  assessedAt?: string
  assessedBy?: string
  resolvedAt?: string
}

export interface CreateCoreBugDto {
  bugTitle: string
  jiraKey: string
  jiraLink: string
  bugDescription: string
  severity: BugSeverity
  foundInBuild?: string
  affectedVersions?: string[]
}

export interface UpdateCoreBugDto {
  bugTitle: string
  bugDescription: string
  severity: BugSeverity
  foundInBuild?: string
  affectedVersions?: string[]
}

export interface BugAssessmentDto {
  bugId: string
  assessedProductType: ProductType
  assessedImpactedVersions: string[]
  assessedBy?: string
}

export interface CoreBugResponseDto {
  bugId: string
  bugTitle: string
  jiraKey: string
  jiraLink: string
  bugDescription: string
  status: Status
  foundInBuild?: string
  affectedVersions: string[]
  severity: BugSeverity
  assessedProductType?: ProductType
  assessedImpactedVersions?: string[]
  isAssessed: boolean
  assessedAt?: string
  assessedBy?: string
  createdAt: string
  resolvedAt?: string
  tasks: TaskSummaryDto[]
  taskCount: number
  completedTaskCount: number
}

export interface CoreBugBasicDto {
  bugId: string
  bugTitle: string
  jiraKey: string
  jiraLink: string
  severity: BugSeverity
}

export interface CoreBugSummaryDto {
  bugId: string
  bugTitle: string
  jiraKey: string
  jiraLink: string
  status: Status
  severity: BugSeverity
  isAssessed: boolean
  assessedProductType?: ProductType
  createdAt: string
  taskCount: number
  completedTaskCount: number
  tasks: TaskSummaryDto[]
}

export interface BugImportDto {
  key: string
  title: string
  description: string
  severity: string
  foundInBuild?: string
  affectedVersions: string[]
}

export interface BulkImportResultDto {
  success: boolean
  message: string
  importedCount: number
  skippedCount: number
  errors: string[]
}

// Custom Task Types
export interface CustomTask extends BaseEntity {
  taskId: string
  taskTitle: string
  taskDescription: string
  jiraTaskKey?: string
  jiraTaskLink?: string
  status: Status
  completedAt?: string
  bugId: string
  studyId?: string
  trialManagerId?: string
  interactiveResponseTechnologyId?: string
}

export interface CreateCustomTaskDto {
  bugId: string
  studyId: string
  trialManagerId?: string
  interactiveResponseTechnologyId?: string
  taskTitle: string
  taskDescription: string
  jiraTaskKey?: string
  jiraTaskLink?: string
}

export interface UpdateCustomTaskDto {
  taskTitle: string
  taskDescription: string
  jiraTaskKey?: string
  jiraTaskLink?: string
}

export interface CustomTaskResponseDto {
  taskId: string
  taskTitle: string
  taskDescription: string
  jiraTaskKey?: string
  jiraTaskLink?: string
  status: Status
  createdAt: string
  completedAt?: string
  bugId: string
  studyId?: string
  trialManagerId?: string
  interactiveResponseTechnologyId?: string
  coreBug?: CoreBugBasicDto
  study?: StudyBasicDto
  trialManager?: TrialManagerSummaryDto
  interactiveResponseTechnology?: IRTBasicDto
  taskSteps: TaskStepResponseDto[]
  taskNotes: TaskNoteResponseDto[]
  productName: string
  productVersion: string
  productType: ProductType
  currentStepId?: string
  completedStepsCount: number
  totalStepsCount: number
}

export interface TaskSummaryDto {
  taskId: string
  taskTitle: string
  status: string
  createdAt: string
  completedAt?: string
}

// Task Step Types
export interface TaskStep extends BaseEntity {
  taskStepId: string
  action: string
  description: string
  order: number
  isDecision: boolean
  isAutoCheck: boolean
  isTerminal: boolean
  requiresNote: boolean
  status: Status
  completedAt?: string
  decisionAnswer?: string
  notes?: string
  autoCheckResult?: boolean
  nextStepIfYes?: string
  nextStepIfNo?: string
  nextStepIfTrue?: string
  nextStepIfFalse?: string
  taskId: string
}

export interface TaskStepResponseDto {
  taskStepId: string
  action: string
  description: string
  order: number
  isDecision: boolean
  isAutoCheck: boolean
  isTerminal: boolean
  requiresNote: boolean
  status: Status
  completedAt?: string
  decisionAnswer?: string
  notes?: string
  autoCheckResult?: boolean
  nextStepIfYes?: string
  nextStepIfNo?: string
  nextStepIfTrue?: string
  nextStepIfFalse?: string
}

export interface CompleteTaskStepDto {
  taskId: string
  taskStepId: string
  notes?: string
}

export interface MakeDecisionDto {
  taskId: string
  taskStepId: string
  decisionAnswer: "Yes" | "No"
  notes?: string
}

// Task Note Types
export interface TaskNote extends BaseEntity {
  taskNoteId: string
  content: string
  createdBy: string
  updatedAt?: string
  taskId: string
}

export interface CreateTaskNoteDto {
  taskId: string
  content: string
  createdBy: string
}

export interface UpdateTaskNoteDto {
  content: string
}

export interface TaskNoteResponseDto {
  taskNoteId: string
  content: string
  createdAt: string
  updatedAt?: string
  createdBy: string
}

// Weekly Core Bugs Types
export interface WeeklyCoreBugs extends BaseEntity {
  weeklyCoreBugsId: string
  name: string
  weekStartDate: string
  weekEndDate: string
  status: Status
  completedAt?: string
}

export interface CreateWeeklyCoreBugsDto {
  name: string
  weekStartDate: string
  weekEndDate: string
  bugIds?: string[]
}

export interface UpdateWeeklyCoreBugsDto {
  name: string
  weekStartDate: string
  weekEndDate: string
}

export interface WeeklyCoreBugsResponseDto {
  weeklyCoreBugsId: string
  name: string
  weekStartDate: string
  weekEndDate: string
  status: Status
  createdAt: string
  completedAt?: string
  weeklyCoreBugEntries: WeeklyCoreBugEntryDto[]
  totalBugsCount: number
  assessedBugsCount: number
  unassessedBugsCount: number
  totalTasksCount: number
  completedTasksCount: number
  inProgressTasksCount: number
  completionPercentage: number
}

export interface WeeklyCoreBugEntryDto {
  weeklyCoreBugEntryId: string
  weeklyCoreBugsId: string
  bugId: string
  coreBug?: CoreBugSummaryDto
}

export interface AddBugsToWeeklyDto {
  weeklyCoreBugsId: string
  bugIds: string[]
}

export interface RemoveBugsFromWeeklyDto {
  weeklyCoreBugsId: string
  bugIds: string[]
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Query Parameters
export interface CoreBugQueryParams {
  status?: Status
  isAssessed?: boolean
  severity?: BugSeverity
  assessedProductType?: ProductType
}

export interface CustomTaskQueryParams {
  status?: Status
  productType?: ProductType
  studyId?: string
  bugId?: string
}

export interface WeeklyCoreBugsQueryParams {
  status?: Status
  fromDate?: string
  toDate?: string
}
