import { api } from "./api"
import type {
  CustomTaskResponseDto,
  CreateCustomTaskDto,
  UpdateCustomTaskDto,
  CompleteTaskStepDto,
  MakeDecisionDto,
  CreateTaskNoteDto,
  TaskNoteResponseDto,
  CustomTaskQueryParams,
  Status,
} from "@/types"

export const taskService = {
  getTasks: (params?: CustomTaskQueryParams) => {
    return api.get<CustomTaskResponseDto[]>("CustomTask", params)
  },

  getTaskById: (id: string) => {
    return api.get<CustomTaskResponseDto>(`CustomTask/${id}`)
  },

  createTask: (task: CreateCustomTaskDto) => {
    return api.post<CustomTaskResponseDto>("CustomTask", task)
  },

  updateTask: (id: string, task: UpdateCustomTaskDto) => {
    return api.put<void>(`CustomTask/${id}`, task)
  },

  updateTaskStatus: (id: string, status: Status) => {
    return api.put<void>(`CustomTask/${id}/status`, status)
  },

  completeTaskStep: (taskId: string, data: CompleteTaskStepDto) => {
    return api.post<void>(`CustomTask/${taskId}/complete-step`, data)
  },

  makeDecision: (taskId: string, data: MakeDecisionDto) => {
    return api.post<void>(`CustomTask/${taskId}/make-decision`, data)
  },

  addTaskNote: (taskId: string, data: CreateTaskNoteDto) => {
    return api.post<TaskNoteResponseDto>(`CustomTask/${taskId}/notes`, data)
  },
}
