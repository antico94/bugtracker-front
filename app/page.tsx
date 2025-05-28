"use client"

import { useState } from "react"
import { Upload, Download, Plus, Bug, CheckCircle2, Clock, AlertCircle, TrendingUp, Activity, BarChart3 } from 'lucide-react'
import {
  AnimatedBackground,
  GlassPageHeader,
  GlassSearchBar,
  GlassButton,
  GlassStatsCard,
  GlassCard,
  GlassEmptyState
} from "@/components/glass"
import { PageShell } from "@/components/page-shell"
import { RecentBugsTable } from "@/components/recent-bugs-table"
// import { ApiTest } from "@/components/api-test"
import { useCoreBugs } from "@/hooks/use-core-bugs"
import { useCurrentWeekCoreBugs, useWeekHelpers } from "@/hooks/use-weekly-core-bugs"
import { toast } from "@/components/ui/use-toast"
import type { Status } from "@/types"

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const { bugs, loading, error, refetch } = useCoreBugs({})
  const {
    data: weeklyBugs,
    loading: weeklyLoading,
    createCurrentWeek,
    createLoading
  } = useCurrentWeekCoreBugs()

  // Calculate stats
  const stats = {
    total: bugs?.length || 0,
    new: bugs?.filter((b) => b.status === ("New" as Status))?.length || 0,
    inProgress: bugs?.filter((b) => b.status === ("InProgress" as Status))?.length || 0,
    done: bugs?.filter((b) => b.status === ("Done" as Status))?.length || 0,
    critical: bugs?.filter((b) => b.severity === 0)?.length || 0,
    major: bugs?.filter((b) => b.severity === 1)?.length || 0,
  }

  // Get recent bugs (last 10)
  const recentBugs = bugs
      ? [...bugs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)
      : []

  // Handle creating a new weekly report
  const handleCreateWeeklyReport = async () => {
    try {
      await createCurrentWeek()
      toast({
        title: "Success",
        description: "Weekly report created successfully",
      })
    } catch (error) {
      console.error("Failed to create weekly report:", error)
      toast({
        title: "Error",
        description: "Failed to create weekly report",
        variant: "destructive",
      })
    }
  }

  return (
      <>
        <GlassPageHeader title="Dashboard">
          <GlassSearchBar
              placeholder="Search bugs..."
              value={searchQuery}
              onChange={setSearchQuery}
          />
          <div className="flex items-center gap-2">
            <GlassButton variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Import XML
            </GlassButton>
            <GlassButton variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </GlassButton>
            <GlassButton>
              <Plus className="mr-2 h-4 w-4" />
              New Bug
            </GlassButton>
          </div>
        </GlassPageHeader>

        {/* Use AnimatedBackground with subtle intensity since GlassLayout already provides background */}
        <AnimatedBackground intensity="subtle">
          <PageShell className="py-8">
            <div className="space-y-6">
              {/* API Test Component - Remove after debugging */}
              {/*<ApiTest />*/}

              {error && (
                  <GlassCard glowColor="red" title="Error" titleIcon={<AlertCircle className="h-5 w-5 text-red-400" />}>
                    <p className="text-red-300">Error loading data: {error}</p>
                    <GlassButton
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => refetch()}
                    >
                      Retry
                    </GlassButton>
                  </GlassCard>
              )}

              {/* Stats Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <GlassStatsCard
                    title="Total Bugs"
                    value={loading ? "..." : stats.total}
                    subtitle="All bugs in the system"
                    icon={Bug}
                    glowColor="blue"
                    loading={loading}
                />

                <GlassStatsCard
                    title="New Bugs"
                    value={loading ? "..." : stats.new}
                    subtitle="Awaiting assessment"
                    icon={AlertCircle}
                    glowColor="red"
                    loading={loading}
                />

                <GlassStatsCard
                    title="In Progress"
                    value={loading ? "..." : stats.inProgress}
                    subtitle="Currently being worked on"
                    icon={Clock}
                    glowColor="yellow"
                    loading={loading}
                />

                <GlassStatsCard
                    title="Completed"
                    value={loading ? "..." : stats.done}
                    subtitle="Resolved bugs"
                    icon={CheckCircle2}
                    glowColor="green"
                    loading={loading}
                />
              </div>

              {/* Weekly Summary - Only show if data exists and is not loading */}
              {!weeklyLoading && weeklyBugs && (
                  <GlassCard
                      glowColor="purple"
                      title="Weekly Summary"
                      titleIcon={<Activity className="h-5 w-5 text-purple-400" />}
                      description={`${weeklyBugs.name} (${new Date(weeklyBugs.weekStartDate).toLocaleDateString()} - ${new Date(weeklyBugs.weekEndDate).toLocaleDateString()})`}
                  >
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <div className="text-2xl font-bold text-white">{weeklyBugs.totalBugsCount || 0}</div>
                        <p className="text-xs text-gray-400">Total bugs this week</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{weeklyBugs.assessedBugsCount || 0}</div>
                        <p className="text-xs text-gray-400">Assessed</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{weeklyBugs.totalTasksCount || 0}</div>
                        <p className="text-xs text-gray-400">Total tasks</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {(weeklyBugs.completionPercentage || 0).toFixed(0)}%
                        </div>
                        <p className="text-xs text-gray-400">Completion rate</p>
                      </div>
                    </div>
                  </GlassCard>
              )}

              {/* No Weekly Summary Message - Only show if not loading and no data */}
              {!weeklyLoading && !weeklyBugs && (
                  <GlassCard
                      glowColor="purple"
                      title="Weekly Summary"
                      titleIcon={<Activity className="h-5 w-5 text-purple-400" />}
                      description="No weekly report for the current week"
                  >
                    <div className="text-center py-4">
                      <p className="text-gray-400 mb-4">
                        No weekly core bugs report has been created for this week yet.
                      </p>
                      <GlassButton
                          variant="outline"
                          size="sm"
                          onClick={handleCreateWeeklyReport}
                          loading={createLoading}
                          glowColor="purple"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Weekly Report
                      </GlassButton>
                    </div>
                  </GlassCard>
              )}

              {/* Loading state for weekly bugs */}
              {weeklyLoading && (
                  <GlassCard
                      glowColor="purple"
                      title="Weekly Summary"
                      titleIcon={<Activity className="h-5 w-5 text-purple-400" />}
                      description="Loading weekly report..."
                  >
                    <div className="flex justify-center items-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                    </div>
                  </GlassCard>
              )}

              {/* Severity Distribution and Status Overview */}
              <div className="grid gap-4 md:grid-cols-2">
                <GlassCard
                    glowColor="blue"
                    title="Severity Distribution"
                    titleIcon={<BarChart3 className="h-5 w-5 text-blue-400" />}
                    description="Bugs by severity level"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-sm text-gray-300">Critical</span>
                      </div>
                      <span className="text-sm font-medium text-white">{loading ? "..." : stats.critical}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                        <span className="text-sm text-gray-300">Major</span>
                      </div>
                      <span className="text-sm font-medium text-white">{loading ? "..." : stats.major}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        <span className="text-sm text-gray-300">Moderate</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                      {loading ? "..." : bugs?.filter((b) => b.severity === 2).length || 0}
                    </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-sm text-gray-300">Minor</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                      {loading ? "..." : bugs?.filter((b) => b.severity === 3).length || 0}
                    </span>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard
                    glowColor="cyan"
                    title="Status Overview"
                    titleIcon={<Activity className="h-5 w-5 text-cyan-400" />}
                    description="Current bug status distribution"
                >
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">New</span>
                        <span className="text-sm font-medium text-white">{loading ? "..." : stats.new}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500 transition-all"
                            style={{ width: `${stats.total > 0 ? (stats.new / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">In Progress</span>
                        <span className="text-sm font-medium text-white">{loading ? "..." : stats.inProgress}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-yellow-500 transition-all"
                            style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">Done</span>
                        <span className="text-sm font-medium text-white">{loading ? "..." : stats.done}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Recent Bugs */}
              <GlassCard
                  glowColor="purple"
                  title="Recent Bugs"
                  titleIcon={<Bug className="h-5 w-5 text-purple-400" />}
                  description="Latest bugs added to the system"
                  contentClassName="p-0"
              >
                <RecentBugsTable bugs={recentBugs} loading={loading} />
              </GlassCard>
            </div>
          </PageShell>
        </AnimatedBackground>
      </>
  )
}