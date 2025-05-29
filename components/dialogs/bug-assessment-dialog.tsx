import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, CheckSquare, Plus, AlertTriangle } from "lucide-react"
import type { BugAssessmentDto, CoreBugResponseDto, ProductType } from "@/types"

interface BugAssessmentDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (assessment: BugAssessmentDto) => Promise<void>
    bug?: CoreBugResponseDto
    loading?: boolean
}

const productTypeOptions = [
    { value: "InteractiveResponseTechnology" as ProductType, label: "Interactive Response Technology (IRT)" },
    { value: "TM" as ProductType, label: "Trial Manager (TM)" },
    { value: "ExternalModule" as ProductType, label: "External Module" },
]

export function BugAssessmentDialog({ isOpen, onClose, onSubmit, bug, loading = false }: BugAssessmentDialogProps) {
    const [assessmentData, setAssessmentData] = useState<BugAssessmentDto>({
        bugId: "",
        assessedProductType: "InteractiveResponseTechnology" as ProductType,
        assessedImpactedVersions: [],
    })

    const [versionInput, setVersionInput] = useState("")
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (bug && isOpen) {
            setAssessmentData({
                bugId: bug.bugId,
                assessedProductType: bug.assessedProductType || ("InteractiveResponseTechnology" as ProductType),
                assessedImpactedVersions: bug.assessedImpactedVersions || [],
            })
        }
        setErrors({})
        setVersionInput("")
    }, [bug, isOpen])

    const handleProductTypeChange = (productType: ProductType) => {
        setAssessmentData(prev => ({ ...prev, assessedProductType: productType }))
    }

    const handleAssessedByChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAssessmentData(prev => ({ ...prev, assessedBy: e.target.value }))
        if (errors.assessedBy) {
            setErrors(prev => ({ ...prev, assessedBy: "" }))
        }
    }

    const addVersion = () => {
        if (versionInput.trim() && !assessmentData.assessedImpactedVersions.includes(versionInput.trim())) {
            setAssessmentData(prev => ({
                ...prev,
                assessedImpactedVersions: [...prev.assessedImpactedVersions, versionInput.trim()]
            }))
            setVersionInput("")
        }
    }

    const removeVersion = (version: string) => {
        setAssessmentData(prev => ({
            ...prev,
            assessedImpactedVersions: prev.assessedImpactedVersions.filter(v => v !== version)
        }))
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
            await onSubmit(assessmentData)
            onClose()
        } catch (error) {
            console.error("Failed to submit bug assessment:", error)
        }
    }

    const handleVersionKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addVersion()
        }
    }

    if (!isOpen || !bug) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-lg max-h-[90vh] mx-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl blur-xl"></div>
                <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/10 bg-gradient-to-r from-green-600/10 to-emerald-600/10 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <CheckSquare className="h-5 w-5 text-green-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-semibold text-white">
                                        Assess Bug
                                    </CardTitle>
                                    <CardDescription className="text-gray-300">
                                        Evaluate the impact and affected versions
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

                    <CardContent className="p-6">
                        <div className="space-y-6">
                            {/* Bug Information */}
                            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                <h4 className="font-medium text-white mb-2">{bug.bugTitle}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Badge variant="outline" className="font-mono">
                                        {bug.jiraKey}
                                    </Badge>
                                    <span>•</span>
                                    <span>Created: {new Date(bug.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Product Type Selection */}
                            <div className="space-y-3">
                                <Label className="text-white font-medium">Assessed Product Type *</Label>
                                <div className="space-y-2">
                                    {productTypeOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleProductTypeChange(option.value)}
                                            className={`w-full text-left px-3 py-2 rounded-lg border transition-all duration-200 ${
                                                assessmentData.assessedProductType === option.value
                                                    ? "bg-green-500/20 text-green-300 border-green-400/30 shadow-lg"
                                                    : "bg-white/5 border-white/20 text-gray-400 hover:bg-white/10 hover:text-white"
                                            }`}
                                        >
                                            <div className="font-medium">{option.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Impacted Versions */}
                            <div className="space-y-3">
                                <Label className="text-white font-medium">Assessed Impacted Versions *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={versionInput}
                                        onChange={(e) => setVersionInput(e.target.value)}
                                        onKeyPress={handleVersionKeyPress}
                                        placeholder="Add impacted version and press Enter"
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-white/30"
                                    />
                                    <Button
                                        type="button"
                                        onClick={addVersion}
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                {errors.versions && (
                                    <div className="flex items-center gap-1 text-red-400 text-sm">
                                        <AlertTriangle className="h-3 w-3" />
                                        {errors.versions}
                                    </div>
                                )}
                                {assessmentData.assessedImpactedVersions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {assessmentData.assessedImpactedVersions.map((version) => (
                                            <Badge
                                                key={version}
                                                variant="outline"
                                                className="bg-green-500/20 text-green-300 border-green-400/30 pr-1"
                                            >
                                                {version}
                                                <button
                                                    type="button"
                                                    onClick={() => removeVersion(version)}
                                                    className="ml-1 hover:bg-green-500/30 rounded p-0.5"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>

                    <div className="border-t border-white/10 bg-white/5 p-6">
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
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Assessing...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <CheckSquare className="h-4 w-4" />
                                        Complete Assessment
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