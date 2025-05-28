import * as api from "@/services/api"
import type {
  WeeklyCoreBugsResponseDto,
  CreateWeeklyCoreBugsDto,
  UpdateWeeklyCoreBugsDto,
  AddBugsToWeeklyDto,
  RemoveBugsFromWeeklyDto,
  Status,
  WeeklyCoreBugsQueryParams,
} from "@/types"

export const weeklyBugService = {
  getWeeklyBugs: async (params?: WeeklyCoreBugsQueryParams) => {
    const data = await api.get<WeeklyCoreBugsResponseDto[]>("WeeklyCoreBugs", params)
    return { data, success: true }
  },

  getWeeklyBugById: async (id: string) => {
    const data = await api.get<WeeklyCoreBugsResponseDto>(`WeeklyCoreBugs/${id}`)
    return { data, success: true }
  },

  getCurrentWeek: async () => {
    const data = await api.get<WeeklyCoreBugsResponseDto>("WeeklyCoreBugs/current-week")
    return { data, success: true }
  },

  createWeeklyBug: async (weeklyBug: CreateWeeklyCoreBugsDto) => {
    const data = await api.post<WeeklyCoreBugsResponseDto>("WeeklyCoreBugs", weeklyBug)
    return { data, success: true }
  },

  updateWeeklyBug: (id: string, weeklyBug: UpdateWeeklyCoreBugsDto) => {
    return api.put<void>(`WeeklyCoreBugs/${id}`, weeklyBug)
  },

  deleteWeeklyBug: (id: string) => {
    return api.del<void>(`WeeklyCoreBugs/${id}`)
  },

  addBugsToWeekly: (data: AddBugsToWeeklyDto) => {
    return api.post<void>(`WeeklyCoreBugs/${data.weeklyCoreBugsId}/add-bugs`, data)
  },

  removeBugsFromWeekly: (data: RemoveBugsFromWeeklyDto) => {
    return api.del<void>(`WeeklyCoreBugs/${data.weeklyCoreBugsId}/remove-bugs`)
  },

  updateWeeklyStatus: (id: string, status: Status) => {
    return api.put<void>(`WeeklyCoreBugs/${id}/status`, status)
  },

  getExcelReport: (id: string) => {
    return fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/WeeklyCoreBugs/${id}/excel-report`,
      {
        method: "GET",
      },
    ).then((response) => {
      if (!response.ok) {
        throw new Error("Failed to get Excel report")
      }
      return response.blob()
    })
  },

  getStatistics: async () => {
    const data = await api.get<any>("WeeklyCoreBugs/statistics")
    return { data, success: true }
  },
}
