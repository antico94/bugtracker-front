// app/tasks/[id]/page.tsx
"use client"

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
    Edit3
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

// Define the page props interface for Next.js dynamic routes
interface TaskDetailPageProps {
    params: {
        id: string
    }
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
    const router = useRouter()
    const taskId = params.id // Get the ID from the URL params

    const [selectedStepId, setSelectedStepId] = useState<string | null>(null)
    const [noteText, setNoteText] = useState("")
    const [decisionAnswer, setDecisionAnswer] = useState<"Yes" | "No" | null>(null)
    const [showNoteDialog, setShowNoteDialog] = useState(false)
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["overview", "progress"]))

    // API calls
    const { data: task, loading, error, refetch } = useCustomTask(taskId)
    const {
        completeStep,
        makeDecision,
        addNote,
        completeStepLoading,
        makeDecisionLoading,
        addNoteLoading
    } = useCustomTasks()

    // Get current step
    const currentStep = useMemo(() => {
        if (!task?.currentStepId) return null
        return task.taskSteps?.find(step => step.taskStepId === task.currentStepId) || null
    }, [task?.currentStepId, task?.taskSteps])

    // Calculate progress
    const progressPercentage = task ? (task.completedStepsCount / task.totalStepsCount) * 100 : 0

    // Get next possible steps based on decision tree
    const getNextSteps = (stepId: string, decision?: "Yes" | "No") => {
        const step = task?.taskSteps?.find(s => s.taskStepId === stepId)
        if (!step) return []

        if (step.isDecision) {
            const nextSteps = []
            if (decision === "Yes" && step.nextStepIfYes) {
                const nextStep = task?.taskSteps?.find(s => s.taskStepId === step.nextStepIfYes)
                if (nextStep) nextSteps.push({ step: nextStep, condition: "Yes" })
            }
            if (decision === "No" && step.nextStepIfNo) {
                const nextStep = task?.taskSteps?.find(s => s.taskStepId === step.nextStepIfNo)
                if (nextStep) nextSteps.push({ step: nextStep, condition: "No" })
            }
            if (!decision) {
                if (step.nextStepIfYes) {
                    const yesStep = task?.taskSteps?.find(s => s.taskStepId === step.nextStepIfYes)
                    if (yesStep) nextSteps.push({ step: yesStep, condition: "Yes" })
                }
                if (step.nextStepIfNo) {
                    const noStep = task?.taskSteps?.find(s => s.taskStepId === step.nextStepIfNo)
                    if (noStep) nextSteps.push({ step: noStep, condition: "No" })
                }
            }
            return nextSteps
        }

        return []
    }

    const handleStepComplete = async () => {
        if (!currentStep || !task) return

        try {
            await completeStep({
                id: task.taskId,
                stepData: {
                    taskId: task.taskId,
                    taskStepId: currentStep.taskStepId,
                    notes: noteText || undefined
                }
            })
            setNoteText("")
            setShowNoteDialog(false)
            refetch() // Refresh the task data
            toast({
                title: "Step Completed",
                description: "The step has been marked as complete.",
            })
        } catch (error) {
            console.error("Failed to complete step:", error)
            toast({
                title: "Error",
                description: "Failed to complete step. Please try again.",
                variant: "destructive"
            })
        }
    }

    const handleDecision = async (decision: "Yes" | "No") => {
        if (!currentStep || !task) return

        try {
            await makeDecision({
                id: task.taskId,
                decisionData: {
                    taskId: task.taskId,
                    taskStepId: currentStep.taskStepId,
                    decisionAnswer: decision,
                    notes: noteText || undefined
                }
            })
            setDecisionAnswer(null)
            setNoteText("")
            setShowNoteDialog(false)
            refetch() // Refresh the task data
            toast({
                title: "Decision Recorded",
                description: `Decision "${decision}" has been recorded.`,
            })
        } catch (error) {
            console.error("Failed to make decision:", error)
            toast({
                title: "Error",
                description: "Failed to record decision. Please try again.",
                variant: "destructive"
            })
        }
    }

    const handleAddNote = async () => {
        if (!noteText.trim() || !task) return

        try {
            await addNote({
                id: task.taskId,
                note: {
                    taskId: task.taskId,
                    content: noteText,
                    createdBy: "Current User" // In a real app, this would come from auth context
                }
            })
            setNoteText("")
            refetch() // Refresh the task data
            toast({
                title: "Note Added",
                description: "Your note has been added to the task.",
            })
        } catch (error) {
            console.error("Failed to add note:", error)
            toast({
                title: "Error",
                description: "Failed to add note. Please try again.",
                variant: "destructive"
            })
        }
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

    // Rest of the component remains the same...
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
                                <p className="text-sm text-gray-400">Task ID: {taskId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(task.status)} text-sm`}>
                                {getStatusIcon(task.status)}
                                <span className="ml-1">{task.status}</span>
                            </Badge>
                        </div>
                    </div>
                </header>

                <div className="container py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Task Overview & Progress */}
                        <div className="space-y-6">
                            {/* Task Overview */}
                            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                                <CardHeader
                                    className="cursor-pointer"
                                    onClick={() => toggleSection("overview")}
                                >
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                            <Target className="h-5 w-5 text-blue-400" />
                                            Task Overview
                                        </CardTitle>
                                        {expandedSections.has("overview") ?
                                            <ChevronDown className="h-4 w-4 text-gray-400" /> :
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                        }
                                    </div>
                                </CardHeader>
                                {expandedSections.has("overview") && (
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
                                )}
                            </Card>

                            {/* Progress */}
                            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                                <CardHeader
                                    className="cursor-pointer"
                                    onClick={() => toggleSection("progress")}
                                >
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                            <Layers className="h-5 w-5 text-emerald-400" />
                                            Progress
                                        </CardTitle>
                                        {expandedSections.has("progress") ?
                                            <ChevronDown className="h-4 w-4 text-gray-400" /> :
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                        }
                                    </div>
                                </CardHeader>
                                {expandedSections.has("progress") && (
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

                                        {/* Step Summary */}
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-300">Step Summary</Label>
                                            <div className="space-y-1">
                                                {task.taskSteps?.map((step, index) => (
                                                    <div
                                                        key={step.taskStepId}
                                                        className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                                                            step.taskStepId === task.currentStepId
                                                                ? "bg-yellow-500/20 border border-yellow-400/30"
                                                                : step.status === "Done"
                                                                    ? "bg-green-500/10 border border-green-400/20"
                                                                    : "bg-white/5 border border-white/10"
                                                        }`}
                                                    >
                                                        <div className="flex-shrink-0">
                                                            {step.status === "Done" ? (
                                                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                                                            ) : step.taskStepId === task.currentStepId ? (
                                                                <Play className="h-4 w-4 text-yellow-400" />
                                                            ) : (
                                                                <div className="h-4 w-4 rounded-full border-2 border-gray-500" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-gray-200 truncate">{step.action}</p>
                                                            {step.isDecision && (
                                                                <p className="text-xs text-blue-400">Decision Point</p>
                                                            )}
                                                            {step.isTerminal && (
                                                                <p className="text-xs text-orange-400">Terminal Step</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>

                            {/* Notes */}
                            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                                <CardHeader
                                    className="cursor-pointer"
                                    onClick={() => toggleSection("notes")}
                                >
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 text-purple-400" />
                                            Notes ({task.taskNotes?.length || 0})
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
                                                onClick={handleAddNote}
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

                        {/* Right Column - Current Step & Decision Tree */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Current Step */}
                            {currentStep && (
                                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                                    <CardHeader className="bg-gradient-to-r from-yellow-600/10 to-orange-600/10 backdrop-blur-sm">
                                        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-yellow-400" />
                                            Current Step: {currentStep.action}
                                        </CardTitle>
                                        <CardDescription className="text-gray-300">
                                            {currentStep.isDecision ? "Decision Point" : "Action Step"} • Step {currentStep.order} of {task.totalStepsCount}
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
                                                <p className="text-gray-200">{currentStep.description}</p>
                                            </div>
                                        </div>

                                        {/* Step Actions */}
                                        {currentStep.isDecision ? (
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

                                                {/* Next Steps Preview */}
                                                <div className="mt-6 space-y-3">
                                                    <Label className="text-sm text-gray-300">Next Steps Based on Decision</Label>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {getNextSteps(currentStep.taskStepId).map(({ step: nextStep, condition }) => (
                                                            <div
                                                                key={`${nextStep.taskStepId}-${condition}`}
                                                                className={`p-3 rounded-lg border ${
                                                                    condition === "Yes"
                                                                        ? "bg-green-500/10 border-green-400/30"
                                                                        : "bg-red-500/10 border-red-400/30"
                                                                }`}
                                                            >
                                                                <div className="flex items-start gap-2">
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
                                                                    {nextStep.isTerminal && (
                                                                        <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-300 border-orange-400/40">
                                                                            Final
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-gray-200 mt-2">{nextStep.action}</p>
                                                                <p className="text-xs text-gray-400 mt-1">{nextStep.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Notes for Decision */}
                                                {(currentStep.requiresNote || showNoteDialog) && (
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-gray-300">
                                                            Notes {currentStep.requiresNote && <span className="text-red-400">*</span>}
                                                        </Label>
                                                        <Textarea
                                                            value={noteText}
                                                            onChange={(e) => setNoteText(e.target.value)}
                                                            placeholder="Add notes about your decision..."
                                                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                                                            rows={3}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <Label className="text-sm text-gray-300 flex items-center gap-2">
                                                    <CheckSquare className="h-4 w-4" />
                                                    Complete Step
                                                </Label>

                                                {/* Notes for Regular Step */}
                                                {(currentStep.requiresNote || currentStep.isTerminal) && (
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-gray-300">
                                                            Notes {(currentStep.requiresNote || currentStep.isTerminal) && <span className="text-red-400">*</span>}
                                                            {currentStep.isTerminal && (
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
                                                )}

                                                <Button
                                                    onClick={handleStepComplete}
                                                    disabled={(currentStep.requiresNote || currentStep.isTerminal) && !noteText.trim()}
                                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg h-12"
                                                >
                                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                                    Mark Step as Complete
                                                    {currentStep.isTerminal && (
                                                        <span className="ml-2 text-xs">(Final Step)</span>
                                                    )}
                                                </Button>

                                                {currentStep.isTerminal && (
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

                            {/* Decision Tree Visualization */}
                            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                                <CardHeader>
                                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                                        <GitBranch className="h-5 w-5 text-cyan-400" />
                                        Decision Tree & Workflow
                                    </CardTitle>
                                    <CardDescription className="text-gray-300">
                                        Visual representation of the task workflow and decision points
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-96">
                                        <div className="space-y-3">
                                            {task.taskSteps?.map((step, index) => (
                                                <div
                                                    key={step.taskStepId}
                                                    className={`relative flex items-start gap-4 p-4 rounded-lg transition-all duration-200 ${
                                                        step.taskStepId === task.currentStepId
                                                            ? "bg-yellow-500/20 border border-yellow-400/40 shadow-lg"
                                                            : step.status === "Done"
                                                                ? "bg-green-500/10 border border-green-400/20"
                                                                : "bg-white/5 border border-white/10 hover:bg-white/10"
                                                    }`}
                                                >
                                                    {/* Step connector line */}
                                                    {index < (task.taskSteps?.length || 0) - 1 && (
                                                        <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-600"></div>
                                                    )}

                                                    {/* Step icon */}
                                                    <div className="flex-shrink-0 mt-1">
                                                        {step.status === "Done" ? (
                                                            <CheckCircle2 className="h-6 w-6 text-green-400" />
                                                        ) : step.taskStepId === task.currentStepId ? (
                                                            <Play className="h-6 w-6 text-yellow-400" />
                                                        ) : step.isDecision ? (
                                                            <GitBranch className="h-6 w-6 text-cyan-400" />
                                                        ) : (
                                                            <div className="h-6 w-6 rounded-full border-2 border-gray-500 bg-gray-800"></div>
                                                        )}
                                                    </div>

                                                    {/* Step content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="font-medium text-gray-100">{step.action}</h4>
                                                            <div className="flex gap-1">
                                                                {step.isDecision && (
                                                                    <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-400/40">
                                                                        Decision
                                                                    </Badge>
                                                                )}
                                                                {step.isTerminal && (
                                                                    <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-300 border-orange-400/40">
                                                                        Terminal
                                                                    </Badge>
                                                                )}
                                                                {step.requiresNote && (
                                                                    <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-400/40">
                                                                        Note Required
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-400 mb-2">{step.description}</p>

                                                        {step.status === "Done" && step.completedAt && (
                                                            <div className="flex items-center gap-2 text-xs text-green-400">
                                                                <Calendar className="h-3 w-3" />
                                                                Completed: {new Date(step.completedAt).toLocaleString()}
                                                            </div>
                                                        )}

                                                        {step.notes && (
                                                            <div className="mt-2 p-2 bg-white/5 rounded border border-white/10">
                                                                <p className="text-sm text-gray-200">{step.notes}</p>
                                                            </div>
                                                        )}

                                                        {/* Decision branches */}
                                                        {step.isDecision && (
                                                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                {step.nextStepIfYes && (
                                                                    <div className="flex items-center gap-2 text-xs text-green-400">
                                                                        <ArrowRight className="h-3 w-3" />
                                                                        <span>Yes → Step {task.taskSteps?.find(s => s.taskStepId === step.nextStepIfYes)?.order}</span>
                                                                    </div>
                                                                )}
                                                                {step.nextStepIfNo && (
                                                                    <div className="flex items-center gap-2 text-xs text-red-400">
                                                                        <ArrowRight className="h-3 w-3" />
                                                                        <span>No → Step {task.taskSteps?.find(s => s.taskStepId === step.nextStepIfNo)?.order}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Step number */}
                                                    <div className="flex-shrink-0">
                                                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-medium text-gray-300">
                                                            {step.order}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
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