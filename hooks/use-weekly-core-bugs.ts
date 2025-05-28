import { useRepositories } from "@/repositories"
import { useApiQuery } from "@/hooks/use-api-query"
import { useApiMutation } from "@/hooks/use-api-mutation"
import { ApiUtils } from "@/repositories/api-utils"
import type {
  CreateWeeklyCoreBugsDto,
  UpdateWeeklyCoreBugsDto,
  WeeklyCoreBugsQueryParams,
  AddBugsToWeeklyDto,
  RemoveBugsFromWeeklyDto,
  Status,
} from "@/types"

export function useWeeklyCoreBugs(params?: WeeklyCoreBugsQueryParams) {
  const { weeklyCoreBugs } = useRepositories()

  const query = useApiQuery(() => weeklyCoreBugs.getAll(params), [params])

  const createMutation = useApiMutation((data: CreateWeeklyCoreBugsDto) => weeklyCoreBugs.create(data))

  const updateMutation = useApiMutation(({ id, data }: { id: string; data: UpdateWeeklyCoreBugsDto }) =>
    weeklyCoreBugs.update(id, data),
  )

  const addBugsMutation = useApiMutation(({ id, bugsData }: { id: string; bugsData: AddBugsToWeeklyDto }) =>
    weeklyCoreBugs.addBugs(id, bugsData),
  )

  const removeBugsMutation = useApiMutation(({ id, bugsData }: { id: string; bugsData: RemoveBugsFromWeeklyDto }) =>
    weeklyCoreBugs.removeBugs(id, bugsData),
  )

  const updateStatusMutation = useApiMutation(({ id, status }: { id: string; status: Status }) =>
    weeklyCoreBugs.updateStatus(id, status),
  )

  const generateReportMutation = useApiMutation(async (id: string) => {
    const blob = await weeklyCoreBugs.generateExcelReport(id)
    ApiUtils.downloadFile(blob, `WeeklyCoreBugs_${id}.xlsx`)
    return { success: true }
  })

  const deleteMutation = useApiMutation((id: string) => weeklyCoreBugs.remove(id))

  return {
    weeklyCoreBugs: query.data || [],
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    addBugs: addBugsMutation.mutate,
    removeBugs: removeBugsMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    generateReport: generateReportMutation.mutate,
    delete: deleteMutation.mutate,
    createLoading: createMutation.loading,
    updateLoading: updateMutation.loading,
    addBugsLoading: addBugsMutation.loading,
    removeBugsLoading: removeBugsMutation.loading,
    updateStatusLoading: updateStatusMutation.loading,
    generateReportLoading: generateReportMutation.loading,
    deleteLoading: deleteMutation.loading,
  }
}

export function useWeeklyCoreBug(id: string) {
  const { weeklyCoreBugs } = useRepositories()
  return useApiQuery(() => weeklyCoreBugs.getById(id), [id])
}

// Completely rewritten with proper error handling
export function useCurrentWeekCoreBugs() {
  const { weeklyCoreBugs } = useRepositories()
  
  // Use a direct call to the repository method that already handles the 404 case
  const query = useApiQuery(() => weeklyCoreBugs.getCurrentWeek(), [])

  // Mutation to create current week if it doesn't exist
  const createCurrentWeekMutation = useApiMutation(async () => {
    try {
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6) // End of week (Saturday)

      const weekData: CreateWeeklyCoreBugsDto = {
        name: `Week of ${startOfWeek.toLocaleDateString()}`,
        weekStartDate: startOfWeek.toISOString(),
        weekEndDate: endOfWeek.toISOString(),
        bugIds: [], // Start with empty bug list
      }

      const result = await weeklyCoreBugs.create(weekData)
      query.refetch() // Refresh the main query after creation
      return result
    } catch (error) {
      console.error("Failed to create weekly report:", error)
      throw error
    }
  })

  return {
    data: query.data, // This will be null if no weekly report exists
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    hasCurrentWeek: query.data !== null,
    createCurrentWeek: createCurrentWeekMutation.mutate,
    createLoading: createCurrentWeekMutation.loading,
    createError: createCurrentWeekMutation.error,
  }
}

export function useWeeklyStatistics() {
  const { weeklyCoreBugs } = useRepositories()
  return useApiQuery(() => weeklyCoreBugs.getStatistics())
}

// Utility hook for week date calculations
export function useWeekHelpers() {
  const getCurrentWeekRange = () => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() - today.getDay()) // Sunday
    const end = new Date(start)
    end.setDate(start.getDate() + 6) // Saturday
    return { start, end }
  }

  const getWeekRangeForDate = (date: Date) => {
    const start = new Date(date)
    start.setDate(date.getDate() - date.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return { start, end }
  }

  const formatDateForApi = (date: Date): string => {
    return date.toISOString()
  }

  const createWeekData = (date: Date = new Date()): CreateWeeklyCoreBugsDto => {
    const { start, end } = getWeekRangeForDate(date)
    return {
      name: `Week of ${start.toLocaleDateString()}`,
      weekStartDate: formatDateForApi(start),
      weekEndDate: formatDateForApi(end),
      bugIds: [],
    }
  }

  return {
    getCurrentWeekRange,
    getWeekRangeForDate,
    formatDateForApi,
    createWeekData,
  }
}
