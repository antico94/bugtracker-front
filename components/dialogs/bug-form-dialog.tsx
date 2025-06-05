import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Checkbox} from "@/components/ui/checkbox"
import {ScrollArea} from "@/components/ui/scroll-area"
import {AlertTriangle, Bug, FileText, Info, Link, Loader2, Package, Plus, X, Calendar} from "lucide-react"
import {useProductVersions} from "@/hooks/use-core-bugs"
import {useWeeklyCoreBugs} from "@/hooks/use-weekly-core-bugs"
import {BugSeverity, CoreBugResponseDto, CreateCoreBugDto, ProductType, UpdateCoreBugDto} from "@/types"

interface BugFormDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: CreateCoreBugDto | UpdateCoreBugDto, assessmentData?: { productType: ProductType; versions: string[] }, weeklyReportId?: string) => Promise<void>
    bug?: CoreBugResponseDto
    loading?: boolean
}

const severityOptions = [
    {
        value: 0 as BugSeverity,
        label: "Critical",
        description: "System failure or data loss",
        icon: "🔴",
        color: "bg-red-500/20 text-red-300 border-red-400/30"
    },
    {
        value: 1 as BugSeverity,
        label: "Major",
        description: "Significant functionality impact",
        icon: "🟠",
        color: "bg-orange-500/20 text-orange-300 border-orange-400/30"
    },
    {
        value: 2 as BugSeverity,
        label: "Moderate",
        description: "Limited functionality impact",
        icon: "🟡",
        color: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
    },
    {
        value: 3 as BugSeverity,
        label: "Minor",
        description: "Minimal impact on users",
        icon: "🟢",
        color: "bg-green-500/20 text-green-300 border-green-400/30"
    },
    {
        value: 4 as BugSeverity,
        label: "None",
        description: "Cosmetic or enhancement",
        icon: "⚪",
        color: "bg-gray-500/20 text-gray-300 border-gray-400/30"
    },
]

const productTypeOptions = [
    {
        value: "InteractiveResponseTechnology" as ProductType,
        label: "Interactive Response Technology",
        shortLabel: "IRT",
        icon: "🔬",
        color: "blue"
    },
    {
        value: "TM" as ProductType,
        label: "Trial Manager",
        shortLabel: "TM",
        icon: "📋",
        color: "purple"
    },
    {
        value: "ExternalModule" as ProductType,
        label: "External Module",
        shortLabel: "Module",
        icon: "🔧",
        color: "emerald"
    },
]

type VersionSelectionMode = "manual" | "all" | "greater" | "range"

