import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Filter, RotateCcw, Check } from "lucide-react"
import type { CoreBugQueryParams, Status, BugSeverity, ProductType } from "@/types"

interface BugFilterDialogProps {
    isOpen: boolean
    onClose: () => void
    onApply: (filters: CoreBugQueryParams) => void
    currentFilters: CoreBugQueryParams
}

const statusOptions = [
    { value: "New" as Status, label: "New", color: "bg-red-500/20 text-red-300 border-red-400/30" },
    { value: "InProgress" as Status, label: "In Progress", color: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30" },
    { value: "Done" as Status, label: "Done", color: "bg-green-500/20 text-green-300 border-green-400/30" },
]

const severityOptions = [
    { value: 0 as BugSeverity, label: "Critical", color: "bg-red-500/20 text-red-300 border-red-400/30" },
    { value: 1 as BugSeverity, label: "Major", color: "bg-orange-500/20 text-orange-300 border-orange-400/30" },
    { value: 2 as BugSeverity, label: "Moderate", color: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30" },
    { value: 3 as BugSeverity, label: "Minor", color: "bg-green-500/20 text-green-300 border-green-400/30" },
    { value: 4 as BugSeverity, label: "None", color: "bg-gray-500/20 text-gray-300 border-gray-400/30" },
]

const productTypeOptions = [
    { value: "InteractiveResponseTechnology" as ProductType, label: "IRT" },
    { value: "TM" as ProductType, label: "Trial Manager" },
    { value: "ExternalModule" as ProductType, label: "External Module" },
]

const assessmentOptions = [
    { value: true, label: "Assessed" },
    { value: false, label: "Not Assessed" },
]

export function BugFilterDialog({ isOpen, onClose, onApply, currentFilters }: BugFilterDialogProps) {
    const [filters, setFilters] = useState<CoreBugQueryParams>(currentFilters)

    useEffect(() => {
        setFilters(currentFilters)
    }, [currentFilters, isOpen])

    const handleStatusToggle = (status: Status) => {
        setFilters(prev => ({
            ...prev,
            status: prev.status === status ? undefined : status
        }))
    }

    const handleSeverityToggle = (severity: BugSeverity) => {
        setFilters(prev => ({
            ...prev,
            severity: prev.severity === severity ? undefined : severity
        }))
    }

    const handleProductTypeToggle = (productType: ProductType) => {
        setFilters(prev => ({
            ...prev,
            assessedProductType: prev.assessedProductType === productType ? undefined : productType
        }))
    }

    const handleAssessmentToggle = (isAssessed: boolean) => {
        setFilters(prev => ({
            ...prev,
            isAssessed: prev.isAssessed === isAssessed ? undefined : isAssessed
        }))
    }

    const handleApply = () => {
        onApply(filters)
        onClose()
    }

    const handleReset = () => {
        const emptyFilters: CoreBugQueryParams = {}
        setFilters(emptyFilters)
        onApply(emptyFilters)
        onClose()
    }

    const hasActiveFilters = () => {
        return Object.values(filters).some(value => value !== undefined)
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
            <div className="relative w-full max-w-md max-h-[90vh] mx-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl"></div>
                <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Filter className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-semibold text-white">Filter Bugs</CardTitle>
                                    <CardDescription className="text-gray-300">
                                        Apply filters to narrow down bug results
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

                    <CardContent className="p-6 max-h-[60vh] overflow-y-auto">
                        <div className="space-y-6">
                            {/* Status Filter */}
                            <div className="space-y-3">
                                <Label className="text-white font-medium">Status</Label>
                                <div className="flex flex-wrap gap-2">
                                    {statusOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleStatusToggle(option.value)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                                                filters.status === option.value
                                                    ? option.color + " shadow-lg"
                                                    : "bg-white/5 border-white/20 text-gray-400 hover:bg-white/10 hover:text-white"
                                            }`}
                                        >
                                            {filters.status === option.value && <Check className="h-3 w-3" />}
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Severity Filter */}
                            <div className="space-y-3">
                                <Label className="text-white font-medium">Severity</Label>
                                <div className="flex flex-wrap gap-2">
                                    {severityOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleSeverityToggle(option.value)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                                                filters.severity === option.value
                                                    ? option.color + " shadow-lg"
                                                    : "bg-white/5 border-white/20 text-gray-400 hover:bg-white/10 hover:text-white"
                                            }`}
                                        >
                                            {filters.severity === option.value && <Check className="h-3 w-3" />}
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Assessment Status Filter */}
                            <div className="space-y-3">
                                <Label className="text-white font-medium">Assessment Status</Label>
                                <div className="flex flex-wrap gap-2">
                                    {assessmentOptions.map((option) => (
                                        <button
                                            key={option.value.toString()}
                                            type="button"
                                            onClick={() => handleAssessmentToggle(option.value)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                                                filters.isAssessed === option.value
                                                    ? (option.value
                                                        ? "bg-green-500/20 text-green-300 border-green-400/30 shadow-lg"
                                                        : "bg-orange-500/20 text-orange-300 border-orange-400/30 shadow-lg")
                                                    : "bg-white/5 border-white/20 text-gray-400 hover:bg-white/10 hover:text-white"
                                            }`}
                                        >
                                            {filters.isAssessed === option.value && <Check className="h-3 w-3" />}
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Product Type Filter */}
                            <div className="space-y-3">
                                <Label className="text-white font-medium">Assessed Product Type</Label>
                                <div className="flex flex-wrap gap-2">
                                    {productTypeOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleProductTypeToggle(option.value)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                                                filters.assessedProductType === option.value
                                                    ? "bg-purple-500/20 text-purple-300 border-purple-400/30 shadow-lg"
                                                    : "bg-white/5 border-white/20 text-gray-400 hover:bg-white/10 hover:text-white"
                                            }`}
                                        >
                                            {filters.assessedProductType === option.value && <Check className="h-3 w-3" />}
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Active Filters Summary */}
                            {hasActiveFilters() && (
                                <div className="space-y-3 pt-4 border-t border-white/10">
                                    <Label className="text-white font-medium">Active Filters</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {filters.status && (
                                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                                                Status: {filters.status}
                                            </Badge>
                                        )}
                                        {filters.severity !== undefined && (
                                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                                                Severity: {severityOptions.find(s => s.value === filters.severity)?.label}
                                            </Badge>
                                        )}
                                        {filters.isAssessed !== undefined && (
                                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                                                {filters.isAssessed ? "Assessed" : "Not Assessed"}
                                            </Badge>
                                        )}
                                        {filters.assessedProductType && (
                                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                                                Product: {productTypeOptions.find(p => p.value === filters.assessedProductType)?.label}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>

                    <div className="border-t border-white/10 bg-white/5 p-6">
                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleReset}
                                disabled={!hasActiveFilters()}
                                className="bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                            <div className="flex gap-3">
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
                                    onClick={handleApply}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}