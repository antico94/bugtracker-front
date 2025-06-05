import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, CheckSquare, Plus, AlertTriangle, ChevronRight, Loader2, Package, Tag, Info, Calendar } from "lucide-react"
import { useProductVersions } from "@/hooks/use-core-bugs"
import { useWeeklyCoreBugs } from "@/hooks/use-weekly-core-bugs"
import type { BugAssessmentDto, CoreBugResponseDto, ProductType } from "@/types"

interface BugAssessmentDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (assessment: BugAssessmentDto, weeklyReportId?: string) => Promise<void>
    bug?: CoreBugResponseDto
    loading?: boolean
}

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

export function BugAssessmentDialog({ isOpen, onClose, onSubmit, bug, loading = false }: BugAssessmentDialogProps) {
    const [assessmentData, setAssessmentData] = useState<BugAssessmentDto>({
        bugId: "",
        assessedProductType: "InteractiveResponseTechnology" as ProductType,
        assessedImpactedVersions: [],
    })

    const [versionInput, setVersionInput] = useState("")
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [selectionMode, setSelectionMode] = useState<VersionSelectionMode>("manual")
    const [greaterThanVersion, setGreaterThanVersion] = useState("")
    const [rangeStart, setRangeStart] = useState("")
    const [rangeEnd, setRangeEnd] = useState("")
    const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set())
    const [weeklyReportId, setWeeklyReportId] = useState<string>("none")

    // Fetch available versions based on product type
    const { data: availableVersions, loading: versionsLoading } = useProductVersions(assessmentData.assessedProductType)

    // Fetch available weekly reports for assessment
    const { weeklyCoreBugs: availableWeeklyReports, loading: weeklyReportsLoading } = useWeeklyCoreBugs({ status: "New" })

    useEffect(() => {
        if (bug && isOpen) {
            // Pre-populate with existing assessment data if bug is already assessed
            setAssessmentData({
                bugId: bug.bugId,
                assessedProductType: bug.assessedProductType || ("InteractiveResponseTechnology" as ProductType),
                assessedImpactedVersions: bug.assessedImpactedVersions || [],
            })

            // Pre-select existing versions
            if (bug.assessedImpactedVersions) {
                setSelectedVersions(new Set(bug.assessedImpactedVersions))
            }
        } else {
            // Reset for new assessment
            setSelectedVersions(new Set())
        }
        setErrors({})
        setVersionInput("")
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
            setAssessmentData(prev => ({
                ...prev,
                assessedImpactedVersions: Array.from(newSelectedVersions)
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

    const handleProductTypeChange = (productType: ProductType) => {
        setAssessmentData(prev => ({ ...prev, assessedProductType: productType }))
        setSelectedVersions(new Set())
        setSelectionMode("manual")
    }

    const toggleVersion = (version: string) => {
        const newSelected = new Set(selectedVersions)
        if (newSelected.has(version)) {
            newSelected.delete(version)
        } else {
            newSelected.add(version)
        }
        setSelectedVersions(newSelected)
        setAssessmentData(prev => ({
            ...prev,
            assessedImpactedVersions: Array.from(newSelected)
        }))
    }

    const addCustomVersion = () => {
        if (versionInput.trim() && !selectedVersions.has(versionInput.trim())) {
            const newSelected = new Set(selectedVersions)
            newSelected.add(versionInput.trim())
            setSelectedVersions(newSelected)
            setAssessmentData(prev => ({
                ...prev,
                assessedImpactedVersions: Array.from(newSelected)
            }))
            setVersionInput("")
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (assessmentData.assessedImpactedVersions.length === 0) {
            newErrors.versions = "At least one impacted version is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            return
        }

        try {
            const finalWeeklyReportId = weeklyReportId && 
                weeklyReportId !== "none" && 
                weeklyReportId !== "loading" && 
                weeklyReportId !== "no-reports" 
                ? weeklyReportId : undefined
            await onSubmit(assessmentData, finalWeeklyReportId)
            onClose()
        } catch (error) {
            console.error("Failed to submit bug assessment:", error)
        }
    }

    if (!isOpen || !bug) return null

    const selectedProduct = productTypeOptions.find(p => p.value === assessmentData.assessedProductType)
    const colorMap: Record<string, string> = {
        blue: "from-blue-600/20 to-cyan-600/20",
        purple: "from-purple-600/20 to-pink-600/20",
        emerald: "from-emerald-600/20 to-teal-600/20"
    }

    const getColorClass = (color: string | undefined): string => {
        const validColor = color && colorMap[color] ? color : 'emerald'
        return colorMap[validColor]
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r ${getColorClass(selectedProduct?.color)} rounded-2xl blur-xl`}></div>
                <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <CardHeader className="border-b border-white/10 bg-gradient-to-r from-green-600/10 to-emerald-600/10 backdrop-blur-sm shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-green-500/20 rounded-xl shadow-lg">
                                    <CheckSquare className="h-6 w-6 text-green-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-semibold text-white">
                                        {bug.isAssessed ? "Update Assessment" : "Assess Bug"}
                                    </CardTitle>
                                    <CardDescription className="text-gray-300">
                                        {bug.isAssessed
                                            ? "Modify the impact assessment for this bug"
                                            : "Evaluate the impact and affected versions"
                                        }
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

                    <ScrollArea className="flex-1">
                        <CardContent className="p-6 space-y-6">
                            {/* Bug Information Card */}
                            <div className="relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl"></div>
                                <div className="relative p-5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                                    <div className="flex items-start justify-between mb-3">
                                        <h4 className="font-semibold text-white text-lg">{bug.bugTitle}</h4>
                                        <Badge variant="outline" className="font-mono bg-blue-500/20 text-blue-300 border-blue-400/30">
                                            {bug.jiraKey}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{bug.bugDescription}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>Created: {new Date(bug.createdAt).toLocaleDateString()}</span>
                                        {bug.isAssessed && bug.assessedAt && (
                                            <>
                                                <span>•</span>
                                                <span>Last assessed: {new Date(bug.assessedAt).toLocaleDateString()}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Product Type Selection */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-white/70" />
                                    <Label className="text-white font-medium">Product Type</Label>
                                    {bug.isAssessed && (
                                        <Badge variant="outline" className="ml-2 text-xs bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                                            Previously: {productTypeOptions.find(p => p.value === bug.assessedProductType)?.shortLabel}
                                        </Badge>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {productTypeOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleProductTypeChange(option.value)}
                                            className={`relative overflow-hidden text-left p-4 rounded-xl border transition-all duration-300 ${
                                                assessmentData.assessedProductType === option.value
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
                                            {assessmentData.assessedProductType === option.value && (
                                                <div className="absolute top-1 right-1">
                                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Version Selection Mode */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-white/70" />
                                    <Label className="text-white font-medium">Version Selection Method</Label>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectionMode("manual")}
                                        className={`px-4 py-2 rounded-lg border transition-all ${
                                            selectionMode === "manual"
                                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
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
                                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
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
                                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
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
                                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
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
                                    <Label className="text-white font-medium flex items-center gap-2">
                                        <ChevronRight className="h-4 w-4" />
                                        Affected Versions ({selectedVersions.size} selected)
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
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                                        {sortVersions(availableVersions).map(version => (
                                            <label
                                                key={version}
                                                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                                    selectedVersions.has(version)
                                                        ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-300"
                                                        : "bg-white/5 border-white/20 text-gray-400 hover:bg-white/10"
                                                }`}
                                            >
                                                <Checkbox
                                                    checked={selectedVersions.has(version)}
                                                    onCheckedChange={() => toggleVersion(version)}
                                                    disabled={selectionMode !== "manual"}
                                                    className="border-white/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                />
                                                <span className="text-sm font-mono">{version}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10">
                                        <Info className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                                        <p className="text-sm text-gray-400">No versions available for this product type</p>
                                    </div>
                                )}

                                {/* Custom version input */}
                                <div className="flex gap-2">
                                    <Input
                                        value={versionInput}
                                        onChange={(e) => setVersionInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomVersion())}
                                        placeholder="Add custom version (e.g., 2024.1.0)"
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    />
                                    <Button
                                        type="button"
                                        onClick={addCustomVersion}
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700 shadow-lg"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Selected versions summary */}
                            {selectedVersions.size > 0 && (
                                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-400/30">
                                    <Label className="text-sm text-emerald-300 mb-2 block">Selected Versions:</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from(selectedVersions).sort().map(version => (
                                            <Badge
                                                key={version}
                                                variant="outline"
                                                className="bg-emerald-500/20 text-emerald-300 border-emerald-400/40 font-mono"
                                            >
                                                {version}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Weekly Report Section */}
                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="h-5 w-5 text-orange-400" />
                                    <h3 className="text-lg font-semibold text-white">Weekly Report (Optional)</h3>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-white font-medium">Add to Weekly Report</Label>
                                    <Select
                                        value={weeklyReportId}
                                        onValueChange={setWeeklyReportId}
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
                                        Optionally add this assessed bug to an existing weekly core bugs report.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </ScrollArea>

                    <div className="border-t border-white/10 bg-white/5 p-6 shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-400">
                                {bug.isAssessed && (
                                    <span>Previously assessed by: {bug.assessedBy || "Unknown"}</span>
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
                                    disabled={loading || selectedVersions.size === 0}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Assessing...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <CheckSquare className="h-4 w-4" />
                                            {bug.isAssessed ? "Update Assessment" : "Complete Assessment"}
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