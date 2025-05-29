"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Bug, AlertTriangle, Plus } from "lucide-react"
import type { CreateCoreBugDto, UpdateCoreBugDto, CoreBugResponseDto, BugSeverity } from "@/types"

interface BugFormDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: CreateCoreBugDto | UpdateCoreBugDto) => Promise<void>
    bug?: CoreBugResponseDto
    loading?: boolean
}

const severityOptions = [
    { value: 0 as BugSeverity, label: "Critical", color: "bg-red-500/20 text-red-300 border-red-400/30" },
    { value: 1 as BugSeverity, label: "Major", color: "bg-orange-500/20 text-orange-300 border-orange-400/30" },
    { value: 2 as BugSeverity, label: "Moderate", color: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30" },
    { value: 3 as BugSeverity, label: "Minor", color: "bg-green-500/20 text-green-300 border-green-400/30" },
    { value: 4 as BugSeverity, label: "None", color: "bg-gray-500/20 text-gray-300 border-gray-400/30" },
]

export default function BugFormDialog({ isOpen, onClose, onSubmit, bug, loading = false }: BugFormDialogProps) {
    const [formData, setFormData] = useState({
        bugTitle: "",
        jiraKey: "",
        jiraLink: "",
        bugDescription: "",
        severity: 2 as BugSeverity, // Default to Moderate
        foundInBuild: "",
        affectedVersions: [] as string[],
    })

    const [newVersion, setNewVersion] = useState("")
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (bug && isOpen) {
            setFormData({
                bugTitle: bug.bugTitle || "",
                jiraKey: bug.jiraKey || "",
                jiraLink: bug.jiraLink || "",
                bugDescription: bug.bugDescription || "",
                severity: bug.severity,
                foundInBuild: bug.foundInBuild || "",
                affectedVersions: bug.affectedVersions || [],
            })
        } else if (isOpen && !bug) {
            // Reset form for new bug
            setFormData({
                bugTitle: "",
                jiraKey: "",
                jiraLink: "",
                bugDescription: "",
                severity: 2 as BugSeverity,
                foundInBuild: "",
                affectedVersions: [],
            })
        }
        setErrors({})
        setNewVersion("")
    }, [bug, isOpen])

    const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }))
        }
    }

    const handleSeverityChange = (severity: BugSeverity) => {
        setFormData(prev => ({ ...prev, severity }))
    }

    const addVersion = () => {
        if (newVersion.trim() && !formData.affectedVersions.includes(newVersion.trim())) {
            setFormData(prev => ({
                ...prev,
                affectedVersions: [...prev.affectedVersions, newVersion.trim()]
            }))
            setNewVersion("")
        }
    }

    const removeVersion = (version: string) => {
        setFormData(prev => ({
            ...prev,
            affectedVersions: prev.affectedVersions.filter(v => v !== version)
        }))
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.bugTitle.trim()) {
            newErrors.bugTitle = "Bug title is required"
        } else if (formData.bugTitle.length > 500) {
            newErrors.bugTitle = "Bug title must be less than 500 characters"
        }

        if (!formData.jiraKey.trim()) {
            newErrors.jiraKey = "JIRA key is required"
        } else if (formData.jiraKey.length > 50) {
            newErrors.jiraKey = "JIRA key must be less than 50 characters"
        }

        if (!formData.jiraLink.trim()) {
            newErrors.jiraLink = "JIRA link is required"
        } else if (!isValidUrl(formData.jiraLink)) {
            newErrors.jiraLink = "Please enter a valid URL"
        }

        if (!formData.bugDescription.trim()) {
            newErrors.bugDescription = "Bug description is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const isValidUrl = (string: string) => {
        try {
            new URL(string)
            return true
        } catch (_) {
            return false
        }
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            return
        }

        // Prepare the data exactly as the API expects
        const submitData: CreateCoreBugDto | UpdateCoreBugDto = {
            bugTitle: formData.bugTitle.trim(),
            jiraKey: formData.jiraKey.trim(),
            jiraLink: formData.jiraLink.trim(),
            bugDescription: formData.bugDescription.trim(),
            severity: formData.severity,
            foundInBuild: formData.foundInBuild.trim() || undefined, // Send undefined if empty
            affectedVersions: formData.affectedVersions.length > 0 ? formData.affectedVersions : undefined, // Send undefined if empty array
        }

        // Debug logging
        console.log("Submitting bug data:", JSON.stringify(submitData, null, 2))
        console.log("Severity type:", typeof submitData.severity, "Value:", submitData.severity)

        try {
            await onSubmit(submitData)
            onClose()
        } catch (error) {
            console.error("Failed to submit bug form:", error)
            // Show more detailed error to user
            if (error instanceof Error) {
                setErrors({ submit: error.message })
            }
        }
    }

    const handleVersionKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addVersion()
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-2xl max-h-[90vh] mx-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl"></div>
                <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl overflow-y-auto max-h-[90vh]">
                    <CardHeader className="border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Bug className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-semibold text-white">
                                        {bug ? "Edit Bug" : "Create New Bug"}
                                    </CardTitle>
                                    <CardDescription className="text-gray-300">
                                        {bug ? "Update bug information" : "Add a new bug to the system"}
                                    </CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="text-gray-400 hover:text-white hover:bg-white/10"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                        {/* Submit Error Display */}
                        {errors.submit && (
                            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                                <div className="flex items-center gap-2 text-red-300">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="font-medium">Submission Error</span>
                                </div>
                                <p className="text-red-300 text-sm mt-1">{errors.submit}</p>
                            </div>
                        )}

                        {/* Bug Title */}
                        <div className="space-y-2">
                            <Label htmlFor="bugTitle" className="text-white font-medium">
                                Bug Title * <span className="text-xs text-gray-400">(max 500 chars)</span>
                            </Label>
                            <Input
                                id="bugTitle"
                                value={formData.bugTitle}
                                onChange={handleInputChange("bugTitle")}
                                placeholder="Enter a clear, descriptive bug title"
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-white/30"
                                maxLength={500}
                            />
                            <div className="text-xs text-gray-400">
                                {formData.bugTitle.length}/500 characters
                            </div>
                            {errors.bugTitle && (
                                <div className="flex items-center gap-1 text-red-400 text-sm">
                                    <AlertTriangle className="h-3 w-3" />
                                    {errors.bugTitle}
                                </div>
                            )}
                        </div>

                        {/* JIRA Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="jiraKey" className="text-white font-medium">
                                    JIRA Key * <span className="text-xs text-gray-400">(max 50 chars)</span>
                                </Label>
                                <Input
                                    id="jiraKey"
                                    value={formData.jiraKey}
                                    onChange={handleInputChange("jiraKey")}
                                    placeholder="e.g., BUG-123"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-white/30"
                                    maxLength={50}
                                />
                                <div className="text-xs text-gray-400">
                                    {formData.jiraKey.length}/50 characters
                                </div>
                                {errors.jiraKey && (
                                    <div className="flex items-center gap-1 text-red-400 text-sm">
                                        <AlertTriangle className="h-3 w-3" />
                                        {errors.jiraKey}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jiraLink" className="text-white font-medium">
                                    JIRA Link *
                                </Label>
                                <Input
                                    id="jiraLink"
                                    value={formData.jiraLink}
                                    onChange={handleInputChange("jiraLink")}
                                    placeholder="https://yourcompany.atlassian.net/browse/BUG-123"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-white/30"
                                />
                                {errors.jiraLink && (
                                    <div className="flex items-center gap-1 text-red-400 text-sm">
                                        <AlertTriangle className="h-3 w-3" />
                                        {errors.jiraLink}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bug Description */}
                        <div className="space-y-2">
                            <Label htmlFor="bugDescription" className="text-white font-medium">
                                Bug Description *
                            </Label>
                            <Textarea
                                id="bugDescription"
                                value={formData.bugDescription}
                                onChange={handleInputChange("bugDescription")}
                                placeholder="Provide a detailed description of the bug, including steps to reproduce, expected behavior, and actual behavior..."
                                rows={5}
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-white/30 resize-none"
                            />
                            {errors.bugDescription && (
                                <div className="flex items-center gap-1 text-red-400 text-sm">
                                    <AlertTriangle className="h-3 w-3" />
                                    {errors.bugDescription}
                                </div>
                            )}
                        </div>

                        {/* Severity */}
                        <div className="space-y-3">
                            <Label className="text-white font-medium">Severity *</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {severityOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSeverityChange(option.value)}
                                        className={`px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                                            formData.severity === option.value
                                                ? option.color + " shadow-lg"
                                                : "bg-white/5 border-white/20 text-gray-400 hover:bg-white/10 hover:text-white"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            <div className="text-xs text-gray-400">
                                Selected: {severityOptions.find(s => s.value === formData.severity)?.label} (Value: {formData.severity})
                            </div>
                        </div>

                        {/* Found In Build */}
                        <div className="space-y-2">
                            <Label htmlFor="foundInBuild" className="text-white font-medium">
                                Found in Build <span className="text-xs text-gray-400">(optional)</span>
                            </Label>
                            <Input
                                id="foundInBuild"
                                value={formData.foundInBuild}
                                onChange={handleInputChange("foundInBuild")}
                                placeholder="e.g., v1.2.3 or Build #456"
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-white/30"
                            />
                        </div>

                        {/* Affected Versions */}
                        <div className="space-y-3">
                            <Label className="text-white font-medium">
                                Affected Versions <span className="text-xs text-gray-400">(optional)</span>
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newVersion}
                                    onChange={(e) => setNewVersion(e.target.value)}
                                    onKeyPress={handleVersionKeyPress}
                                    placeholder="Add affected version and press Enter"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-white/30"
                                />
                                <Button
                                    type="button"
                                    onClick={addVersion}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            {formData.affectedVersions.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.affectedVersions.map((version) => (
                                        <Badge
                                            key={version}
                                            variant="outline"
                                            className="bg-blue-500/20 text-blue-300 border-blue-400/30 pr-1"
                                        >
                                            {version}
                                            <button
                                                type="button"
                                                onClick={() => removeVersion(version)}
                                                className="ml-1 hover:bg-blue-500/30 rounded p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Debug Information (remove this in production) */}
                        <details className="text-xs text-gray-400 bg-white/5 p-2 rounded">
                            <summary className="cursor-pointer">Debug Info (click to expand)</summary>
                            <pre className="mt-2 whitespace-pre-wrap">
                                {JSON.stringify({
                                    formData,
                                    severityType: typeof formData.severity,
                                    affectedVersionsLength: formData.affectedVersions.length
                                }, null, 2)}
                            </pre>
                        </details>
                    </CardContent>

                    <div className="border-t border-white/10 bg-white/5 p-6 sticky bottom-0">
                        <div className="flex items-center justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        {bug ? "Updating..." : "Creating..."}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Bug className="h-4 w-4" />
                                        {bug ? "Update Bug" : "Create Bug"}
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}