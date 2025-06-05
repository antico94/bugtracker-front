"use client"

import React, { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    Calendar,
    Plus,
    FileText,
    TrendingUp,
    BarChart3,
    Search,
    Filter,
    Download,
    Edit,
    Trash2,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ExternalLink,
    Settings,
    Bug,
    Target,
    PlayCircle,
    PauseCircle,
    Archive
} from "lucide-react"
import { GlassButton } from "@/components/glass/glass-button"
import { GlassCard } from "@/components/glass/glass-card"
import { GlassStatsCard } from "@/components/glass/glass-stats-card"
import { GlassEmptyState } from "@/components/glass/glass-empty-state"
import { GlassSearchBar } from "@/components/glass/glass-search-bar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BugSeverityBadge } from "@/components/bug-severity-badge"
import { WeeklyStatsOverview } from "@/components/weekly-stats-overview"
import BugSelectionDialog from "@/components/dialogs/bug-selection-dialog"
import { useWeeklyCoreBug } from "@/hooks/use-weekly-core-bugs"
import { useCoreBugs } from "@/hooks/use-core-bugs"
import { BugSeverity, Status } from "@/types"
import { toast } from "@/hooks/use-toast"

export default function WeeklyCoreBugDetailPage() {
    const router = useRouter()
    const params = useParams()
    const weeklyReportId = params.id as string

    const [searchQuery, setSearchQuery] = useState("")
    const [severityFilter, setSeverityFilter] = useState<BugSeverity | "all">("all")
    const [showAddBugsDialog, setShowAddBugsDialog] = useState(false)

    const {
        data: weeklyReport,
        loading,
        error,
        refetch
    } = useWeeklyCoreBug(weeklyReportId)

    const {
        bugs: allCoreBugs,
        loading: coreBugsLoading
    } = useCoreBugs()

    const {
        updateStatus,
        addBugs,
        removeBugs,
        updateStatusLoading,
        addBugsLoading,
        removeBugsLoading
    } = useWeeklyCoreBugs()

    // Filter bugs in the weekly report
    const filteredBugs = useMemo(() => {
        if (!weeklyReport?.weeklyCoreBugEntries) return []
        
        return weeklyReport.weeklyCoreBugEntries.filter(entry => {
            const bug = entry.coreBug
            if (!bug) return false
            const matchesSearch = !searchQuery || 
                bug.bugTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                bug.jiraKey.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesSeverity = severityFilter === "all" || bug.severity === severityFilter
            return matchesSearch && matchesSeverity
        })
    }, [weeklyReport?.weeklyCoreBugEntries, searchQuery, severityFilter])

    // Get available bugs to add (not already in this weekly report)
    const availableBugs = useMemo(() => {
        if (!allCoreBugs || !weeklyReport) return []
        
        const existingBugIds = new Set(weeklyReport.weeklyCoreBugEntries.map(entry => entry.bugId))
        return allCoreBugs.filter(bug => !existingBugIds.has(bug.bugId) && bug.isAssessed)
    }, [allCoreBugs, weeklyReport])

    const handleStatusUpdate = async (newStatus: Status) => {
        try {
            await updateStatus({ id: weeklyReportId, status: newStatus })
            toast({
                title: "Status Updated",
                description: `Weekly report status has been updated to ${newStatus}.`
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

    const handleAddBugs = async (bugIds: string[]) => {
        try {
            await addBugs({
                id: weeklyReportId,
                bugsData: {
                    weeklyCoreBugsId: weeklyReportId,
                    bugIds: bugIds
                }
            })
            setShowAddBugsDialog(false)
            toast({
                title: "Bugs Added",
                description: `${bugIds.length} bug(s) have been added to the weekly report.`
            })
            refetch()
        } catch (error) {
            console.error("Failed to add bugs:", error)
            toast({
                title: "Error",
                description: "Failed to add bugs. Please try again.",
                variant: "destructive"
            })
        }
    }

    const handleRemoveBug = async (bugId: string) => {
        try {
            await removeBugs({
                id: weeklyReportId,
                bugsData: {
                    weeklyCoreBugsId: weeklyReportId,
                    bugIds: [bugId]
                }
            })
            toast({
                title: "Bug Removed",
                description: "Bug has been removed from the weekly report."
            })
            refetch()
        } catch (error) {
            console.error("Failed to remove bug:", error)
            toast({
                title: "Error",
                description: "Failed to remove bug. Please try again.",
                variant: "destructive"
            })
        }
    }

    const getStatusIcon = (status: Status) => {
        switch (status) {
            case "New":
                return <Edit className="h-4 w-4" />
            case "InProgress":
                return <Clock className="h-4 w-4" />
            case "Done":
                return <CheckCircle2 className="h-4 w-4" />
            default:
                return <AlertTriangle className="h-4 w-4" />
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

    const getTaskStatusColor = (status: Status) => {
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent mb-4"></div>
                    <div className="text-white">Loading weekly report...</div>
                </div>
            </div>
        )
    }

    if (error || !weeklyReport) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <GlassEmptyState
                    icon={AlertTriangle}
                    title="Weekly Report Not Found"
                    description={error || "The requested weekly report could not be found."}
                    action={
                        <GlassButton onClick={() => router.push("/weekly-core-bugs")} glowColor="blue">
                            Back to Weekly Reports
                        </GlassButton>
                    }
                />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl">
                <div className="container flex h-16 items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                        <GlassButton
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/weekly-core-bugs')}
                            glowColor="blue"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Weekly Reports
                        </GlassButton>
                        <Separator orientation="vertical" className="h-6 bg-white/20" />
                        <div>
                            <h2 className="text-lg font-bold text-white">{weeklyReport.name}</h2>
                            <p className="text-sm text-gray-400">
                                {new Date(weeklyReport.weekStartDate).toLocaleDateString()} - {new Date(weeklyReport.weekEndDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(weeklyReport.status)} text-sm`}>
                            {getStatusIcon(weeklyReport.status)}
                            <span className="ml-1">{weeklyReport.status}</span>
                        </Badge>
                        <GlassButton
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const nextStatus = weeklyReport.status === "Draft" ? "InProgress" :
                                                weeklyReport.status === "InProgress" ? "Completed" : "Draft"
                                handleStatusUpdate(nextStatus)
                            }}
                            loading={updateStatusLoading}
                            glowColor="purple"
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            Update Status
                        </GlassButton>
                    </div>
                </div>
            </header>

            <div className="container py-6">
                {/* Statistics Overview */}
                <WeeklyStatsOverview
                    weeklyData={weeklyReport}
                    className="mb-8"
                />

                {/* Progress Overview */}
                <GlassCard className="p-6 mb-8" glowColor="purple">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Overall Progress</h3>
                            <div className="text-sm text-gray-400">
                                {weeklyReport.completedTasksCount}/{weeklyReport.totalTasksCount} tasks completed
                            </div>
                        </div>
                        <Progress value={weeklyReport.completionPercentage} className="h-3" />
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                                <div className="text-blue-400 font-medium">{weeklyReport.totalTasksCount - weeklyReport.completedTasksCount - weeklyReport.inProgressTasksCount}</div>
                                <div className="text-gray-400">New Tasks</div>
                            </div>
                            <div className="text-center">
                                <div className="text-yellow-400 font-medium">{weeklyReport.inProgressTasksCount}</div>
                                <div className="text-gray-400">In Progress</div>
                            </div>
                            <div className="text-center">
                                <div className="text-green-400 font-medium">{weeklyReport.completedTasksCount}</div>
                                <div className="text-gray-400">Completed</div>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <GlassSearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search bugs..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={severityFilter}
                            onChange={(e) => setSeverityFilter(e.target.value as BugSeverity | "all")}
                            className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="all">All Severities</option>
                            <option value="Minor">Minor</option>
                            <option value="Major">Major</option>
                            <option value="Critical">Critical</option>
                        </select>
                        <GlassButton
                            onClick={() => setShowAddBugsDialog(true)}
                            glowColor="green"
                            size="sm"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Bugs
                        </GlassButton>
                    </div>
                </div>

                {/* Bugs List */}
                {filteredBugs.length === 0 ? (
                    <GlassEmptyState
                        icon={Bug}
                        title="No Bugs Found"
                        description={
                            searchQuery || severityFilter !== "all"
                                ? "No bugs match your current filters."
                                : "This weekly report doesn't contain any bugs yet."
                        }
                        action={
                            <GlassButton
                                onClick={() => setShowAddBugsDialog(true)}
                                glowColor="green"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Bugs
                            </GlassButton>
                        }
                    />
                ) : (
                    <div className="space-y-4">
                        {filteredBugs.map((entry) => (
                            <GlassCard key={entry.coreBug.bugId} className="p-6" glowColor="blue">
                                <div className="space-y-4">
                                    {/* Bug Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge variant="outline" className="font-mono bg-red-500/10 border-red-400/30 text-red-300 text-xs">
                                                    {entry.coreBug.jiraKey}
                                                </Badge>
                                                <BugSeverityBadge severity={entry.coreBug.severity} />
                                                {entry.coreBug.jiraLink && (
                                                    <a
                                                        href={entry.coreBug.jiraLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-semibold text-white mb-1">
                                                {entry.coreBug.bugTitle}
                                            </h3>
                                            <p className="text-sm text-gray-400">
                                                {entry.coreBug.bugDescription}
                                            </p>
                                        </div>
                                        <GlassButton
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRemoveBug(entry.coreBug.bugId)}
                                            loading={removeBugsLoading}
                                            glowColor="red"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </GlassButton>
                                    </div>

                                    {/* Task Statistics */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center p-3 bg-white/5 rounded-lg">
                                            <div className="text-lg font-semibold text-white">{entry.totalTasksCount}</div>
                                            <div className="text-sm text-gray-400">Total Tasks</div>
                                        </div>
                                        <div className="text-center p-3 bg-white/5 rounded-lg">
                                            <div className="text-lg font-semibold text-yellow-400">{entry.inProgressTasksCount}</div>
                                            <div className="text-sm text-gray-400">In Progress</div>
                                        </div>
                                        <div className="text-center p-3 bg-white/5 rounded-lg">
                                            <div className="text-lg font-semibold text-green-400">{entry.completedTasksCount}</div>
                                            <div className="text-sm text-gray-400">Completed</div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Progress</span>
                                            <span className="text-white">{entry.completionPercentage.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={entry.completionPercentage} className="h-2" />
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Bugs Dialog */}
            <BugSelectionDialog
                isOpen={showAddBugsDialog}
                onClose={() => setShowAddBugsDialog(false)}
                onConfirm={handleAddBugs}
                mode="add"
                excludeBugIds={weeklyReport?.weeklyCoreBugEntries.map(entry => entry.bugId) || []}
                loading={addBugsLoading}
            />
        </div>
    )
}