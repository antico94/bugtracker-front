"use client"

import React, { useState, useMemo } from "react"
import {
  Search,
  Filter,
  Plus,
  ClipboardList,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  ArrowRight,
  User,
  Target,
  Layers,
  BarChart3
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useCustomTasks } from "@/hooks/use-custom-tasks"
import { Status } from "@/types"

// Real Next.js router
import { useRouter } from "next/navigation"

export default function EnhancedTasksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all")
  const router = useRouter() // Next.js router

  const { tasks, loading, error } = useCustomTasks()

  // Filter tasks based on search and status
  const filteredTasks = useMemo(() => {
    if (!tasks) return []

    return tasks.filter(task => {
      const matchesSearch = !searchQuery ||
          task.taskTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.taskDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.coreBug?.bugTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.coreBug?.jiraKey?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || task.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [tasks, searchQuery, statusFilter])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!tasks) return { total: 0, new: 0, inProgress: 0, done: 0 }

    return {
      total: tasks.length,
      new: tasks.filter(t => t.status === "New").length,
      inProgress: tasks.filter(t => t.status === "InProgress").length,
      done: tasks.filter(t => t.status === "Done").length
    }
  }, [tasks])

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case "New":
        return <AlertTriangle className="h-4 w-4" />
      case "InProgress":
        return <Clock className="h-4 w-4" />
      case "Done":
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <ClipboardList className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "New":
        return "bg-blue-500/20 text-blue-300 border-blue-400/30"
      case "InProgress":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
      case "Done":
        return "bg-green-500/20 text-green-300 border-green-400/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-400/30"
    }
  }

  const handleStartTask = (taskId: string) => {
    router.push(`/tasks/${taskId}`)
  }

  if (loading) {
    return <TasksPageSkeleton />
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
          <div className="relative z-10 p-8">
            <Card className="bg-red-900/20 backdrop-blur-xl border-red-500/30 shadow-2xl">
              <CardContent className="pt-6">
                <p className="text-red-300">Error loading tasks: {error}</p>
              </CardContent>
            </Card>
          </div>
        </div>
    )
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
          {/* Page Header */}
          <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl">
            <div className="container flex h-16 items-center justify-between py-4">
              <h2 className="text-xl font-bold text-white">Task Management</h2>
              <div className="flex items-center gap-4">
                <div className="relative w-96 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur group-hover:blur-md transition-all duration-300"></div>
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
                  <Input
                      type="search"
                      placeholder="Search tasks..."
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
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button className="relative group overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20">
                  <span className="relative z-10 flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    New Task
                  </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="container py-8">
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Tasks"
                    value={stats.total}
                    icon={ClipboardList}
                    color="blue"
                    loading={loading}
                />
                <StatsCard
                    title="New Tasks"
                    value={stats.new}
                    icon={AlertTriangle}
                    color="blue"
                    loading={loading}
                    onClick={() => setStatusFilter("New")}
                    isActive={statusFilter === "New"}
                />
                <StatsCard
                    title="In Progress"
                    value={stats.inProgress}
                    icon={Clock}
                    color="yellow"
                    loading={loading}
                    onClick={() => setStatusFilter("InProgress")}
                    isActive={statusFilter === "InProgress"}
                />
                <StatsCard
                    title="Completed"
                    value={stats.done}
                    icon={CheckCircle2}
                    color="green"
                    loading={loading}
                    onClick={() => setStatusFilter("Done")}
                    isActive={statusFilter === "Done"}
                />
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Quick filters:</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                    className={`text-gray-300 hover:text-white ${statusFilter === "all" ? "bg-white/10" : ""}`}
                >
                  All Tasks
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter("New")}
                    className={`text-gray-300 hover:text-white ${statusFilter === "New" ? "bg-white/10" : ""}`}
                >
                  New
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter("InProgress")}
                    className={`text-gray-300 hover:text-white ${statusFilter === "InProgress" ? "bg-white/10" : ""}`}
                >
                  In Progress
                </Button>
              </div>

              {/* Tasks Grid */}
              {filteredTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="p-5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mb-6 backdrop-blur-sm">
                      <ClipboardList className="h-16 w-16 text-blue-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-white">No Tasks Found</h3>
                    <p className="text-sm text-gray-400 max-w-sm">
                      {searchQuery || statusFilter !== "all"
                          ? "No tasks match your current filters"
                          : "Get started by creating your first task"}
                    </p>
                    {!searchQuery && statusFilter === "all" && (
                        <Button className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Task
                        </Button>
                    )}
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTasks.map((task, index) => (
                        <TaskCard
                            key={task.taskId}
                            task={task}
                            onStartTask={handleStartTask}
                            getStatusIcon={getStatusIcon}
                            getStatusColor={getStatusColor}
                            style={{ animationDelay: `${index * 100}ms` }}
                        />
                    ))}
                  </div>
              )}
            </div>
          </main>
        </div>

        <style jsx>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}</style>
      </div>
  )
}

