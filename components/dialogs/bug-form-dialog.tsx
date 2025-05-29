"use client"

import { useState } from "react"
import { Search, Upload, Download, Filter, Plus, Bug, ExternalLink, AlertTriangle, CheckCircle2, Clock, Edit, Trash2, CheckSquare, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BugSeverityBadge } from "@/components/bug-severity-badge"
import { useCoreBugs } from "@/hooks/use-core-bugs"
import { toast } from "@/hooks/use-toast"
import type { Status, CoreBugQueryParams, CreateCoreBugDto, UpdateCoreBugDto, BugAssessmentDto, CoreBugResponseDto } from "@/types"

// Mock dialog components for now - these would be imported from separate files
function BugFormDialog({ isOpen, onClose, onSubmit, bug, loading }: any) {
    if (!isOpen) return null

    const [formData, setFormData] = useState({
        bugTitle: bug?.bugTitle || "",
        jiraKey: bug?.jiraKey || "",
        jiraLink: bug?.jiraLink || "",
        bugDescription: bug?.bugDescription || "",
        severity: bug?.severity || 2,
        foundInBuild: bug?.foundInBuild || "",
        affectedVersions: bug?.affectedVersions || [],
    })

    const handleSubmit = async () => {
        try {
            await onSubmit(formData)
        } catch (error) {
            console.error('Form submission error:', error)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl mx-4">
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                    <CardHeader className="border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white">{bug ? "Edit Bug" : "Create Bug"}</CardTitle>
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <label className="text-white font-medium mb-2 block">Bug Title</label>
                            <Input
                                value={formData.bugTitle}
                                onChange={(e) => setFormData(prev => ({ ...prev, bugTitle: e.target.value }))}
                                className="bg-white/10 border-white/20 text-white"
                                placeholder="Enter bug title..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-white font-medium mb-2 block">JIRA Key</label>
                                <Input
                                    value={formData.jiraKey}
                                    onChange={(e) => setFormData(prev => ({ ...prev, jiraKey: e.target.value }))}
                                    className="bg-white/10 border-white/20 text-white"
                                    placeholder="BUG-123"
                                />
                            </div>
                            <div>
                                <label className="text-white font-medium mb-2 block">JIRA Link</label>
                                <Input
                                    value={formData.jiraLink}
                                    onChange={(e) => setFormData(prev => ({ ...prev, jiraLink: e.target.value }))}
                                    className="bg-white/10 border-white/20 text-white"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-white font-medium mb-2 block">Description</label>
                            <textarea
                                value={formData.bugDescription}
                                onChange={(e) => setFormData(prev => ({ ...prev, bugDescription: e.target.value }))}
                                className="w-full p-3 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-gray-400 min-h-[100px] resize-none"
                                placeholder="Describe the bug..."
                            />
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading ? "Saving..." : (bug ? "Update" : "Create")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function BugFilterDialog({ isOpen, onClose, onApply, currentFilters }: any) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md mx-4">
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                    <CardHeader className="border-b border-white/10">
                        <CardTitle className="text-white">Filter Bugs</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="text-white mb-4">Filter options would go here...</div>
                        <div className="flex items-center justify-end gap-3">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button onClick={() => { onApply({}); onClose() }}>Apply Filters</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function BugAssessmentDialog({ isOpen, onClose, onSubmit, bug, loading }: any) {
    if (!isOpen || !bug) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg mx-4">
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                    <CardHeader className="border-b border-white/10">
                        <CardTitle className="text-white">Assess Bug</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="text-white mb-4">Assessment options for {bug.bugTitle}...</div>
                        <div className="flex items-center justify-end gap-3">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button onClick={() => { onSubmit({ bugId: bug.bugId, assessedProductType: "InteractiveResponseTechnology", assessedImpactedVersions: ["1.0.0"] }); }} disabled={loading}>
                                {loading ? "Assessing..." : "Complete Assessment"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function BugsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState<CoreBugQueryParams>({})
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showFilterDialog, setShowFilterDialog] = useState(false)
    const [showAssessDialog, setShowAssessDialog] = useState(false)
    const [editingBug, setEditingBug] = useState<CoreBugResponseDto | null>(null)
    const [assessingBug, setAssessingBug] = useState<CoreBugResponseDto | null>(null)

    const {
        bugs,
        loading,
        error,
        create,
        update,
        assess,
        delete: deleteBug,
        import: importBugs,
        createLoading,
        updateLoading,
        assessLoading,
        deleteLoading,
        importLoading,
        refetch
    } = useCoreBugs(filters)

    // Filter bugs based on search query (client-side search)
    const filteredBugs = bugs?.filter(
        (bug) =>
            bug.bugTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bug.bugDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bug.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bug.jiraKey?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    // Calculate stats for the overview cards
    const stats = {
        total: bugs?.length || 0,
        new: bugs?.filter((b) => b.status === ("New" as Status))?.length || 0,
        inProgress: bugs?.filter((b) => b.status === ("InProgress" as Status))?.length || 0,
        done: bugs?.filter((b) => b.status === ("Done" as Status))?.length || 0,
        critical: bugs?.filter((b) => b.severity === 0)?.length || 0,
        unassessed: bugs?.filter((b) => !b.isAssessed)?.length || 0,
    }

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (file.type !== 'text/xml' && !file.name.endsWith('.xml')) {
            toast({
                title: "Invalid File Type",
                description: "Please select an XML file",
                variant: "destructive",
            })
            return
        }

        try {
            const result = await importBugs(file)
            toast({
                title: "Import Successful",
                description: `Successfully imported ${result.importedCount} bugs. ${result.skippedCount} duplicates skipped.`,
            })
            event.target.value = ''
            refetch()
        } catch (error) {
            toast({
                title: "Import Failed",
                description: "Failed to import bugs. Please check the file format.",
                variant: "destructive",
            })
        }
    }

    const handleCreateBug = async (data: CreateCoreBugDto) => {
        try {
            await create(data)
            toast({
                title: "Bug Created",
                description: "Bug has been created successfully",
            })
            refetch()
        } catch (error) {
            toast({
                title: "Creation Failed",
                description: "Failed to create bug. Please try again.",
                variant: "destructive",
            })
            throw error
        }
    }

    const handleUpdateBug = async (data: UpdateCoreBugDto) => {
        if (!editingBug) return

        try {
            await update({ id: editingBug.bugId, data })
            toast({
                title: "Bug Updated",
                description: "Bug has been updated successfully",
            })
            setEditingBug(null)
            refetch()
        } catch (error) {
            toast({
                title: "Update Failed",
                description: "Failed to update bug. Please try again.",
                variant: "destructive",
            })
            throw error
        }
    }

    const handleAssessBug = async (assessment: BugAssessmentDto) => {
        try {
            await assess({ id: assessment.bugId, assessment })
            toast({
                title: "Bug Assessed",
                description: "Bug assessment has been completed successfully",
            })
            setAssessingBug(null)
            refetch()
        } catch (error) {
            toast({
                title: "Assessment Failed",
                description: "Failed to assess bug. Please try again.",
                variant: "destructive",
            })
            throw error
        }
    }

    const handleDeleteBug = async (bugId: string) => {
        if (window.confirm("Are you sure you want to delete this bug? This action cannot be undone.")) {
            try {
                await deleteBug(bugId)
                toast({
                    title: "Bug Deleted",
                    description: "Bug has been deleted successfully",
                })
                refetch()
            } catch (error) {
                toast({
                    title: "Deletion Failed",
                    description: "Failed to delete bug. Please try again.",
                    variant: "destructive",
                })
            }
        }
    }

    const handleExport = async () => {
        try {
            const dataStr = JSON.stringify(filteredBugs, null, 2)
            const dataBlob = new Blob([dataStr], { type: 'application/json' })

            const url = URL.createObjectURL(dataBlob)
            const link = document.createElement('a')
            link.href = url
            link.download = `bugs-export-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            toast({
                title: "Export Successful",
                description: `Exported ${filteredBugs.length} bugs to JSON file`,
            })
        } catch (error) {
            toast({
                title: "Export Failed",
                description: "Failed to export bugs. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleApplyFilters = (newFilters: CoreBugQueryParams) => {
        setFilters(newFilters)
        toast({
            title: "Filters Applied",
            description: "Filters have been applied to bug results",
        })
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "New":
                return <AlertTriangle className="h-4 w-4" />
            case "InProgress":
                return <Clock className="h-4 w-4" />
            case "Done":
                return <CheckCircle2 className="h-4 w-4" />
            default:
                return <Bug className="h-4 w-4" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "New":
                return "bg-red-500/20 text-red-300 border-red-400/30"
            case "InProgress":
                return "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
            case "Done":
                return "bg-green-500/20 text-green-300 border-green-400/30"
            default:
                return "bg-gray-500/20 text-gray-300 border-gray-400/30"
        }
    }

    const hasActiveFilters = Object.values(filters).some(value => value !== undefined)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fillRule=%22evenodd%22%3E%3Cg fill=%22%239CA3AF%22 fillOpacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

            <div className="relative z-10">
                <PageHeader title="Bug Management" className="bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="relative w-96 group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur group-hover:blur-md transition-all duration-300"></div>
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
                            <Input
                                type="search"
                                placeholder="Search bugs by title, description, status, or JIRA key..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="relative pl-10 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-white/30 transition-all duration-300"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".xml"
                                    onChange={handleFileImport}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={importLoading}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={importLoading}
                                    className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-300"
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {importLoading ? "Importing..." : "Import XML"}
                                </Button>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilterDialog(true)}
                                className={`bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-300 ${
                                    hasActiveFilters ? 'ring-2 ring-blue-500/50' : ''
                                }`}
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filter {hasActiveFilters && `(${Object.values(filters).filter(v => v !== undefined).length})`}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExport}
                                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-300"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                            <Button
                                onClick={() => setShowCreateDialog(true)}
                                className="relative group overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
                            >
                <span className="relative z-10 flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  New Bug
                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            </Button>
                        </div>
                    </div>
                </PageHeader>

                <PageShell className="py-8">
                    {/* Statistics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                        <StatsCard title="Total Bugs" value={stats.total} icon={Bug} color="blue" loading={loading} />
                        <StatsCard title="New" value={stats.new} icon={AlertTriangle} color="red" loading={loading} />
                        <StatsCard title="In Progress" value={stats.inProgress} icon={Clock} color="yellow" loading={loading} />
                        <StatsCard title="Done" value={stats.done} icon={CheckCircle2} color="green" loading={loading} />
                        <StatsCard title="Critical" value={stats.critical} icon={Bug} color="red" loading={loading} />
                        <StatsCard title="Unassessed" value={stats.unassessed} icon={AlertTriangle} color="orange" loading={loading} />
                    </div>

                    {loading ? (
                        <BugTableSkeleton />
                    ) : error ? (
                        <Card className="bg-red-900/20 backdrop-blur-xl border-red-500/30 shadow-2xl">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 text-red-300 mb-4">
                                    <AlertTriangle className="h-5 w-5" />
                                    <span className="font-medium">Error loading bugs</span>
                                </div>
                                <p className="text-red-300 mb-4">{error}</p>
                                <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
                            </CardContent>
                        </Card>
                    ) : filteredBugs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="p-5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mb-6 backdrop-blur-sm">
                                <Bug className="h-16 w-16 text-blue-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-white">
                                {searchQuery || hasActiveFilters ? "No bugs found matching your criteria" : "No bugs found"}
                            </h3>
                            <p className="text-sm text-gray-400 max-w-sm mb-6">
                                {searchQuery || hasActiveFilters
                                    ? "Try adjusting your search terms or filters"
                                    : "Get started by creating your first bug report or importing from XML"
                                }
                            </p>
                            {!searchQuery && !hasActiveFilters && (
                                <Button onClick={() => setShowCreateDialog(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Bug
                                </Button>
                            )}
                        </div>
                    ) : (
                        <BugList bugs={filteredBugs} onEdit={setEditingBug} onAssess={setAssessingBug} onDelete={handleDeleteBug} />
                    )}
                </PageShell>
            </div>

            {/* Dialogs */}
            <BugFormDialog
                isOpen={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onSubmit={handleCreateBug}
                loading={createLoading}
            />

            <BugFormDialog
                isOpen={!!editingBug}
                onClose={() => setEditingBug(null)}
                onSubmit={handleUpdateBug}
                bug={editingBug}
                loading={updateLoading}
            />

            <BugFilterDialog
                isOpen={showFilterDialog}
                onClose={() => setShowFilterDialog(false)}
                onApply={handleApplyFilters}
                currentFilters={filters}
            />

            <BugAssessmentDialog
                isOpen={!!assessingBug}
                onClose={() => setAssessingBug(null)}
                onSubmit={handleAssessBug}
                bug={assessingBug}
                loading={assessLoading}
            />

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

function BugList({ bugs, onEdit, onAssess, onDelete }: any) {
    return (
        <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden">
                <CardHeader className="border-b border-white/10 bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-sm">
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                        <Bug className="h-5 w-5 text-purple-400" />
                        Bug Reports
                        <Badge className="ml-2 bg-purple-500/30 text-purple-200 border-purple-400/40">
                            {bugs.length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-white/5">
                        {bugs.map((bug: any, index: number) => (
                            <div key={bug.bugId} className="p-4 hover:bg-white/5 transition-all duration-200">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="font-medium text-white mb-1">{bug.bugTitle}</div>
                                        {bug.jiraKey && (
                                            <a
                                                href={bug.jiraLink || "#"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                {bug.jiraKey}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                    <BugSeverityBadge severity={bug.severity} />
                                </div>

                                <div className="text-sm text-gray-400 mb-3 line-clamp-2">
                                    {bug.bugDescription}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge className={`flex items-center gap-1 ${
                                            bug.status === "New" ? "bg-red-500/20 text-red-300 border-red-400/30" :
                                                bug.status === "InProgress" ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/30" :
                                                    bug.status === "Done" ? "bg-green-500/20 text-green-300 border-green-400/30" :
                                                        "bg-gray-500/20 text-gray-300 border-gray-400/30"
                                        }`}>
                                            {bug.status === "New" && <AlertTriangle className="h-4 w-4" />}
                                            {bug.status === "InProgress" && <Clock className="h-4 w-4" />}
                                            {bug.status === "Done" && <CheckCircle2 className="h-4 w-4" />}
                                            {bug.status}
                                        </Badge>
                                        <Badge className={bug.isAssessed
                                            ? "bg-green-500/20 text-green-300 border-green-400/30"
                                            : "bg-gray-500/20 text-gray-300 border-gray-400/30"
                                        }>
                                            {bug.isAssessed ? "Assessed" : "Pending"}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {new Date(bug.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">Tasks:</span>
                                        <span className="text-sm">
                      <span className="text-white font-medium">{bug.completedTaskCount}</span>
                      <span className="text-gray-400">/{bug.taskCount}</span>
                    </span>
                                        {bug.taskCount > 0 && (
                                            <div className="w-16 bg-white/10 rounded-full h-1">
                                                <div
                                                    className="h-1 bg-blue-500 rounded-full transition-all duration-300"
                                                    style={{ width: `${(bug.completedTaskCount / bug.taskCount) * 100}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onEdit(bug)}
                                            className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-400/30 text-blue-300 hover:text-blue-200 transition-all duration-200"
                                        >
                                            <Edit className="h-3.5 w-3.5 mr-1" />
                                            Edit
                                        </Button>
                                        {!bug.isAssessed && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onAssess(bug)}
                                                className="bg-green-500/10 hover:bg-green-500/20 border-green-400/30 text-green-300 hover:text-green-200 transition-all duration-200"
                                            >
                                                <CheckSquare className="h-3.5 w-3.5 mr-1" />
                                                Assess
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onDelete(bug.bugId)}
                                            className="bg-red-500/10 hover:bg-red-500/20 border-red-400/30 text-red-300 hover:text-red-200 transition-all duration-200"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function StatsCard({ title, value, icon: Icon, color, loading }: any) {
    const colorClasses = {
        blue: "from-blue-600/20 to-cyan-600/20 text-blue-400 bg-blue-500/20",
        red: "from-red-600/20 to-orange-600/20 text-red-400 bg-red-500/20",
        yellow: "from-yellow-600/20 to-amber-600/20 text-yellow-400 bg-yellow-500/20",
        green: "from-green-600/20 to-emerald-600/20 text-green-400 bg-green-500/20",
        orange: "from-orange-600/20 to-amber-600/20 text-orange-400 bg-orange-500/20",
    }

    const classes = colorClasses[color] || colorClasses.blue

    return (
        <div className="group relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${classes.split(' ')[0]} ${classes.split(' ')[1]} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300`}></div>
            <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-300 mb-1">{title}</p>
                            <p className="text-2xl font-bold text-white">
                                {loading ? "..." : value.toLocaleString()}
                            </p>
                        </div>
                        <div className={`p-2 ${classes.split(' ')[3]} rounded-xl backdrop-blur-sm`}>
                            <Icon className={`h-5 w-5 ${classes.split(' ')[2]}`} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function BugTableSkeleton() {
    return (
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl overflow-hidden">
            <CardHeader>
                <CardTitle className="text-white">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
                {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="p-4 animate-pulse">
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-48 bg-white/10" />
                            <Skeleton className="h-3 w-72 bg-white/10" />
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-20 bg-white/10" />
                                <Skeleton className="h-6 w-24 bg-white/10" />
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}