import { useMemo } from "react"
import { Bug, CheckCircle, AlertTriangle, Clock, TrendingUp, TrendingDown, Activity, Target } from "lucide-react"
import { GlassStatsCard } from "@/components/glass/glass-stats-card"
import type { WeeklyCoreBugsResponseDto } from "@/types"

interface WeeklyStatsOverviewProps {
  weeklyData?: WeeklyCoreBugsResponseDto
  loading?: boolean
  className?: string
}

export function WeeklyStatsOverview({ 
  weeklyData, 
  loading = false, 
  className = "" 
}: WeeklyStatsOverviewProps) {
  const stats = useMemo(() => {
    if (!weeklyData) {
      return {
        totalBugs: 0,
        assessedBugs: 0,
        unassessedBugs: 0,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        completionPercentage: 0,
        assessmentPercentage: 0
      }
    }

    const assessmentPercentage = weeklyData.totalBugsCount > 0 
      ? Math.round((weeklyData.assessedBugsCount / weeklyData.totalBugsCount) * 100)
      : 0

    return {
      totalBugs: weeklyData.totalBugsCount,
      assessedBugs: weeklyData.assessedBugsCount,
      unassessedBugs: weeklyData.unassessedBugsCount,
      totalTasks: weeklyData.totalTasksCount,
      completedTasks: weeklyData.completedTasksCount,
      inProgressTasks: weeklyData.inProgressTasksCount,
      completionPercentage: Math.round(weeklyData.completionPercentage),
      assessmentPercentage
    }
  }, [weeklyData])

  const getAssessmentColor = (percentage: number): 'red' | 'yellow' | 'green' => {
    if (percentage >= 80) return 'green'
    if (percentage >= 50) return 'yellow'
    return 'red'
  }

  const getTaskCompletionColor = (percentage: number): 'red' | 'yellow' | 'green' => {
    if (percentage >= 75) return 'green'
    if (percentage >= 40) return 'yellow'
    return 'red'
  }

  const assessmentColor = getAssessmentColor(stats.assessmentPercentage)
  const taskCompletionColor = getTaskCompletionColor(stats.completionPercentage)

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {/* Total Bugs */}
      <GlassStatsCard
        title="Total Bugs"
        value={stats.totalBugs}
        subtitle={`${stats.assessedBugs} assessed, ${stats.unassessedBugs} pending`}
        icon={Bug}
        glowColor="blue"
        loading={loading}
      />

      {/* Assessment Progress */}
      <GlassStatsCard
        title="Assessment Progress"
        value={`${stats.assessmentPercentage}%`}
        subtitle={
          stats.assessmentPercentage >= 80 
            ? "Excellent progress" 
            : stats.assessmentPercentage >= 50 
            ? "Good progress" 
            : stats.assessmentPercentage > 0 
            ? "Needs attention" 
            : "No assessments yet"
        }
        icon={assessmentColor === 'green' ? CheckCircle : assessmentColor === 'yellow' ? Clock : AlertTriangle}
        glowColor={assessmentColor}
        loading={loading}
      />

      {/* Task Completion */}
      <GlassStatsCard
        title="Task Completion"
        value={`${stats.completionPercentage}%`}
        subtitle={`${stats.completedTasks}/${stats.totalTasks} tasks completed`}
        icon={taskCompletionColor === 'green' ? Target : taskCompletionColor === 'yellow' ? Activity : Clock}
        glowColor={taskCompletionColor}
        loading={loading}
      />

      {/* Active Tasks */}
      <GlassStatsCard
        title="Active Tasks"
        value={stats.inProgressTasks}
        subtitle={
          stats.inProgressTasks > 0 
            ? `${stats.inProgressTasks} task${stats.inProgressTasks !== 1 ? 's' : ''} in progress`
            : stats.totalTasks > 0 
            ? "All tasks completed!"
            : "No tasks yet"
        }
        icon={stats.inProgressTasks > 0 ? TrendingUp : stats.totalTasks > 0 ? CheckCircle : Clock}
        glowColor={stats.inProgressTasks > 0 ? "orange" : stats.totalTasks > 0 ? "green" : "purple"}
        loading={loading}
      />
    </div>
  )
}