function StatsCard({
                     title,
                     value,
                     icon: Icon,
                     color,
                     loading,
                     onClick,
                     isActive
                   }: {
  title: string
  value: number
  icon: any
  color: string
  loading: boolean
  onClick?: () => void
  isActive?: boolean
}) {
  const colorClasses = {
    blue: "from-blue-600/20 to-cyan-600/20 text-blue-400 bg-blue-500/20",
    yellow: "from-yellow-600/20 to-amber-600/20 text-yellow-400 bg-yellow-500/20",
    green: "from-green-600/20 to-emerald-600/20 text-green-400 bg-green-500/20"
  }

  const baseClasses = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue
  const [gradientFrom, gradientTo, iconColor, bgColor] = baseClasses.split(" ")

  return (
      <div
          className={`group relative ${onClick ? "cursor-pointer" : ""}`}
          onClick={onClick}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}></div>
        <Card className={`relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden ${isActive ? "ring-2 ring-blue-500/50" : ""}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300 mb-1">{title}</p>
                <p className="text-3xl font-bold text-white">{loading ? "..." : value}</p>
              </div>
              <div className={`p-3 ${bgColor} rounded-xl backdrop-blur-sm`}>
                <Icon className={`h-8 w-8 ${iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}

function TaskCard({
                    task,
                    onStartTask,
                    getStatusIcon,
                    getStatusColor,
                    style
                  }: {
  task: any
  onStartTask: (taskId: string) => void
  getStatusIcon: (status: Status) => React.ReactNode
  getStatusColor: (status: Status) => string
  style?: React.CSSProperties
}) {
  const progressPercentage = task.totalStepsCount > 0
      ? (task.completedStepsCount / task.totalStepsCount) * 100
      : 0

  return (
      <div className="group relative" style={style}>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-70 group-hover:opacity-100"></div>
        <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden h-full">
          <CardHeader className="border-b border-white/10 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-emerald-400" />
                  {task.taskTitle}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(task.status)} text-xs`}>
                    {getStatusIcon(task.status)}
                    <span className="ml-1">{task.status}</span>
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-white/5 border-white/20 text-gray-300">
                    {task.productType === "InteractiveResponseTechnology" ? "IRT" : task.productType}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {/* Bug Information */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">Related Bug:</span>
              </div>
              <div className="pl-6">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono bg-blue-500/10 border-blue-400/30 text-blue-300 text-xs">
                    {task.coreBug?.jiraKey}
                  </Badge>
                  {task.coreBug?.jiraLink && (
                      <a
                          href={task.coreBug.jiraLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1 line-clamp-1">{task.coreBug?.bugTitle}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">Progress</span>
                </div>
                <span className="text-gray-300 font-medium">
                {task.completedStepsCount}/{task.totalStepsCount} steps
              </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="text-xs text-gray-400">
                {progressPercentage.toFixed(0)}% complete
              </div>
            </div>

            {/* Current Step */}
            {task.currentStepId && task.status !== "Done" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Layers className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">Current Step:</span>
                  </div>
                  <div className="pl-6 p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-sm text-white">
                      {task.taskSteps?.find(step => step.taskStepId === task.currentStepId)?.action || "Loading..."}
                    </p>
                  </div>
                </div>
            )}

            {/* Task Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">Created:</span>
                <span className="text-gray-400">{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
              {task.completedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Completed:</span>
                    <span className="text-gray-400">{new Date(task.completedAt).toLocaleDateString()}</span>
                  </div>
              )}
            </div>
          </CardContent>

          <div className="border-t border-white/10 bg-white/5 p-4">
            {task.status === "Done" ? (
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Task Completed</span>
                </div>
            ) : (
                <Button
                    onClick={() => onStartTask(task.taskId)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {task.status === "New" ? "Start Task" : "Continue Task"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            )}
          </div>
        </Card>
      </div>
  )
}

function TasksPageSkeleton() {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
        <div className="relative z-10">
          <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl">
            <div className="container flex h-16 items-center justify-between py-4">
              <Skeleton className="h-6 w-32 bg-white/10" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-96 bg-white/10" />
                <Skeleton className="h-10 w-20 bg-white/10" />
                <Skeleton className="h-10 w-24 bg-white/10" />
              </div>
            </div>
          </header>

          <main className="container py-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="group relative">
                      <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-20 bg-white/10" />
                              <Skeleton className="h-8 w-12 bg-white/10" />
                            </div>
                            <Skeleton className="h-12 w-12 rounded-xl bg-white/10" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="group relative">
                      <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl h-full">
                        <CardHeader className="border-b border-white/10">
                          <Skeleton className="h-6 w-48 bg-white/10" />
                          <div className="flex gap-2 mt-2">
                            <Skeleton className="h-5 w-16 bg-white/10" />
                            <Skeleton className="h-5 w-12 bg-white/10" />
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24 bg-white/10" />
                            <Skeleton className="h-4 w-full bg-white/10" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-20 bg-white/10" />
                            <Skeleton className="h-2 w-full bg-white/10" />
                          </div>
                        </CardContent>
                        <div className="border-t border-white/10 bg-white/5 p-4">
                          <Skeleton className="h-10 w-full bg-white/10" />
                        </div>
                      </Card>
                    </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
  )
}