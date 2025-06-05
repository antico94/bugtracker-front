"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Calendar,
    Plus,
    FileText,
    TrendingUp,
    BarChart3,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    CheckCircle2,
    Clock,
    AlertTriangle
} from "lucide-react"
import { GlassButton } from "@/components/glass/glass-button"
import { GlassCard } from "@/components/glass/glass-card"
import { GlassPageHeader } from "@/components/glass/glass-page-header"
import { GlassStatsCard } from "@/components/glass/glass-stats-card"
import { GlassEmptyState } from "@/components/glass/glass-empty-state"
import { GlassSearchBar } from "@/components/glass/glass-search-bar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useWeeklyCoreBugs } from "@/hooks/use-weekly-core-bugs"
import { WeeklyCoreBugsStatus, WeeklyCoreBugsResponseDto } from "@/types"
import { toast } from "@/hooks/use-toast"

export default function WeeklyCoreBugsPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<WeeklyCoreBugsStatus | "all">("all")

    const {
        data: weeklyReports,
        loading,
        error,
        refetch,
        createWeeklyReport,
        deleteWeeklyReport,
        updateStatus,
        createWeeklyReportLoading,
        deleteWeeklyReportLoading,
        updateStatusLoading
    } = useWeeklyCoreBugs()

    // Filter weekly reports based on search and status
    const filteredReports = weeklyReports?.filter(report => {
        const matchesSearch = !searchQuery || 
            report.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || report.status === statusFilter
        return matchesSearch && matchesStatus
    }) || []

    // Calculate overall statistics
    const overallStats = weeklyReports?.reduce((acc, report) => ({
        totalReports: acc.totalReports + 1,
        totalBugs: acc.totalBugs + report.totalBugsCount,
        totalTasks: acc.totalTasks + report.totalTasksCount,
        completedTasks: acc.completedTasks + report.completedTasksCount,
        averageCompletion: acc.averageCompletion + report.completionPercentage
    }), { totalReports: 0, totalBugs: 0, totalTasks: 0, completedTasks: 0, averageCompletion: 0 }) || 
    { totalReports: 0, totalBugs: 0, totalTasks: 0, completedTasks: 0, averageCompletion: 0 }

    if (overallStats.totalReports > 0) {
        overallStats.averageCompletion = overallStats.averageCompletion / overallStats.totalReports
    }

    const handleCreateWeeklyReport = async () => {
        try {
            const newReport = await createWeeklyReport({
                name: `Weekly Report - ${new Date().toLocaleDateString()}`,
                weekStartDate: new Date().toISOString(),
                weekEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            })
            
            toast({
                title: "Weekly Report Created",
                description: "A new weekly core bugs report has been created."
            })
            
            router.push(`/weekly-core-bugs/${newReport.weeklyCoreBugsId}`)
        } catch (error) {
            console.error("Failed to create weekly report:", error)
            toast({
                title: "Error",
                description: "Failed to create weekly report. Please try again.",
                variant: "destructive"
            })
        }
    }

    const handleDeleteReport = async (reportId: string) => {
        try {
            await deleteWeeklyReport(reportId)
            toast({
                title: "Report Deleted",
                description: "Weekly report has been deleted successfully."
            })
        } catch (error) {
            console.error("Failed to delete report:", error)
            toast({
                title: "Error",
                description: "Failed to delete report. Please try again.",
                variant: "destructive"
            })
        }
    }

    const handleStatusUpdate = async (reportId: string, newStatus: WeeklyCoreBugsStatus) => {
        try {
            await updateStatus(reportId, newStatus)
            toast({
                title: "Status Updated",
                description: `Report status has been updated to ${newStatus}.`
            })
        } catch (error) {
            console.error("Failed to update status:", error)
            toast({
                title: "Error",
                description: "Failed to update status. Please try again.",
                variant: "destructive"
            })
        }
    }

    const getStatusIcon = (status: WeeklyCoreBugsStatus) => {
        switch (status) {
            case "Draft":
                return <Edit className="h-4 w-4" />
            case "InProgress":
                return <Clock className="h-4 w-4" />
            case "Completed":
                return <CheckCircle2 className="h-4 w-4" />
            case "Archived":
                return <FileText className="h-4 w-4" />
            default:
                return <AlertTriangle className="h-4 w-4" />
        }
    }

    const getStatusColor = (status: WeeklyCoreBugsStatus) => {
        switch (status) {
            case "Draft":
                return "bg-gray-500/20 text-gray-300 border-gray-400/30"
            case "InProgress":
                return "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
            case "Completed":
                return "bg-green-500/20 text-green-300 border-green-400/30"
            case "Archived":
                return "bg-blue-500/20 text-blue-300 border-blue-400/30"
            default:
                return "bg-gray-500/20 text-gray-300 border-gray-400/30"
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent mb-4"></div>
                    <div className="text-white">Loading weekly reports...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <GlassEmptyState
                    icon={AlertTriangle}
                    title="Failed to Load Weekly Reports"
                    description={error}
                    action={
                        <GlassButton onClick={() => refetch()} glowColor="blue">
                            Try Again
                        </GlassButton>
                    }
                />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            {/* Header */}
            <GlassPageHeader
                title="Weekly Core Bugs"
                description="Manage and track weekly core bug reports"
                icon={Calendar}
                actions={
                    <GlassButton
                        onClick={handleCreateWeeklyReport}
                        loading={createWeeklyReportLoading}
                        glowColor="purple"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Weekly Report
                    </GlassButton>
                }
            />

            <div className="container py-6">
                {/* Overall Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <GlassStatsCard
                        title="Total Reports"
                        value={overallStats.totalReports.toString()}
                        change={overallStats.totalReports > 0 ? "+100%" : "0%"}
                        trend="up"
                        icon={FileText}
                        glowColor="blue"
                    />
                    <GlassStatsCard
                        title="Total Bugs"
                        value={overallStats.totalBugs.toString()}
                        change={overallStats.totalBugs > 0 ? "+100%" : "0%"}
                        trend="up"
                        icon={AlertTriangle}
                        glowColor="red"
                    />
                    <GlassStatsCard
                        title="Total Tasks"
                        value={overallStats.totalTasks.toString()}
                        change={overallStats.totalTasks > 0 ? "+100%" : "0%"}
                        trend="up"
                        icon={BarChart3}
                        glowColor="yellow"
                    />
                    <GlassStatsCard
                        title="Avg Completion"
                        value={`${overallStats.averageCompletion.toFixed(1)}%`}
                        change={overallStats.averageCompletion > 0 ? "+100%" : "0%"}
                        trend="up"
                        icon={TrendingUp}
                        glowColor="green"
                    />
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <GlassSearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search weekly reports..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as WeeklyCoreBugsStatus | "all")}
                            className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="all">All Statuses</option>
                            <option value="Draft">Draft</option>
                            <option value="InProgress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Archived">Archived</option>
                        </select>
                    </div>
                </div>

                {/* Weekly Reports List */}
                {filteredReports.length === 0 ? (
                    <GlassEmptyState
                        icon={Calendar}
                        title="No Weekly Reports Found"
                        description={
                            searchQuery || statusFilter !== "all"
                                ? "No weekly reports match your current filters."
                                : "Start by creating your first weekly core bugs report."
                        }
                        action={
                            <GlassButton
                                onClick={handleCreateWeeklyReport}
                                loading={createWeeklyReportLoading}
                                glowColor="purple"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Weekly Report
                            </GlassButton>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredReports.map((report) => (
                            <GlassCard key={report.weeklyCoreBugsId} className="p-6" glowColor="purple">
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-white truncate">
                                                {report.name}
                                            </h3>
                                            <p className="text-sm text-gray-400">
                                                {new Date(report.weekStartDate).toLocaleDateString()} - {new Date(report.weekEndDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge className={`${getStatusColor(report.status)} text-xs`}>
                                            {getStatusIcon(report.status)}
                                            <span className="ml-1">{report.status}</span>
                                        </Badge>
                                    </div>

                                    <Separator className="bg-white/20" />

                                    {/* Statistics */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Bugs</span>
                                            <span className="text-white">{report.totalBugsCount}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Tasks</span>
                                            <span className="text-white">{report.completedTasksCount}/{report.totalTasksCount}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Completion</span>
                                                <span className="text-white">{report.completionPercentage.toFixed(1)}%</span>
                                            </div>
                                            <Progress value={report.completionPercentage} className="h-2" />
                                        </div>
                                    </div>

                                    <Separator className="bg-white/20" />

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <GlassButton
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`/weekly-core-bugs/${report.weeklyCoreBugsId}`)}
                                            glowColor="blue"
                                            className="flex-1"
                                        >
                                            <Eye className="mr-2 h-3 w-3" />
                                            View
                                        </GlassButton>
                                        <GlassButton
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteReport(report.weeklyCoreBugsId)}
                                            loading={deleteWeeklyReportLoading}
                                            glowColor="red"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </GlassButton>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}