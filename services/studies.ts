import { api } from "./api"
import type { StudyResponseDto, CreateStudyDto, UpdateStudyDto } from "@/types"

export const studyService = {
  getStudies: () => {
    return api.get<StudyResponseDto[]>("Study")
  },

  getStudyById: (id: string) => {
    return api.get<StudyResponseDto>(`Study/${id}`)
  },

  getStudiesByClient: (clientId: string) => {
    return api.get<StudyResponseDto[]>(`Study/by-client/${clientId}`)
  },

  createStudy: (study: CreateStudyDto) => {
    return api.post<StudyResponseDto>("Study", study)
  },

  updateStudy: (id: string, study: UpdateStudyDto) => {
    return api.put<void>(`Study/${id}`, study)
  },

  deleteStudy: (id: string) => {
    return api.delete<void>(`Study/${id}`)
  },
}