export default function BugFormDialog({ isOpen, onClose, onSubmit, bug, loading = false }: BugFormDialogProps) {
    const [formData, setFormData] = useState({
        bugTitle: "",
        jiraKey: "",
        jiraLink: "",
        bugDescription: "",
        severity: 2 as BugSeverity,
        affectedVersions: [] as string[],
        weeklyReportId: "none" as string,
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    // Version selection states
    const [productType, setProductType] = useState<ProductType>(ProductType.InteractiveResponseTechnology)
    const [selectionMode, setSelectionMode] = useState<VersionSelectionMode>("manual")
    const [greaterThanVersion, setGreaterThanVersion] = useState("")
    const [rangeStart, setRangeStart] = useState("")
    const [rangeEnd, setRangeEnd] = useState("")
    const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set())
    const [customVersion, setCustomVersion] = useState("")

    // Fetch available versions based on product type
    const { data: availableVersions, loading: versionsLoading } = useProductVersions(productType)

    // Fetch available weekly reports for new bugs only
    const { weeklyCoreBugs: availableWeeklyReports, loading: weeklyReportsLoading } = useWeeklyCoreBugs()

    useEffect(() => {
        if (bug && isOpen) {
            setFormData({
                bugTitle: bug.bugTitle || "",
                jiraKey: bug.jiraKey || "",
                jiraLink: bug.jiraLink || "",
                bugDescription: bug.bugDescription || "",
                severity: bug.severity,
                affectedVersions: bug.affectedVersions || [],
                weeklyReportId: "none", // Weekly reports not available for editing existing bugs
            })
            setSelectedVersions(new Set(bug.affectedVersions || []))

            // Set product type if bug is assessed
            if (bug.assessedProductType) {
                setProductType(bug.assessedProductType)
            }
        } else if (isOpen && !bug) {
            // Reset form for new bug
            setFormData({
                bugTitle: "",
                jiraKey: "",
                jiraLink: "",
                bugDescription: "",
                severity: 2 as BugSeverity,
                affectedVersions: [],
                weeklyReportId: "none",
            })
            setSelectedVersions(new Set())
        }
        setErrors({})
        setSelectionMode("manual")
    }, [bug, isOpen])

    // Update selected versions when selection mode or criteria changes
    useEffect(() => {
        if (!availableVersions || availableVersions.length === 0) return

        const sortedVersions = sortVersions(availableVersions)
        let newSelectedVersions = new Set<string>()

        switch (selectionMode) {
            case "all":
                newSelectedVersions = new Set(availableVersions)
                break
            case "greater":
                if (greaterThanVersion) {
                    const index = sortedVersions.indexOf(greaterThanVersion)
                    if (index !== -1) {
                        sortedVersions.slice(index).forEach(v => newSelectedVersions.add(v))
                    }
                }
                break
            case "range":
                if (rangeStart && rangeEnd) {
                    const startIndex = sortedVersions.indexOf(rangeStart)
                    const endIndex = sortedVersions.indexOf(rangeEnd)
                    if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
                        sortedVersions.slice(startIndex, endIndex + 1).forEach(v => newSelectedVersions.add(v))
                    }
                }
                break
        }

        if (selectionMode !== "manual") {
            setSelectedVersions(newSelectedVersions)
            setFormData(prev => ({
                ...prev,
                affectedVersions: Array.from(newSelectedVersions)
            }))
        }
    }, [selectionMode, greaterThanVersion, rangeStart, rangeEnd, availableVersions])

    const sortVersions = (versions: string[]): string[] => {
        return [...versions].sort((a, b) => {
            const aParts = a.split('.').map(p => parseInt(p) || 0)
            const bParts = b.split('.').map(p => parseInt(p) || 0)

            for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                const aPart = aParts[i] || 0
                const bPart = bParts[i] || 0
                if (aPart !== bPart) return aPart - bPart
            }
            return 0
        })
    }

    const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }))
        }
    }

    const handleSeverityChange = (severity: BugSeverity) => {
        setFormData(prev => ({ ...prev, severity }))
    }

    const toggleVersion = (version: string) => {
        const newSelected = new Set(selectedVersions)
        if (newSelected.has(version)) {
            newSelected.delete(version)
        } else {
            newSelected.add(version)
        }
        setSelectedVersions(newSelected)
        setFormData(prev => ({
            ...prev,
            affectedVersions: Array.from(newSelected)
        }))
    }

    const addCustomVersion = () => {
        if (customVersion.trim() && !selectedVersions.has(customVersion.trim())) {
            const newSelected = new Set(selectedVersions)
            newSelected.add(customVersion.trim())
            setSelectedVersions(newSelected)
            setFormData(prev => ({
                ...prev,
                affectedVersions: Array.from(newSelected)
            }))
            setCustomVersion("")
        }
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

        // For new bugs, require at least one version if creating manually
        if (!bug && selectedVersions.size === 0) {
            newErrors.versions = "At least one affected version is required for manual bug creation"
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

        const submitData: CreateCoreBugDto | UpdateCoreBugDto = {
            bugTitle: formData.bugTitle.trim(),
            jiraKey: formData.jiraKey.trim(),
            jiraLink: formData.jiraLink.trim(),
            bugDescription: formData.bugDescription.trim(),
            severity: formData.severity,
            affectedVersions: formData.affectedVersions.length > 0 ? formData.affectedVersions : undefined,
        }

        // For new bugs, include assessment data for auto-assessment
        const assessmentData = !bug ? {
            productType,
            versions: Array.from(selectedVersions)
        } : undefined

        // Weekly report ID for new bugs only (exclude "none" and other placeholder values)
        const weeklyReportId = !bug && formData.weeklyReportId && 
            formData.weeklyReportId !== "none" && 
            formData.weeklyReportId !== "loading" && 
            formData.weeklyReportId !== "no-reports" 
            ? formData.weeklyReportId : undefined

        try {
            await onSubmit(submitData, assessmentData, weeklyReportId)
            onClose()
        } catch (error) {
            console.error("Failed to submit bug form:", error)
            if (error instanceof Error) {
                setErrors({ submit: error.message })
            }
        }
    }

    if (!isOpen) return null

    const isFormValid = () => {
        return formData.bugTitle.trim() &&
            formData.jiraKey.trim() &&
            formData.jiraLink.trim() &&
            formData.bugDescription.trim() &&
            (bug || selectedVersions.size > 0) // For new bugs, require versions
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-5xl max-h-[90vh]">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl"></div>
                <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl flex flex-col h-[90vh]">
                    <CardHeader className="border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500/20 rounded-xl shadow-lg">
                                    <Bug className="h-6 w-6 text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-semibold text-white">
                                        {bug ? "Edit Bug" : "Create New Bug"}
                                    </CardTitle>
                                    <CardDescription className="text-gray-300">
                                        {bug ? "Update bug information" : "Add a new bug to the system (will be auto-assessed)"}
                                    </CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-6">
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

                            {/* Auto-Assessment Notice for New Bugs */}
                            {!bug && (
                                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-300">
                                        <Info className="h-4 w-4" />
                                        <span className="font-medium">Auto-Assessment</span>
                                    </div>
                                    <p className="text-green-300 text-sm mt-1">
                                        This bug will be automatically assessed with the product type and versions you select below.
                                    </p>
                                </div>
                            )}

                            {/* Basic Information Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText className="h-5 w-5 text-blue-400" />
                                    <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                                </div>

                                {/* Bug Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="bugTitle" className="text-white font-medium">
                                        Bug Title *
                                    </Label>
                                    <Input
                                        id="bugTitle"
                                        value={formData.bugTitle}
                                        onChange={handleInputChange("bugTitle")}
                                        placeholder="Enter a clear, descriptive bug title"
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                        maxLength={500}
                                    />
                                    <div className="flex items-center justify-between">
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
                                </div>

                                {/* JIRA Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="jiraKey" className="text-white font-medium">
                                            JIRA Key *
                                        </Label>
                                        <div className="relative">
                                            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="jiraKey"
                                                value={formData.jiraKey}
                                                onChange={handleInputChange("jiraKey")}
                                                placeholder="e.g., BUG-123"
                                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                                                maxLength={50}
                                            />
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
                                        <div className="relative">
                                            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="jiraLink"
                                                value={formData.jiraLink}
                                                onChange={handleInputChange("jiraLink")}
                                                placeholder="https://yourcompany.atlassian.net/browse/BUG-123"
                                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                                            />
                                        </div>
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
                                        rows={4}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                                    />
                                    {errors.bugDescription && (
                                        <div className="flex items-center gap-1 text-red-400 text-sm">
                                            <AlertTriangle className="h-3 w-3" />
                                            {errors.bugDescription}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Severity Section */}
                            <div className="space-y-4 pb-6 border-b border-white/10">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertTriangle className="h-5 w-5 text-orange-400" />
                                    <h3 className="text-lg font-semibold text-white">Bug Severity</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {severityOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleSeverityChange(option.value)}
                                            className={`relative overflow-hidden text-left p-4 rounded-xl border transition-all duration-300 ${
                                                formData.severity === option.value
                                                    ? `${option.color} shadow-lg scale-[1.02]`
                                                    : "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/25"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xl">{option.icon}</span>
                                                <span className="font-medium text-white text-sm">{option.label}</span>
                                            </div>
                                            <p className="text-xs text-gray-400">{option.description}</p>
                                            {formData.severity === option.value && (
                                                <div className="absolute top-2 right-2">
                                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Affected Versions Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Package className="h-5 w-5 text-purple-400" />
                                    <h3 className="text-lg font-semibold text-white">
                                        Affected Versions {!bug && <span className="text-red-400">*</span>}
                                    </h3>
                                </div>

                                {/* Product Type Selection */}
                                <div className="space-y-3">
                                    <Label className="text-white font-medium">Product Type {!bug && <span className="text-red-400">*</span>}</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {productTypeOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setProductType(option.value)}
                                                className={`relative overflow-hidden text-left p-4 rounded-xl border transition-all duration-300 ${
                                                    productType === option.value
                                                        ? "bg-white/15 border-white/30 shadow-lg scale-[1.02]"
                                                        : "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/25"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{option.icon}</span>
                                                    <div>
                                                        <div className="font-medium text-white">{option.shortLabel}</div>
                                                        <div className="text-xs text-gray-400">{option.label}</div>
                                                    </div>
                                                </div>
                                                {productType === option.value && (
                                                    <div className="absolute top-1 right-1">
                                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Version Selection Mode */}
                                <div className="space-y-3">
                                    <Label className="text-white font-medium">Version Selection Method</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectionMode("manual")}
                                            className={`px-4 py-2 rounded-lg border transition-all ${
                                                selectionMode === "manual"
                                                    ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                                                    : "bg-white/5 border-white/20 text-gray-400 hover:bg-white/10"
                                            }`}
                                        >
                                            Manual
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectionMode("all")}
                                            className={`px-4 py-2 rounded-lg border transition-all ${
                                                selectionMode === "all"
                                                    ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                                                    : "bg-white/5 border-white/20 text-gray-400 hover:bg-white/10"
                                            }`}
                                        >
                                            All Versions
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectionMode("greater")}
                                            className={`px-4 py-2 rounded-lg border transition-all ${
                                                selectionMode === "greater"
                                                    ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                                                    : "bg-white/5 border-white/20 text-gray-400 hover:bg-white/10"
                                            }`}
                                        >
                                            Greater Than
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectionMode("range")}
                                            className={`px-4 py-2 rounded-lg border transition-all ${
                                                selectionMode === "range"
                                                    ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                                                    : "bg-white/5 border-white/20 text-gray-400 hover:bg-white/10"
                                            }`}
                                        >
                                            Range
                                        </button>
                                    </div>

                                    {/* Conditional inputs based on selection mode */}
                                    {selectionMode === "greater" && (
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-300">Affects all versions greater than:</Label>
                                            <Select value={greaterThanVersion} onValueChange={setGreaterThanVersion}>
                                                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                                    <SelectValue placeholder="Select version..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sortVersions(availableVersions || []).map(version => (
                                                        <SelectItem key={version} value={version}>{version}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {selectionMode === "range" && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label className="text-sm text-gray-300">From version:</Label>
                                                <Select value={rangeStart} onValueChange={setRangeStart}>
                                                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                                        <SelectValue placeholder="Start version..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sortVersions(availableVersions || []).map(version => (
                                                            <SelectItem key={version} value={version}>{version}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm text-gray-300">To version:</Label>
                                                <Select value={rangeEnd} onValueChange={setRangeEnd}>
                                                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                                        <SelectValue placeholder="End version..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sortVersions(availableVersions || []).map(version => (
                                                            <SelectItem key={version} value={version}>{version}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Available Versions */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-white font-medium">
                                            Available Versions ({selectedVersions.size} selected)
                                            {!bug && selectedVersions.size === 0 && <span className="text-red-400 ml-1">*</span>}
                                        </Label>
                                        {versionsLoading && (
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Loading versions...
                                            </div>
                                        )}
                                    </div>

                                    {errors.versions && (
                                        <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                            <AlertTriangle className="h-4 w-4 text-red-400" />
                                            <span className="text-sm text-red-300">{errors.versions}</span>
                                        </div>
                                    )}

                                    {/* Version grid */}
                                    {availableVersions && availableVersions.length > 0 ? (
                                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 p-4 bg-white/5 rounded-xl border border-white/10 max-h-48 overflow-y-auto">
                                            {sortVersions(availableVersions).map(version => (
                                                <label
                                                    key={version}
                                                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                                        selectedVersions.has(version)
                                                            ? "bg-blue-500/20 border-blue-400/30 text-blue-300"
                                                            : "bg-white/5 border-white/20 text-gray-400 hover:bg-white/10"
                                                    }`}
                                                >
                                                    <Checkbox
                                                        checked={selectedVersions.has(version)}
                                                        onCheckedChange={() => toggleVersion(version)}
                                                        disabled={selectionMode !== "manual"}
                                                        className="border-white/30 data-[state=checked]:bg-blue-500"
                                                    />
                                                    <span className="text-xs font-mono">{version}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10">
                                            <Info className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                                            <p className="text-sm text-gray-400">
                                                {versionsLoading ? "Loading versions..." : "No versions available for this product type"}
                                            </p>
                                        </div>
                                    )}

                                    {/* Custom version input */}
                                    <div className="flex gap-2">
                                        <Input
                                            value={customVersion}
                                            onChange={(e) => setCustomVersion(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomVersion())}
                                            placeholder="Add custom version (e.g., 2024.1.0)"
                                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                        />
                                        <Button
                                            type="button"
                                            onClick={addCustomVersion}
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700 shadow-lg px-3"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Selected versions summary */}
                                    {selectedVersions.size > 0 && (
                                        <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-400/30">
                                            <Label className="text-sm text-blue-300 mb-2 block">
                                                Selected Versions:
                                            </Label>
                                            <div className="flex flex-wrap gap-2">
                                                {Array.from(selectedVersions).sort().map(version => (
                                                    <Badge
                                                        key={version}
                                                        variant="outline"
                                                        className="bg-blue-500/20 text-blue-300 border-blue-400/40 font-mono pr-1"
                                                    >
                                                        {version}
                                                        {selectionMode === "manual" && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleVersion(version)}
                                                                className="ml-1 hover:bg-blue-500/30 rounded p-0.5"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Weekly Report Section - Only for new bugs */}
                            {!bug && (
                                <div className="space-y-4 pt-6 border-t border-white/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Calendar className="h-5 w-5 text-orange-400" />
                                        <h3 className="text-lg font-semibold text-white">Weekly Report (Optional)</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-white font-medium">Add to Weekly Report</Label>
                                        <Select
                                            value={formData.weeklyReportId}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, weeklyReportId: value }))}
                                        >
                                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                                <SelectValue placeholder="Select a weekly report (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None (don't add to any report)</SelectItem>
                                                {weeklyReportsLoading ? (
                                                    <SelectItem value="loading" disabled>Loading weekly reports...</SelectItem>
                                                ) : availableWeeklyReports && availableWeeklyReports.length > 0 ? (
                                                    availableWeeklyReports.map(report => (
                                                        <SelectItem key={report.weeklyCoreBugsId} value={report.weeklyCoreBugsId}>
                                                            {report.name} ({new Date(report.weekStartDate).toLocaleDateString()} - {new Date(report.weekEndDate).toLocaleDateString()})
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="no-reports" disabled>No active weekly reports available</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-400">
                                            Optionally add this bug to an existing weekly core bugs report. Only active reports are shown.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-white/10 bg-white/5 p-6 shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                {!isFormValid() && (
                                    <>
                                        <Info className="h-4 w-4" />
                                        <span>Please fill in all required fields</span>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="bg-white/5 border-white/20 text-gray-300 hover:bg-white/10"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading || !isFormValid()}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {bug ? "Updating..." : "Creating & Assessing..."}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Bug className="h-4 w-4" />
                                            {bug ? "Update Bug" : "Create & Assess Bug"}
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}