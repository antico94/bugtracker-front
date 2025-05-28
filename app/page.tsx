"use client"

import { useState } from "react"
import { Search, Upload, Download, Plus, Bug, CheckCircle2, Clock, AlertCircle, TrendingUp, Activity, BarChart3 } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { RecentBugsTable } from "@/components/recent-bugs-table"
import { ApiTest } from "@/components/api-test"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fillRule=%22evenodd%22%3E%3Cg fill=%22%239CA3AF%22 fillOpacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

      <div className="relative z-10">
        <PageHeader title="Dashboard" className="bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="relative w-96 group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur group-hover:blur-md transition-all duration-300"></div>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
              <Input
                type="search"
                placeholder="Search bugs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative pl-10 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-white/30 transition-all duration-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-300"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import XML
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-300"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
              <Button className="relative group overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20">
                <span className="relative z-10 flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  New Bug
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Button>
            </div>
          </div>
        </PageHeader>

        <PageShell className="py-8">
          <div className="space-y-6">
            {/* API Test Component - Remove after debugging */}
            <ApiTest />

            {error && (
              <Card className="bg-red-900/20 backdrop-blur-xl border-red-500/30 shadow-2xl">
                <CardContent className="pt-6">
                  <p className="text-red-300">Error loading data: {error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-white/30"
                    onClick={() => refetch()}
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-300 mb-1">Total Bugs</p>
                        <p className="text-3xl font-bold text-white">{loading ? "..." : stats.total}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          All bugs in the system
                        </p>
                      </div>
                      <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm">
                        <Bug className="h-8 w-8 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16"></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-300 mb-1">New Bugs</p>
                        <p className="text-3xl font-bold text-white">{loading ? "..." : stats.new}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Awaiting assessment
                        </p>
                      </div>
                      <div className="p-3 bg-red-500/20 rounded-xl backdrop-blur-sm">
                        <AlertCircle className="h-8 w-8 text-red-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-amber-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full -mr-16 -mt-16"></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-300 mb-1">In Progress</p>
                        <p className="text-3xl font-bold text-white">{loading ? "..." : stats.inProgress}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Currently being worked on
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-500/20 rounded-xl backdrop-blur-sm">
                        <Clock className="h-8 w-8 text-yellow-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16"></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-300 mb-1">Completed</p>
                        <p className="text-3xl font-bold text-white">{loading ? "..." : stats.done}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Resolved bugs
                        </p>
                      </div>
                      <div className="p-3 bg-green-500/20 rounded-xl backdrop-blur-sm">
                        <CheckCircle2 className="h-8 w-8 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Weekly Summary - Only show if data exists and is not loading */}
            {!weeklyLoading && weeklyBugs && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden">
                  <CardHeader className="border-b border-white/10 bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm">
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-400" />
                      Weekly Summary
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {weeklyBugs.name} ({new Date(weeklyBugs.weekStartDate).toLocaleDateString()} -{" "}
                      {new Date(weeklyBugs.weekEndDate).toLocaleDateString()})
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
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
                  </CardContent>
                </Card>
              </div>
            )}

            {/* No Weekly Summary Message - Only show if not loading and no data */}
            {!weeklyLoading && !weeklyBugs && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-slate-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden">
                  <CardHeader className="border-b border-white/10 bg-gradient-to-r from-gray-600/10 to-slate-600/10 backdrop-blur-sm">
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                      <Activity className="h-5 w-5 text-gray-400" />
                      Weekly Summary
                    </CardTitle>
                    <CardDescription className="text-gray-300">No weekly report for the current week</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center py-4">
                      <p className="text-gray-400 mb-4">
                        No weekly core bugs report has been created for this week yet.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-300"
                        onClick={handleCreateWeeklyReport}
                        disabled={createLoading}
                      >
                        {createLoading ? (
                          <>
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Weekly Report
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Loading state for weekly bugs */}
            {weeklyLoading && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-slate-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden">
                  <CardHeader className="border-b border-white/10 bg-gradient-to-r from-gray-600/10 to-slate-600/10 backdrop-blur-sm">
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                      <Activity className="h-5 w-5 text-gray-400" />
                      Weekly Summary
                    </CardTitle>
                    <CardDescription className="text-gray-300">Loading weekly report...</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex justify-center items-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Severity Distribution and Status Overview */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden">
                  <CardHeader className="border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 backdrop-blur-sm">
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                      Severity Distribution
                    </CardTitle>
                    <CardDescription className="text-gray-300">Bugs by severity level</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
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
                  </CardContent>
                </Card>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-teal-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden">
                  <CardHeader className="border-b border-white/10 bg-gradient-to-r from-cyan-600/10 to-teal-600/10 backdrop-blur-sm">
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                      <Activity className="h-5 w-5 text-cyan-400" />
                      Status Overview
                    </CardTitle>
                    <CardDescription className="text-gray-300">Current bug status distribution</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
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
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Bugs */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden">
                <CardHeader className="border-b border-white/10 bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-sm">
                  <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                    <Bug className="h-5 w-5 text-purple-400" />
                    Recent Bugs
                  </CardTitle>
                  <CardDescription className="text-gray-300">Latest bugs added to the system</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <RecentBugsTable bugs={recentBugs} loading={loading} />
                </CardContent>
              </Card>
            </div>
          </div>
        </PageShell>
      </div>

      <style jsx>{`
        @keyframes blob {
            0% {
                transform: translate(0px, 0px) scale(1);
            }
            33% {
                transform: translate(30px, -50px) scale(1.1);
            }
            66% {
                transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
                transform: translate(0px, 0px) scale(1);
            }
        }
        .animate-blob {
            animation: blob 7s infinite;
        }
        .animation-delay-2000 {
            animation-delay: 2s;
        }
        .animation-delay-4000 {
            animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
