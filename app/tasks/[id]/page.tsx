import React, { useState, useMemo } from "react"
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Clock,
    AlertTriangle,
    FileText,
    MessageSquare,
    Play,
    Pause,
    RotateCcw,
    Save,
    ExternalLink,
    Target,
    GitBranch,
    MapPin,
    Lightbulb,
    CheckSquare,
    XCircle,
    Info,
    User,
    Calendar,
    Layers,
    ChevronRight,
    ChevronDown,
    Plus,
    Edit3,
    SkipForward,
    Undo2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCustomTask, useCustomTasks } from "@/hooks/use-custom-tasks"
import { Status } from "@/types"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

// Mock data structure - replace with actual props in your implementation
const mockTask = {
    taskId: "123e4567-e89b-12d3-a456-426614174000",
    taskTitle: "Verify Bug Reproduction in IRT v2024.1.0",
    taskDescription: "Investigate and verify if the reported bug can be reproduced in the latest IRT version",
    status: "InProgress",
    createdAt: "2024-01-15T10:30:00Z",
    currentStepId: "step-2",
    completedStepsCount: 1,
    totalStepsCount: 5,
    coreBug: {
        bugId: "bug-1",
        bugTitle: "User authentication fails on mobile devices",
        jiraKey: "BUG-1234",
        jiraLink: "https://company.atlassian.net/browse/BUG-1234",
        severity: 0
    },
    productName: "Interactive Response Technology",
    productVersion: "2024.1.0",
    productType: "InteractiveResponseTechnology",
    taskSteps: [
        {
            taskStepId: "step-1",
            action: "Check if preconditions apply",
            description: "Verify that the environment meets all preconditions for bug reproduction",
            order: 1,
            isDecision: false,
            isAutoCheck: false,
            isTerminal: false,
            requiresNote: false,
            status: "Done",
            completedAt: "2024-01-15T11:00:00Z",
            notes: "Environment checked and all preconditions are met"
        },
        {
            taskStepId: "step-2",
            action: "Do the preconditions apply?",
            description: "Based on your verification, do the preconditions apply to this bug?",
            order: 2,
            isDecision: true,
            isAutoCheck: false,
            isTerminal: false,
            requiresNote: false,
            status: "New",
            nextStepIfYes: "step-3",
            nextStepIfNo: "step-5"
        },
        {
            taskStepId: "step-3",
            action: "Attempt to reproduce the bug",
            description: "Follow the reproduction steps and try to replicate the reported issue",
            order: 3,
            isDecision: false,
            isAutoCheck: false,
            isTerminal: false,
            requiresNote: true,
            status: "New"
        },
        {
            taskStepId: "step-4",
            action: "Does the bug reproduce?",
            description: "Were you able to successfully reproduce the bug?",
            order: 4,
            isDecision: true,
            isAutoCheck: false,
            isTerminal: false,
            requiresNote: false,
            status: "New",
            nextStepIfYes: "step-6",
            nextStepIfNo: "step-7"
        },
        {
            taskStepId: "step-5",
            action: "Mark bug as Invalid - Preconditions not met",
            description: "Close the bug as invalid since preconditions do not apply",
            order: 5,
            isDecision: false,
            isAutoCheck: false,
            isTerminal: true,
            requiresNote: true,
            status: "New"
        },
        {
            taskStepId: "step-6",
            action: "Confirm bug and create reproduction guide",
            description: "Document the reproduction steps and confirm the bug is valid",
            order: 6,
            isDecision: false,
            isAutoCheck: false,
            isTerminal: true,
            requiresNote: true,
            status: "New"
        },
        {
            taskStepId: "step-7",
            action: "Mark bug as Cannot Reproduce",
            description: "Close the bug as cannot reproduce with detailed notes",
            order: 7,
            isDecision: false,
            isAutoCheck: false,
            isTerminal: true,
            requiresNote: true,
            status: "New"
        }
    ],
    taskNotes: [
        {
            taskNoteId: "note-1",
            content: "Initial analysis looks good, environment is properly set up",
            createdAt: "2024-01-15T10:45:00Z",
            createdBy: "John Developer"
        }
    ]
}

