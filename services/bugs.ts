import * as api from "@/services/api"
import type {
  CoreBugResponseDto,
  CreateCoreBugDto,
  UpdateCoreBugDto,
  BugAssessmentDto,
  CoreBugQueryParams,
  BulkImportResultDto,
} from "@/types"

export const bugService = {
  getBugs: async (params?: CoreBugQueryParams) => {
    const data = await api.get<CoreBugResponseDto[]>("CoreBug", params)
    return { data, success: true }
  },

  getBugById: async (id: string) => {
    const data = await api.get<CoreBugResponseDto>(`CoreBug/${id}`)
    return { data, success: true }
  },

  createBug: async (bug: CreateCoreBugDto) => {
    const data = await api.post<CoreBugResponseDto>("CoreBug", bug)
    return { data, success: true }
  },

  updateBug: (id: string, bug: UpdateCoreBugDto) => {
    return api.put<void>(`CoreBug/${id}`, bug)
  },

  deleteBug: (id: string) => {
    return api.del<void>(`CoreBug/${id}`)
  },

  assessBug: async (id: string, assessment: BugAssessmentDto) => {
    const data = await api.post<CoreBugResponseDto>(`CoreBug/${id}/assess`, assessment)
    return { data, success: true }
  },

  getProductVersions: async (productType: string) => {
    const data = await api.get<string[]>(`CoreBug/product-versions/${productType}`)
    return { data, success: true }
  },

  importXml: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    return fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/CoreBug/import-xml`, {
      method: "POST",
      body: formData,
    }).then((response) => {
      if (!response.ok) {
        throw new Error("Failed to import XML")
      }
      return response.json() as Promise<BulkImportResultDto>
    })
  },
}
