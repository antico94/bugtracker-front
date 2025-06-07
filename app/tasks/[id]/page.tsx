"use client"

import React, { useState } from "react"
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
    Info,
    Layers,
    CheckSquare,
    XCircle,
    SkipForward,
    Undo2,
    Lightbulb
} from "lucide-react"
import { GlassButton } from "@/components/glass/glass-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCustomTask } from "@/hooks/use-custom-tasks"
import { useWorkflowState } from "@/hooks/use-workflow-state"
import { Status } from "@/types"
import { useRouter } from "next/navigation"

export default function TaskDetailPageSimplified() {
    const router = useRouter()
    const params = useParams()
    const taskId = params.id as string

    const [stepNoteText, setStepNoteText] = useState("")

    // Get basic task data (for display info only)
    const { data: task, loading: taskLoading, error: taskError } = useCustomTask(taskId)

    // Get workflow state from backend (single source of truth)
    const {
        workflowState,
        isLoading: workflowLoading,
        isComplete,
        hasError: workflowError,
        errorMessage,
        currentStep,
        availableActions,
        completedSteps,
        progressPercentage,
        totalSteps,
        completedStepsCount,
        currentStepRequiresNote,
        isDecisionStep,
        isTerminalStep,
        decisionActions,
        completeAction,
        completeStep,
        makeDecision,
        isExecutingAction
    } = useWorkflowState(taskId)

    const handleStepComplete = async () => {
        if (!currentStep) return

        // Check if note is required
        if (currentStepRequiresNote && !stepNoteText.trim()) {
            return // Let validation handle this in the hook
        }

        await completeStep(stepNoteText.trim() || undefined)
        setStepNoteText("")
    }

    const handleDecision = async (decision: "Yes" | "No") => {
        if (!currentStep) return

        // Check if note is required for "No" decisions leading to terminal steps
        if (decision === "No" && !stepNoteText.trim()) {
            // Let the backend validate this - it has the workflow logic
        }

        await makeDecision(decision, stepNoteText.trim() || undefined)
        setStepNoteText("")
    }

    const handleMoveToNextTask = () => {
        router.push('/tasks')
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

    // Loading state
    if (taskLoading || workflowLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent mb-4"></div>
                    <div className="text-white">Loading task details...</div>
                </div>
            </div>
        )
    }

    // Error state
    if (taskError || workflowError || !task) {
        const displayError = taskError || errorMessage || "Task not found"
        
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <div className="text-red-400 mb-4">{displayError}</div>
                    <GlassButton
                        variant="outline"
                        onClick={() => router.push('/tasks')}
                        className="w-full"
                        glowColor="blue"
                    >
                        Back to Tasks
                    </GlassButton>
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
                                <p className="text-sm text-gray-400">Task Progress: {completedStepsCount}/{totalSteps} steps</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(task.status)} text-sm`}>
                                {getStatusIcon(task.status)}
                                <span className="ml-1">{workflowState?.status || task.status}</span>
                            </Badge>
                            {isComplete && (
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

                <div className="container py-8">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        {/* Left Column - Task Overview & Progress */}
                        <div className="xl:col-span-1 space-y-6">
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

                                    {/* Workflow Info */}
                                    {workflowState && (
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-300">Workflow</Label>
                                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                                <p className="text-sm text-gray-200">{workflowState.workflowName}</p>
                                                <p className="text-xs text-gray-400">Status: {workflowState.status}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Progress Path */}
                            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Layers className="h-5 w-5 text-emerald-400" />
                                        Progress Path
                                    </CardTitle>
                                    <CardDescription className="text-gray-300">
                                        Workflow-driven progress tracking
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-300">Overall Progress</span>
                                            <span className="text-gray-300 font-medium">
                                                {completedStepsCount}/{totalSteps} steps
                                            </span>
                                        </div>
                                        <Progress value={progressPercentage} className="h-3" />
                                        <div className="text-xs text-gray-400">
                                            {progressPercentage.toFixed(0)}% complete
                                        </div>
                                    </div>

                                    {/* Completed Steps */}
                                    {completedSteps.length > 0 && (
                                        <div className="space-y-3">
                                            <Label className="text-sm text-gray-300">Completed Steps</Label>
                                            {completedSteps
                                                .filter((step, index, arr) => 
                                                    arr.findIndex(s => s.stepId === step.stepId) === index
                                                )
                                                .map((step, index) => (
                                                <div
                                                    key={`completed-${step.stepId}-${index}`}
                                                    className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-400/20 rounded-lg"
                                                >
                                                    <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-200 font-medium">{step.name}</p>
                                                        <p className="text-xs text-gray-400">Step {step.order}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Current Step */}
                                    {currentStep && (
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-300">Current Step</Label>
                                            <div className="p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Play className="h-4 w-4 text-yellow-400" />
                                                    <p className="text-sm text-white font-medium">{currentStep.name}</p>
                                                    {isDecisionStep && (
                                                        <Badge className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-400/30">
                                                            Decision
                                                        </Badge>
                                                    )}
                                                    {isTerminalStep && (
                                                        <Badge className="text-xs bg-orange-500/20 text-orange-300 border-orange-400/30">
                                                            Final
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-300">{currentStep.description}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Current Step Action */}
                        <div className="xl:col-span-3 space-y-8">
                            {/* Current Step Action */}
                            {currentStep && !isComplete && (
                                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl border-l-4 border-l-yellow-400">
                                    <CardHeader className="bg-gradient-to-r from-yellow-600/15 to-orange-600/15 backdrop-blur-sm border-b border-white/10">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-yellow-400/20 rounded-lg">
                                                        <MapPin className="h-6 w-6 text-yellow-400" />
                                                    </div>
                                                    {currentStep.name}
                                                </CardTitle>
                                                <CardDescription className="text-gray-300 text-base">
                                                    {isDecisionStep ? "🔀 Decision Point" : "⚡ Action Step"} • 
                                                    Step {currentStep.order} of {totalSteps}
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isDecisionStep && (
                                                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30 px-3 py-1">
                                                        Decision Required
                                                    </Badge>
                                                )}
                                                {isTerminalStep && (
                                                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30 px-3 py-1">
                                                        Final Step
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-8">
                                        {/* Step Description */}
                                        <div className="space-y-4">
                                            <Label className="text-lg font-semibold text-white flex items-center gap-3">
                                                <div className="p-1.5 bg-blue-400/20 rounded-lg">
                                                    <Info className="h-5 w-5 text-blue-400" />
                                                </div>
                                                Step Description
                                            </Label>
                                            <div className="p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/15 shadow-lg">
                                                <p className="text-gray-100 text-base leading-relaxed">{currentStep.description}</p>
                                            </div>
                                        </div>

                                        {/* Step Actions */}
                                        {isDecisionStep ? (
                                            <div className="space-y-6">
                                                <Label className="text-lg font-semibold text-white flex items-center gap-3">
                                                    <div className="p-1.5 bg-purple-400/20 rounded-lg">
                                                        <GitBranch className="h-5 w-5 text-purple-400" />
                                                    </div>
                                                    Make Your Decision
                                                </Label>

                                                <div className="space-y-6">
                                                    {/* Decision Buttons */}
                                                    <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto">
                                                        <GlassButton
                                                            variant="workflow-decision"
                                                            onClick={() => handleDecision("Yes")}
                                                            disabled={isExecutingAction}
                                                            loading={isExecutingAction}
                                                            glowColor="green"
                                                        >
                                                            <CheckCircle2 className="h-8 w-8" />
                                                            <span className="font-semibold text-lg">Yes</span>
                                                            <span className="text-xs opacity-75">Confirm and proceed</span>
                                                        </GlassButton>
                                                        <GlassButton
                                                            variant="workflow-decision"
                                                            onClick={() => handleDecision("No")}
                                                            disabled={isExecutingAction}
                                                            loading={isExecutingAction}
                                                            glowColor="red"
                                                        >
                                                            <XCircle className="h-8 w-8" />
                                                            <span className="font-semibold text-lg">No</span>
                                                            <span className="text-xs opacity-75">Reject and continue</span>
                                                        </GlassButton>
                                                    </div>

                                                    {/* Notes for Decision */}
                                                    <div className="space-y-4">
                                                        <Label className="text-base font-medium text-white flex items-center gap-3">
                                                            <div className="p-1.5 bg-yellow-400/20 rounded-lg">
                                                                <MessageSquare className="h-4 w-4 text-yellow-400" />
                                                            </div>
                                                            Notes
                                                            {currentStepRequiresNote && (
                                                                <span className="text-red-400 text-sm">*Required</span>
                                                            )}
                                                        </Label>
                                                        <Textarea
                                                            value={stepNoteText}
                                                            onChange={(e) => setStepNoteText(e.target.value)}
                                                            placeholder="Add notes about your decision..."
                                                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none min-h-[100px] text-base"
                                                            rows={4}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <Label className="text-lg font-semibold text-white flex items-center gap-3">
                                                    <div className="p-1.5 bg-emerald-400/20 rounded-lg">
                                                        <CheckSquare className="h-5 w-5 text-emerald-400" />
                                                    </div>
                                                    Complete This Step
                                                </Label>

                                                {/* Notes for Regular Step */}
                                                <div className="space-y-4">
                                                    <Label className="text-base font-medium text-white flex items-center gap-3">
                                                        <div className="p-1.5 bg-blue-400/20 rounded-lg">
                                                            <MessageSquare className="h-4 w-4 text-blue-400" />
                                                        </div>
                                                        Notes 
                                                        {currentStepRequiresNote ? (
                                                            <span className="text-red-400 text-sm">*Required</span>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm font-normal">(Optional)</span>
                                                        )}
                                                    </Label>
                                                    <Textarea
                                                        value={stepNoteText}
                                                        onChange={(e) => setStepNoteText(e.target.value)}
                                                        placeholder="Add notes about this step..."
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none min-h-[120px] text-base"
                                                        rows={5}
                                                    />
                                                </div>

                                                <GlassButton
                                                    variant="workflow-action"
                                                    onClick={handleStepComplete}
                                                    disabled={isExecutingAction || (currentStepRequiresNote && !stepNoteText.trim())}
                                                    loading={isExecutingAction}
                                                    glowColor="emerald"
                                                    className="h-12"
                                                >
                                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                                    Mark Step as Complete
                                                    {isTerminalStep && (
                                                        <span className="ml-2 text-xs">(Final Step)</span>
                                                    )}
                                                </GlassButton>

                                                {isTerminalStep && (
                                                    <div className="p-6 bg-gradient-to-br from-orange-500/15 to-amber-500/10 border border-orange-400/30 rounded-xl shadow-lg">
                                                        <div className="flex items-center gap-3 text-orange-300 mb-3">
                                                            <div className="p-2 bg-orange-400/20 rounded-lg">
                                                                <Lightbulb className="h-5 w-5" />
                                                            </div>
                                                            <span className="font-semibold text-lg">Final Step</span>
                                                        </div>
                                                        <p className="text-base text-orange-200 leading-relaxed">
                                                            This is the final step in this workflow. Completing it will finish the entire task.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Task Complete Message */}
                            {isComplete && (
                                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                                    <CardContent className="p-8 text-center">
                                        <div className="space-y-4">
                                            <div className="p-4 bg-green-500/20 rounded-full w-fit mx-auto">
                                                <CheckCircle2 className="h-12 w-12 text-green-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-white mb-2">Task Completed!</h3>
                                                <p className="text-gray-300">
                                                    This workflow has been successfully completed. All steps have been finished.
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

                            {/* No Current Step Message */}
                            {!isComplete && !currentStep && workflowState && (
                                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                                    <CardContent className="p-8 text-center">
                                        <div className="space-y-4">
                                            <div className="p-4 bg-blue-500/20 rounded-full w-fit mx-auto">
                                                <Clock className="h-12 w-12 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-white mb-2">Workflow Processing...</h3>
                                                <p className="text-gray-300 mb-4">
                                                    The workflow engine is determining the next step. Please refresh to see updates.
                                                </p>
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