export default function EnhancedTaskDetailPage() {
    const router = useRouter()
    const [noteText, setNoteText] = useState("")
    const [decisionAnswer, setDecisionAnswer] = useState<"Yes" | "No" | null>(null)
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["current-step"]))

    // In real implementation, get this from useCustomTask(taskId)
    const task = mockTask
    const loading = false
    const error = null

    // Get relevant steps (completed + current + immediate next possibilities)
    const relevantSteps = useMemo(() => {
        if (!task?.taskSteps) return []

        const completedSteps = task.taskSteps
            .filter(step => step.status === "Done")
            .sort((a, b) => a.order - b.order)

        const currentStep = task.taskSteps.find(step => step.taskStepId === task.currentStepId)

        let nextSteps = []
        if (currentStep?.isDecision) {
            // For decision steps, show both possible next steps
            if (currentStep.nextStepIfYes) {
                const yesStep = task.taskSteps.find(s => s.taskStepId === currentStep.nextStepIfYes)
                if (yesStep) nextSteps.push({ step: yesStep, condition: "Yes" })
            }
            if (currentStep.nextStepIfNo) {
                const noStep = task.taskSteps.find(s => s.taskStepId === currentStep.nextStepIfNo)
                if (noStep) nextSteps.push({ step: noStep, condition: "No" })
            }
        }

        return {
            completed: completedSteps,
            current: currentStep,
            next: nextSteps
        }
    }, [task?.taskSteps, task?.currentStepId])

    // Calculate progress based on relevant steps
    const progressPercentage = task ? (task.completedStepsCount / task.totalStepsCount) * 100 : 0

    const handleStepComplete = async () => {
        if (!relevantSteps.current || !task) return

        // Check if terminal step requires note
        if (relevantSteps.current.isTerminal && !noteText.trim()) {
            toast({
                title: "Note Required",
                description: "Terminal steps require a note before completion.",
                variant: "destructive"
            })
            return
        }

        try {
            // Simulate API call
            console.log("Completing step:", {
                taskId: task.taskId,
                stepId: relevantSteps.current.taskStepId,
                notes: noteText
            })

            setNoteText("")
            toast({
                title: "Step Completed",
                description: "The step has been marked as complete.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to complete step. Please try again.",
                variant: "destructive"
            })
        }
    }

    const handleDecision = async (decision: "Yes" | "No") => {
        if (!relevantSteps.current || !task) return

        try {
            // Simulate API call
            console.log("Making decision:", {
                taskId: task.taskId,
                stepId: relevantSteps.current.taskStepId,
                decision,
                notes: noteText
            })

            setDecisionAnswer(null)
            setNoteText("")
            toast({
                title: "Decision Recorded",
                description: `Decision "${decision}" has been recorded.`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to record decision. Please try again.",
                variant: "destructive"
            })
        }
    }

    const handleGoBack = (stepId: string) => {
        // In real implementation, this would reset all subsequent steps
        console.log("Going back to step:", stepId)
        toast({
            title: "Step Reset",
            description: "Subsequent steps have been reset.",
        })
    }

    const handleMoveToNextTask = () => {
        // In real implementation, find next available task
        router.push('/tasks')
        toast({
            title: "Moving to Next Task",
            description: "Looking for the next available task...",
        })
    }

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections)
        if (newExpanded.has(section)) {
            newExpanded.delete(section)
        } else {
            newExpanded.add(section)
        }
        setExpandedSections(newExpanded)
    }

    const getStatusIcon = (status: Status) => {
        switch (status) {
            case "New":
                return <Clock className="h-4 w-4 text-blue-400" />
            case "InProgress":
                return <Play className="h-4 w-4 text-yellow-400" />
            case "Done":
                return <CheckCircle2 className="h-4 w-4 text-green-400" />
            default:
                return <AlertTriangle className="h-4 w-4 text-gray-400" />
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent mb-4"></div>
                    <div className="text-white">Loading task details...</div>
                </div>
            </div>
        )
    }

    if (error || !task) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <div className="text-red-400 mb-4">Error loading task: {error || "Task not found"}</div>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/tasks')}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                        Back to Tasks
                    </Button>
                </div>
            </div>
        )
    }

    const isTaskComplete = task.status === "Done"

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl">
                    <div className="container flex h-16 items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/tasks')}
                                className="text-gray-300 hover:text-white hover:bg-white/10"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Tasks
                            </Button>
                            <Separator orientation="vertical" className="h-6 bg-white/20" />
                            <div>
                                <h2 className="text-lg font-bold text-white">{task.taskTitle}</h2>
                                <p className="text-sm text-gray-400">Task Progress: {task.completedStepsCount}/{task.totalStepsCount} steps</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(task.status)} text-sm`}>
                                {getStatusIcon(task.status)}
                                <span className="ml-1">{task.status}</span>
                            </Badge>
                            {isTaskComplete && (
                                <Button
                                    onClick={handleMoveToNextTask}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                                >
                                    <SkipForward className="mr-2 h-4 w-4" />
                                    Move to Next Task
                                </Button>
                            )}
                        </div>
                    </div>
                </header>

                <div className="container py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Task Overview & Progress */}
                        <div className="space-y-6">
                            {/* Task Overview */}
                            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Target className="h-5 w-5 text-blue-400" />
                                        Task Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm text-gray-300">Description</Label>
                                        <p className="text-sm text-gray-200 bg-white/5 p-3 rounded-lg border border-white/10">
                                            {task.taskDescription}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-400">Product</Label>
                                            <p className="text-sm text-gray-200">{task.productName}</p>
                                            <p className="text-xs text-gray-400">v{task.productVersion}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-400">Created</Label>
                                            <p className="text-sm text-gray-200">{new Date(task.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {/* Related Bug */}
                                    <div className="space-y-2">
                                        <Label className="text-sm text-gray-300">Related Bug</Label>
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className="font-mono bg-red-500/10 border-red-400/30 text-red-300 text-xs">
                                                    {task.coreBug.jiraKey}
                                                </Badge>
                                                {task.coreBug.jiraLink && (
                                                    <a
                                                        href={task.coreBug.jiraLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-200">{task.coreBug.bugTitle}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Relevant Progress Path */}
                            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Layers className="h-5 w-5 text-emerald-400" />
                                        Progress Path
                                    </CardTitle>
                                    <CardDescription className="text-gray-300">
                                        Showing completed steps and current step only
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-300">Overall Progress</span>
                                            <span className="text-gray-300 font-medium">
                                                {task.completedStepsCount}/{task.totalStepsCount} steps
                                            </span>
                                        </div>
                                        <Progress value={progressPercentage} className="h-3" />
                                        <div className="text-xs text-gray-400">
                                            {progressPercentage.toFixed(0)}% complete
                                        </div>
                                    </div>

                                    {/* Completed Steps */}
                                    <div className="space-y-3">
                                        <Label className="text-sm text-gray-300">Completed Steps</Label>
                                        {relevantSteps.completed.map((step, index) => (
                                            <div
                                                key={step.taskStepId}
                                                className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-400/20 rounded-lg"
                                            >
                                                <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-200 font-medium">{step.action}</p>
                                                    <p className="text-xs text-gray-400">
                                                        Completed: {step.completedAt ? new Date(step.completedAt).toLocaleString() : 'Unknown'}
                                                    </p>
                                                    {step.notes && (
                                                        <p className="text-xs text-gray-300 mt-1 italic">"{step.notes}"</p>
                                                    )}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleGoBack(step.taskStepId)}
                                                    className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                                                >
                                                    <Undo2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Current Step */}
                                    {relevantSteps.current && (
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-300">Current Step</Label>
                                            <div className="p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Play className="h-4 w-4 text-yellow-400" />
                                                    <p className="text-sm text-white font-medium">{relevantSteps.current.action}</p>
                                                    {relevantSteps.current.isDecision && (
                                                        <Badge className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-400/30">
                                                            Decision
                                                        </Badge>
                                                    )}
                                                    {relevantSteps.current.isTerminal && (
                                                        <Badge className="text-xs bg-orange-500/20 text-orange-300 border-orange-400/30">
                                                            Final
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-300">{relevantSteps.current.description}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Next Steps Preview */}
                                    {relevantSteps.next.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-300">Possible Next Steps</Label>
                                            <div className="space-y-2">
                                                {relevantSteps.next.map(({ step, condition }) => (
                                                    <div
                                                        key={`${step.taskStepId}-${condition}`}
                                                        className={`p-2 rounded-lg border ${
                                                            condition === "Yes"
                                                                ? "bg-green-500/10 border-green-400/30"
                                                                : "bg-red-500/10 border-red-400/30"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-xs ${
                                                                    condition === "Yes"
                                                                        ? "bg-green-500/20 text-green-300 border-green-400/40"
                                                                        : "bg-red-500/20 text-red-300 border-red-400/40"
                                                                }`}
                                                            >
                                                                If {condition}
                                                            </Badge>
                                                            {step.isTerminal && (
                                                                <Badge className="text-xs bg-orange-500/20 text-orange-300 border-orange-400/40">
                                                                    Final
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-200">{step.action}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Current Step Action */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Current Step Action */}
                            {relevantSteps.current && !isTaskComplete && (
                                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                                    <CardHeader className="bg-gradient-to-r from-yellow-600/10 to-orange-600/10 backdrop-blur-sm">
                                        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-yellow-400" />
                                            Current Step: {relevantSteps.current.action}
                                        </CardTitle>
                                        <CardDescription className="text-gray-300">
                                            {relevantSteps.current.isDecision ? "Decision Point" : "Action Step"} •
                                            Step {relevantSteps.current.order} of {task.totalStepsCount}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        {/* Step Description */}
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-300 flex items-center gap-2">
                                                <Info className="h-4 w-4" />
                                                Description
                                            </Label>
                                            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                                <p className="text-gray-200">{relevantSteps.current.description}</p>
                                            </div>
                                        </div>

                                        {/* Step Actions */}
                                        {relevantSteps.current.isDecision ? (
                                            <div className="space-y-4">
                                                <Label className="text-sm text-gray-300 flex items-center gap-2">
                                                    <GitBranch className="h-4 w-4" />
                                                    Make Decision
                                                </Label>

                                                {/* Decision Buttons */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Button
                                                        onClick={() => handleDecision("Yes")}
                                                        className="h-auto p-6 bg-green-600/20 hover:bg-green-600/30 border border-green-500/40 text-green-200 hover:text-green-100 transition-all duration-200 flex flex-col items-center gap-2"
                                                    >
                                                        <CheckCircle2 className="h-8 w-8" />
                                                        <span className="font-semibold">Yes</span>
                                                        <span className="text-xs opacity-75">Confirm and proceed</span>
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDecision("No")}
                                                        className="h-auto p-6 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-200 hover:text-red-100 transition-all duration-200 flex flex-col items-center gap-2"
                                                    >
                                                        <XCircle className="h-8 w-8" />
                                                        <span className="font-semibold">No</span>
                                                        <span className="text-xs opacity-75">Reject and continue</span>
                                                    </Button>
                                                </div>

                                                {/* Notes for Decision */}
                                                <div className="space-y-2">
                                                    <Label className="text-sm text-gray-300">
                                                        Notes {relevantSteps.current.requiresNote && <span className="text-red-400">*</span>}
                                                    </Label>
                                                    <Textarea
                                                        value={noteText}
                                                        onChange={(e) => setNoteText(e.target.value)}
                                                        placeholder="Add notes about your decision..."
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <Label className="text-sm text-gray-300 flex items-center gap-2">
                                                    <CheckSquare className="h-4 w-4" />
                                                    Complete Step
                                                </Label>

                                                {/* Notes for Regular Step */}
                                                <div className="space-y-2">
                                                    <Label className="text-sm text-gray-300">
                                                        Notes {(relevantSteps.current.requiresNote || relevantSteps.current.isTerminal) && <span className="text-red-400">*</span>}
                                                        {relevantSteps.current.isTerminal && (
                                                            <span className="text-orange-400 ml-2">(Required for terminal step)</span>
                                                        )}
                                                    </Label>
                                                    <Textarea
                                                        value={noteText}
                                                        onChange={(e) => setNoteText(e.target.value)}
                                                        placeholder="Add notes about this step..."
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                                                        rows={4}
                                                    />
                                                </div>

                                                <Button
                                                    onClick={handleStepComplete}
                                                    disabled={(relevantSteps.current.requiresNote || relevantSteps.current.isTerminal) && !noteText.trim()}
                                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg h-12"
                                                >
                                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                                    Mark Step as Complete
                                                    {relevantSteps.current.isTerminal && (
                                                        <span className="ml-2 text-xs">(Final Step)</span>
                                                    )}
                                                </Button>

                                                {relevantSteps.current.isTerminal && (
                                                    <div className="p-3 bg-orange-500/10 border border-orange-400/30 rounded-lg">
                                                        <div className="flex items-center gap-2 text-orange-300">
                                                            <Lightbulb className="h-4 w-4" />
                                                            <span className="font-medium">Terminal Step</span>
                                                        </div>
                                                        <p className="text-sm text-orange-200 mt-1">
                                                            This is the final step in this workflow. Completing it will finish the task.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Task Complete Message */}
                            {isTaskComplete && (
                                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                                    <CardContent className="p-8 text-center">
                                        <div className="space-y-4">
                                            <div className="p-4 bg-green-500/20 rounded-full w-fit mx-auto">
                                                <CheckCircle2 className="h-12 w-12 text-green-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-white mb-2">Task Completed!</h3>
                                                <p className="text-gray-300">
                                                    This task has been successfully completed. All steps have been finished.
                                                </p>
                                            </div>
                                            <Button
                                                onClick={handleMoveToNextTask}
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                                            >
                                                <SkipForward className="mr-2 h-4 w-4" />
                                                Move to Next Task
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Notes Section */}
                            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                                <CardHeader
                                    className="cursor-pointer"
                                    onClick={() => toggleSection("notes")}
                                >
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 text-purple-400" />
                                            Task Notes ({task.taskNotes?.length || 0})
                                        </CardTitle>
                                        {expandedSections.has("notes") ?
                                            <ChevronDown className="h-4 w-4 text-gray-400" /> :
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                        }
                                    </div>
                                </CardHeader>
                                {expandedSections.has("notes") && (
                                    <CardContent className="space-y-4">
                                        {/* Add Note */}
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-300">Add Note</Label>
                                            <Textarea
                                                value={noteText}
                                                onChange={(e) => setNoteText(e.target.value)}
                                                placeholder="Add a note about this task..."
                                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                                                rows={3}
                                            />
                                            <Button
                                                onClick={() => {
                                                    console.log("Adding note:", noteText)
                                                    setNoteText("")
                                                    toast({ title: "Note Added", description: "Your note has been added to the task." })
                                                }}
                                                disabled={!noteText.trim()}
                                                size="sm"
                                                className="bg-purple-600 hover:bg-purple-700"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Note
                                            </Button>
                                        </div>

                                        {/* Notes List */}
                                        {task.taskNotes && task.taskNotes.length > 0 && (
                                            <div className="space-y-3">
                                                <Label className="text-sm text-gray-300">Previous Notes</Label>
                                                <ScrollArea className="h-40">
                                                    <div className="space-y-3">
                                                        {task.taskNotes.map((note) => (
                                                            <div key={note.taskNoteId} className="p-3 bg-white/5 rounded-lg border border-white/10">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <User className="h-3 w-3 text-gray-400" />
                                                                    <span className="text-xs text-gray-400">{note.createdBy}</span>
                                                                    <span className="text-xs text-gray-500">•</span>
                                                                    <span className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleString()}</span>
                                                                </div>
                                                                <p className="text-sm text-gray-200">{note.content}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>
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