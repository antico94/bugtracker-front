"use client"

import React, { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    AlertTriangle,
    MessageSquare,
    Play,
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
    SkipForward,
    Undo2
} from "lucide-react"
import { GlassButton } from "@/components/glass/glass-button"
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

export default function TaskDetailPage() {
    const router = useRouter()
    const params = useParams()
    const taskId = params.id as string

    const [stepNoteText, setStepNoteText] = useState("")
    const [generalNoteText, setGeneralNoteText] = useState("")
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["current-step"]))

    // Fetch task data from API
    const { data: task, loading, error, refetch } = useCustomTask(taskId)

    // Get mutation methods
    const {
        completeStep,
        makeDecision,
        addNote,
        completeStepLoading,
        makeDecisionLoading,
        addNoteLoading
    } = useCustomTasks()

    // Get relevant steps (completed + current + immediate next possibilities)
    const relevantSteps = useMemo(() => {
        if (!task?.taskSteps) return { completed: [], current: null, next: [] }

        const completedSteps = task.taskSteps
            .filter(step => step.status === "Done")
            .sort((a, b) => a.order - b.order)

        // Get the step indicated by currentStepId from backend
        let currentStep = task.taskSteps.find(step => step.taskStepId === task.currentStepId)
        
        // Defensive check: if the "current" step is already completed, find the actual next step
        if (currentStep && currentStep.status === "Done") {
            console.warn("Backend currentStepId points to completed step. Finding actual next step...")
            
            // If it's a decision step that's completed, find the next step based on the decision
            if (currentStep.isDecision && currentStep.decisionAnswer) {
                const nextStepId = currentStep.decisionAnswer === "Yes" 
                    ? currentStep.nextStepIfYes 
                    : currentStep.nextStepIfNo
                
                if (nextStepId) {
                    const nextStep = task.taskSteps.find(s => s.taskStepId === nextStepId)
                    if (nextStep && nextStep.status !== "Done") {
                        currentStep = nextStep
                    }
                }
            } else {
                // For non-decision completed steps, find the next incomplete step by order
                const sortedSteps = [...task.taskSteps].sort((a, b) => a.order - b.order)
                const nextIncompleteStep = sortedSteps.find(step => 
                    step.order > currentStep!.order && step.status !== "Done"
                )
                if (nextIncompleteStep) {
                    currentStep = nextIncompleteStep
                }
            }
        }

        let nextSteps: Array<{ step: any, condition: string }> = []
        if (currentStep?.isDecision && currentStep.status !== "Done") {
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

        // Check if note is required for this specific step
        const noteRequired = relevantSteps.current.requiresNote || 
            (relevantSteps.current.isTerminal && isNoDecisionTerminal(relevantSteps.current))
            
        if (noteRequired && !stepNoteText.trim()) {
            toast({
                title: "Note Required",
                description: "This step requires a note before completion.",
                variant: "destructive"
            })
            return
        }

        try {
            await completeStep({
                id: task.taskId,
                stepData: {
                    taskId: task.taskId,
                    taskStepId: relevantSteps.current.taskStepId,
                    notes: stepNoteText.trim() || undefined
                }
            })

            setStepNoteText("")
            await refetch() // Refresh task data

            toast({
                title: "Step Completed",
                description: relevantSteps.current.isTerminal ? "Task completed!" : "The step has been marked as complete.",
            })
        } catch (error) {
            console.error("Failed to complete step:", error)
            
            // Extract specific error message from API response
            let errorMessage = "Failed to complete step. Please try again."
            if (error instanceof Error) {
                if (error.message.includes("HTTP 400")) {
                    // Extract the detailed message after "HTTP 400: "
                    const messageMatch = error.message.match(/HTTP 400: (.+)/)
                    errorMessage = messageMatch ? messageMatch[1] : "Invalid request. Please check your input and try again."
                } else if (error.message.includes("HTTP")) {
                    errorMessage = error.message
                } else {
                    errorMessage = error.message
                }
            }
            
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            })
        }
    }

    const handleDecision = async (decision: "Yes" | "No") => {
        if (!relevantSteps.current || !task) return

        // Check if note is required for "No" decisions that lead to terminal steps
        if (decision === "No" && willLeadToTerminal(relevantSteps.current, decision) && !stepNoteText.trim()) {
            toast({
                title: "Note Required",
                description: "Please explain why this step cannot be completed.",
                variant: "destructive"
            })
            return
        }

        try {
            await makeDecision({
                id: task.taskId,
                decisionData: {
                    taskId: task.taskId,
                    taskStepId: relevantSteps.current.taskStepId,
                    decisionAnswer: decision,
                    notes: stepNoteText.trim() || undefined
                }
            })

            setStepNoteText("")
            await refetch() // Refresh task data

            toast({
                title: "Decision Recorded",
                description: `Decision "${decision}" has been recorded. Moving to next step.`,
            })
        } catch (error) {
            console.error("Failed to record decision:", error)
            
            // Extract specific error message from API response
            let errorMessage = "Failed to record decision. Please try again."
            if (error instanceof Error) {
                // Check if it's a known error message pattern
                if (error.message.includes("Decision has already been made")) {
                    errorMessage = "A decision has already been made for this step. Please refresh the page to see the current state."
                } else if (error.message.includes("HTTP 400")) {
                    // Extract the detailed message after "HTTP 400: "
                    const messageMatch = error.message.match(/HTTP 400: (.+)/)
                    errorMessage = messageMatch ? messageMatch[1] : "Invalid request. Please check your input and try again."
                } else if (error.message.includes("HTTP")) {
                    errorMessage = error.message
                } else {
                    errorMessage = error.message
                }
            }
            
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            })
        }
    }

    const handleAddNote = async () => {
        if (!task || !generalNoteText.trim()) return

        try {
            await addNote({
                id: task.taskId,
                note: {
                    taskId: task.taskId,
                    content: generalNoteText.trim(),
                    createdBy: "Current User" // In real app, get from auth context
                }
            })

            setGeneralNoteText("")
            await refetch() // Refresh task data

            toast({
                title: "Note Added",
                description: "Your note has been added to the task."
            })
        } catch (error) {
            console.error("Failed to add note:", error)
            
            // Extract specific error message from API response
            let errorMessage = "Failed to add note. Please try again."
            if (error instanceof Error) {
                if (error.message.includes("HTTP 400")) {
                    // Extract the detailed message after "HTTP 400: "
                    const messageMatch = error.message.match(/HTTP 400: (.+)/)
                    errorMessage = messageMatch ? messageMatch[1] : "Invalid request. Please check your input and try again."
                } else if (error.message.includes("HTTP")) {
                    errorMessage = error.message
                } else {
                    errorMessage = error.message
                }
            }
            
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            })
        }
    }

    const handleMoveToNextTask = () => {
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

    // Helper function to determine if a terminal step was reached via "No" decision
    const isNoDecisionTerminal = (step: any) => {
        // Logic to determine if this terminal step requires a note
        // For now, we'll make terminal steps NOT require notes by default
        // Only specific workflows that end with "No" should require notes
        return false // This can be enhanced based on step description or workflow type
    }

    // Helper function to check if a "No" decision will lead to a terminal step
    const willLeadToTerminal = (currentStep: any, decision: "Yes" | "No") => {
        if (!currentStep.isDecision) return false
        
        const nextStepId = decision === "Yes" ? currentStep.nextStepIfYes : currentStep.nextStepIfNo
        if (!nextStepId || !task?.taskSteps) return false
        
        const nextStep = task.taskSteps.find(s => s.taskStepId === nextStepId)
        return nextStep?.isTerminal || false
    }

    // Helper function to determine if notes should be required for current step
    const shouldRequireNotes = (step: any, decision?: "Yes" | "No") => {
        if (step.requiresNote) return true
        if (decision === "No" && willLeadToTerminal(step, decision)) return true
        return false
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
        let errorMessage = "Task not found"

        if (error) {
            // Handle specific API errors
            if (error.includes("400")) {
                errorMessage = "Invalid task ID. Please check the task URL or select a task from the task list."
            } else if (error.includes("404")) {
                errorMessage = "Task not found. It may have been deleted or you don't have access to it."
            } else {
                errorMessage = `Error loading task: ${error}`
            }
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <div className="text-red-400 mb-4">{errorMessage}</div>
                    <div className="space-y-2">
                        <GlassButton
                            variant="outline"
                            onClick={() => router.push('/tasks')}
                            className="w-full"
                            glowColor="blue"
                        >
                            Back to Tasks
                        </GlassButton>
                        {taskId && (
                            <p className="text-xs text-gray-500">Task ID: {taskId}</p>
                        )}
                    </div>
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
                            <GlassButton
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/tasks')}
                                glowColor="blue"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Tasks
                            </GlassButton>
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
                                <GlassButton
                                    onClick={handleMoveToNextTask}
                                    glowColor="purple"
                                >
                                    <SkipForward className="mr-2 h-4 w-4" />
                                    Move to Next Task
                                </GlassButton>
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
                                    {task.coreBug && (
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
                                    )}
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
                                    {relevantSteps.completed.length > 0 && (
                                        <div className="space-y-3">
                                            <Label className="text-sm text-gray-300">Completed Steps</Label>
                                            {relevantSteps.completed.map((step) => (
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
                                                        {step.decisionAnswer && (
                                                            <p className="text-xs text-cyan-300 mt-1">Decision: {step.decisionAnswer}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

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
                            {relevantSteps.current && !isTaskComplete && relevantSteps.current.status !== "Done" && (
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
                                                    {relevantSteps.current.decisionAnswer ? "Decision Made" : "Make Decision"}
                                                </Label>

                                                {/* Show decision if already made */}
                                                {relevantSteps.current.decisionAnswer ? (
                                                    <div className="p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                                                            <span className="font-medium text-green-300">Decision Already Made</span>
                                                        </div>
                                                        <p className="text-sm text-gray-200 mb-2">
                                                            Decision: <span className="font-medium text-cyan-300">{relevantSteps.current.decisionAnswer}</span>
                                                        </p>
                                                        {relevantSteps.current.notes && (
                                                            <p className="text-sm text-gray-300 italic">
                                                                Notes: "{relevantSteps.current.notes}"
                                                            </p>
                                                        )}
                                                        {relevantSteps.current.completedAt && (
                                                            <p className="text-xs text-gray-400 mt-2">
                                                                Completed: {new Date(relevantSteps.current.completedAt).toLocaleString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* Decision Buttons */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <GlassButton
                                                                onClick={() => handleDecision("Yes")}
                                                                disabled={makeDecisionLoading}
                                                                loading={makeDecisionLoading}
                                                                glowColor="green"
                                                                className="h-auto p-6 flex-col gap-2"
                                                            >
                                                                <CheckCircle2 className="h-8 w-8" />
                                                                <span className="font-semibold">Yes</span>
                                                                <span className="text-xs opacity-75">Confirm and proceed</span>
                                                            </GlassButton>
                                                            <GlassButton
                                                                onClick={() => handleDecision("No")}
                                                                disabled={makeDecisionLoading}
                                                                loading={makeDecisionLoading}
                                                                glowColor="red"
                                                                className="h-auto p-6 flex-col gap-2"
                                                            >
                                                                <XCircle className="h-8 w-8" />
                                                                <span className="font-semibold">No</span>
                                                                <span className="text-xs opacity-75">Reject and continue</span>
                                                            </GlassButton>
                                                        </div>

                                                        {/* Notes for Decision */}
                                                        <div className="space-y-2">
                                                            <Label className="text-sm text-gray-300">
                                                                Notes
                                                                <span className="text-yellow-400 ml-2 text-xs">
                                                                    (Required only if answering "No")
                                                                </span>
                                                            </Label>
                                                            <Textarea
                                                                value={stepNoteText}
                                                                onChange={(e) => setStepNoteText(e.target.value)}
                                                                placeholder="Add notes about your decision..."
                                                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                                                                rows={3}
                                                            />
                                                        </div>
                                                    </>
                                                )}
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
                                                        Notes {relevantSteps.current.requiresNote && <span className="text-red-400">*</span>}
                                                        {relevantSteps.current.isTerminal && !relevantSteps.current.requiresNote && (
                                                            <span className="text-gray-400 ml-2 text-xs">(Optional)</span>
                                                        )}
                                                    </Label>
                                                    <Textarea
                                                        value={stepNoteText}
                                                        onChange={(e) => setStepNoteText(e.target.value)}
                                                        placeholder="Add notes about this step..."
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                                                        rows={4}
                                                    />
                                                </div>

                                                <GlassButton
                                                    onClick={handleStepComplete}
                                                    disabled={completeStepLoading || (relevantSteps.current.requiresNote && !stepNoteText.trim())}
                                                    loading={completeStepLoading}
                                                    glowColor="emerald"
                                                    className="w-full h-12"
                                                >
                                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                                    Mark Step as Complete
                                                    {relevantSteps.current.isTerminal && (
                                                        <span className="ml-2 text-xs">(Final Step)</span>
                                                    )}
                                                </GlassButton>

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
                                            <GlassButton
                                                onClick={handleMoveToNextTask}
                                                glowColor="purple"
                                            >
                                                <SkipForward className="mr-2 h-4 w-4" />
                                                Move to Next Task
                                            </GlassButton>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Waiting for Next Step Message */}
                            {!isTaskComplete && relevantSteps.current && relevantSteps.current.status === "Done" && (
                                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                                    <CardContent className="p-8 text-center">
                                        <div className="space-y-4">
                                            <div className="p-4 bg-blue-500/20 rounded-full w-fit mx-auto">
                                                <Clock className="h-12 w-12 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-white mb-2">Step Complete - Processing...</h3>
                                                <p className="text-gray-300 mb-4">
                                                    The current step has been completed. The system is processing the workflow to determine the next step.
                                                </p>
                                                <div className="p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
                                                    <p className="text-sm text-yellow-300">
                                                        Please refresh the page or wait a moment for the next step to appear.
                                                    </p>
                                                </div>
                                            </div>
                                            <GlassButton
                                                onClick={() => window.location.reload()}
                                                glowColor="blue"
                                            >
                                                <Undo2 className="mr-2 h-4 w-4" />
                                                Refresh Page
                                            </GlassButton>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* No Current Step Message */}
                            {!isTaskComplete && !relevantSteps.current && (
                                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                                    <CardContent className="p-8 text-center">
                                        <div className="space-y-4">
                                            <div className="p-4 bg-gray-500/20 rounded-full w-fit mx-auto">
                                                <AlertTriangle className="h-12 w-12 text-gray-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-white mb-2">No Current Step</h3>
                                                <p className="text-gray-300">
                                                    There's no current step defined for this task. This may indicate a workflow configuration issue.
                                                </p>
                                            </div>
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
                                                value={generalNoteText}
                                                onChange={(e) => setGeneralNoteText(e.target.value)}
                                                placeholder="Add a note about this task..."
                                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                                                rows={3}
                                            />
                                            <GlassButton
                                                onClick={handleAddNote}
                                                disabled={!generalNoteText.trim() || addNoteLoading}
                                                loading={addNoteLoading}
                                                size="sm"
                                                glowColor="purple"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Note
                                            </GlassButton>
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