"use client"

import type React from "react" // Added useMemo
import {useMemo, useState, useRef} from "react"
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  CheckSquare,
  Clock,
  Download,
  Edit,
  ExternalLink,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {PageHeader} from "@/components/page-header"
import {PageShell} from "@/components/page-shell"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Skeleton} from "@/components/ui/skeleton"
import {BugSeverityBadge} from "@/components/bug-severity-badge"
import {useCoreBugs} from "@/hooks/use-core-bugs"
import {useWeeklyCoreBugs} from "@/hooks/use-weekly-core-bugs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {toast} from "@/hooks/use-toast"
import {
  BugAssessmentDto,
  CoreBugQueryParams,
  CoreBugResponseDto,
  CreateCoreBugDto,
  Status,
  UpdateCoreBugDto,
  ProductType,
} from "@/types"
import BugFormDialog from "@/components/dialogs/bug-form-dialog"
import {BugFilterDialog} from "@/components/dialogs/bug-filter-dialog"
import {BugAssessmentDialog} from "@/components/dialogs/bug-assessment-dialog"
import {GlassButton} from "@/components/glass"

export default function BugsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [apiFilters, setApiFilters] = useState<CoreBugQueryParams>({}) // Renamed from filters
  const [uiFilters, setUiFilters] = useState<{ status?: Status; isAssessed?: boolean }>({}) // New state for card filters
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [editingBug, setEditingBug] = useState<CoreBugResponseDto | null>(null)
  const [assessingBug, setAssessingBug] = useState<CoreBugResponseDto | null>(null)

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    bugs, // This is now based on apiFilters only
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
    refetch,
  } = useCoreBugs(apiFilters)

  // Weekly core bugs for adding bugs to reports
  const { addBugs: addBugToWeeklyReport } = useWeeklyCoreBugs()

  // Calculate stats based on the 'bugs' array (filtered by apiFilters)
  // This ensures stats cards always reflect the broader dataset counts.
  const stats = useMemo(() => {
    const currentBugs = bugs || []
    return {
      total: currentBugs.length,
      new: currentBugs.filter((b) => b.status === "New").length,
      inProgress: currentBugs.filter((b) => b.status === "InProgress").length,
      done: currentBugs.filter((b) => b.status === "Done").length,
      unassessed: currentBugs.filter((b) => !b.isAssessed).length,
    }
  }, [bugs])

  // Apply uiFilters (from cards) and searchQuery client-side
  const bugsToDisplay = useMemo(() => {
    let result = bugs || []

    // Apply UI filters (from cards)
    if (uiFilters.status) {
      result = result.filter((bug) => bug.status === uiFilters.status)
    } else if (uiFilters.isAssessed === false) {
      result = result.filter((bug) => !bug.isAssessed)
    }

    // Apply search query
    if (searchQuery) {
      const lowerSearchQuery = searchQuery.toLowerCase()
      result = result.filter(
          (bug) =>
              bug.bugTitle?.toLowerCase().includes(lowerSearchQuery) ||
              bug.bugDescription?.toLowerCase().includes(lowerSearchQuery) ||
              bug.status?.toLowerCase().includes(lowerSearchQuery) ||
              bug.jiraKey?.toLowerCase().includes(lowerSearchQuery),
      )
    }
    return result
  }, [bugs, uiFilters, searchQuery])

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "text/xml" && !file.name.endsWith(".xml")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an XML file",
        variant: "destructive",
      })
      return
    }

    try {
      const importResult = await importBugs(file)
      toast({
        title: "Import Successful",
        description: `Successfully imported ${importResult.importedCount} bugs. ${importResult.skippedCount} duplicates skipped.`,
      })
      event.target.value = ""
      refetch()
    } catch (err) {
      console.error("Import failed:", err)
      toast({
        title: "Import Failed",
        description: err instanceof Error ? err.message : "Failed to import bugs. Please check the file format.",
        variant: "destructive",
      })
    }
  }

  const handleCreateBug = async (
      data: CreateCoreBugDto | UpdateCoreBugDto,
      assessmentData?: { productType: ProductType; versions: string[] },
      weeklyReportId?: string
  ) => {
    try {
      // For create, we need to ensure we have the required fields
      const createData = data as CreateCoreBugDto
      const createdBug = await create(createData)

      // If this is a manually created bug, auto-assess it
      if (assessmentData && createdBug) {
        try {
          const assessment: BugAssessmentDto = {
            bugId: createdBug.bugId,
            assessedProductType: assessmentData.productType,
            assessedImpactedVersions: assessmentData.versions,
          }
          await assess({ id: createdBug.bugId, assessment })

          toast({
            title: "Bug Created & Assessed",
            description: "Bug has been created and automatically assessed successfully",
          })
        } catch (assessError) {
          console.error("Auto-assessment failed:", assessError)
          toast({
            title: "Bug Created",
            description: "Bug created successfully, but auto-assessment failed. You can assess it manually.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Bug Created",
          description: "Bug has been created successfully",
        })
      }

      // If a weekly report was specified, add the bug to it
      if (weeklyReportId && createdBug) {
        try {
          await addBugToWeeklyReport({
            id: weeklyReportId,
            bugsData: {
              weeklyCoreBugsId: weeklyReportId,
              bugIds: [createdBug.bugId]
            }
          })
          toast({
            title: "Added to Weekly Report",
            description: "Bug has been added to the selected weekly report",
          })
        } catch (weeklyError) {
          console.error("Failed to add bug to weekly report:", weeklyError)
          toast({
            title: "Weekly Report Warning",
            description: "Bug created successfully, but failed to add to weekly report. You can add it manually.",
            variant: "destructive",
          })
        }
      }

      setShowCreateDialog(false)
      refetch()
    } catch (err) {
      console.error("Bug creation failed:", err)
      toast({
        title: "Creation Failed",
        description: err instanceof Error ? err.message : "Failed to create bug. Please try again.",
        variant: "destructive",
      })
      throw err
    }
  }

  const handleUpdateBug = async (
    data: CreateCoreBugDto | UpdateCoreBugDto, 
    assessmentData?: { productType: ProductType; versions: string[] }, 
    weeklyReportId?: string
  ) => {
    if (!editingBug) return
    try {
      // For update, we only need the UpdateCoreBugDto fields
      const updateData: UpdateCoreBugDto = {
        bugTitle: data.bugTitle,
        bugDescription: data.bugDescription,
        severity: data.severity,
        foundInBuild: data.foundInBuild,
        affectedVersions: data.affectedVersions,
      }
      await update({ id: editingBug.bugId, data: updateData })
      toast({
        title: "Bug Updated",
        description: "Bug has been updated successfully",
      })
      setEditingBug(null)
      refetch()
    } catch (err) {
      toast({
        title: "Update Failed",
        description: "Failed to update bug. Please try again.",
        variant: "destructive",
      })
      throw err
    }
  }

  const handleAssessBug = async (assessment: BugAssessmentDto, weeklyReportId?: string) => {
    if (!assessingBug) return
    try {
      await assess({ id: assessment.bugId, assessment })
      
      // If a weekly report was specified, add the bug to it
      if (weeklyReportId) {
        try {
          await addBugToWeeklyReport({
            id: weeklyReportId,
            bugsData: {
              weeklyCoreBugsId: weeklyReportId,
              bugIds: [assessment.bugId]
            }
          })
          toast({
            title: "Bug Assessed & Added to Weekly Report",
            description: "Bug has been assessed and added to the selected weekly report",
          })
        } catch (weeklyError) {
          console.error("Failed to add bug to weekly report:", weeklyError)
          toast({
            title: "Bug Assessed",
            description: "Bug assessed successfully, but failed to add to weekly report. You can add it manually.",
          })
        }
      } else {
        toast({
          title: "Bug Assessed",
          description: "Bug assessment has been completed successfully",
        })
      }
      
      setAssessingBug(null)
      refetch()
    } catch (err) {
      toast({
        title: "Assessment Failed",
        description: "Failed to assess bug. Please try again.",
        variant: "destructive",
      })
      throw err
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
      } catch (err) {
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
      const dataStr = JSON.stringify(bugsToDisplay, null, 2) // Export currently displayed bugs
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `bugs-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast({
        title: "Export Successful",
        description: `Exported ${bugsToDisplay.length} bugs to JSON file`,
      })
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "Failed to export bugs. Please try again.",
        variant: "destructive",
      })
    }
  }

  // This handler is for the main filter dialog
  const handleApplyApiFilters = (newFilters: CoreBugQueryParams) => {
    setApiFilters(newFilters)
    // Optionally, reset UI filters when main filters change, or decide if they should persist
    // setUiFilters({});
    toast({
      title: "Filters Applied",
      description: `Main filters have been updated.`,
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
        return "bg-red-500/20 text-red-300 border border-red-500/40"
      case "InProgress":
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
      case "Done":
        return "bg-green-500/20 text-green-300 border border-green-500/40"
      default:
        return "bg-slate-600/30 text-gray-300 border border-slate-500/40"
    }
  }

  // Check if any main API filters are active (excluding default/empty values)
  const hasActiveApiFilters = Object.values(apiFilters).some(
      (value) => value !== undefined && value !== "" && (Array.isArray(value) ? value.length > 0 : true),
  )

  const handleCardFilterClick = (filterType: "total" | Status | "unassessed") => {
    let newUiFilters: { status?: Status; isAssessed?: boolean } = {}
    let toastMessage = ""

    if (filterType === "total") {
      newUiFilters = {}
      toastMessage = "Card filters cleared. Showing all bugs (based on main filters)."
    } else if (filterType === "New" || filterType === "InProgress" || filterType === "Done") {
      if (uiFilters.status === filterType) {
        // Toggle off
        newUiFilters = {}
        toastMessage = `Filter for '${filterType}' status removed.`
      } else {
        // Toggle on
        newUiFilters = { status: filterType }
        toastMessage = `Showing bugs with '${filterType}' status.`
      }
    } else if (filterType === "unassessed") {
      if (uiFilters.isAssessed === false) {
        // Toggle off
        newUiFilters = {}
        toastMessage = "Filter for unassessed bugs removed."
      } else {
        // Toggle on
        newUiFilters = { isAssessed: false }
        toastMessage = "Showing unassessed bugs."
      }
    }
    setUiFilters(newUiFilters)
    toast({ title: "UI Filter Changed", description: toastMessage })
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fillRule=%22evenodd%22%3E%3Cg fill=%22%239CA3AF%22 fillOpacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-10"></div>

        <div className="relative z-10">
          <PageHeader title="Bug Management" className="bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="relative w-96 group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg blur-sm group-hover:blur transition-all duration-300 opacity-50 group-hover:opacity-75"></div>
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 z-10" />
                <Input
                    type="search"
                    placeholder="Search bugs by title, description, status, or JIRA key..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="relative pl-10 pr-4 py-2.5 bg-slate-800/50 backdrop-blur-md border border-slate-700/80 rounded-lg text-gray-200 placeholder:text-gray-500 focus:bg-slate-700/60 focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/70 transition-all duration-300 shadow-inner"
                />
              </div>
              <div className="flex items-center gap-2">
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xml"
                    onChange={handleFileImport}
                    className="hidden"
                />

                <Button
                    variant="outline"
                    size="sm"
                    onClick={triggerFileInput}
                    disabled={importLoading}
                    className="bg-slate-800/50 backdrop-blur-md border border-slate-700/80 text-gray-300 hover:bg-slate-700/70 hover:border-slate-600/90 hover:text-white transition-all duration-300"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {importLoading ? "Importing..." : "Import XML"}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilterDialog(true)}
                    className={`bg-slate-800/50 backdrop-blur-md border border-slate-700/80 text-gray-300 hover:bg-slate-700/70 hover:border-slate-600/90 hover:text-white transition-all duration-300 ${
                        hasActiveApiFilters ? "ring-1 ring-blue-500/70" : "" // Reflects apiFilters
                    }`}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter{" "}
                  {hasActiveApiFilters &&
                      `(${Object.values(apiFilters).filter((v) => v !== undefined && v !== "" && (Array.isArray(v) ? v.length > 0 : true)).length})`}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="bg-slate-800/50 backdrop-blur-md border border-slate-700/80 text-gray-300 hover:bg-slate-700/70 hover:border-slate-600/90 hover:text-white transition-all duration-300"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <GlassButton onClick={() => setShowCreateDialog(true)} variant="primary">
                  <Plus className="mr-2 h-4 w-4" />
                  New Bug
                </GlassButton>
              </div>
            </div>
          </PageHeader>

          <PageShell className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <StatsCard
                  title="Total Bugs"
                  value={stats.total} // From useMemo based on 'bugs' (apiFilters)
                  icon={Bug}
                  color="blue"
                  loading={loading}
                  onClick={() => handleCardFilterClick("total")}
                  // Total card is not usually marked "active"
              />
              <StatsCard
                  title="New"
                  value={stats.new} // From useMemo
                  icon={AlertTriangle}
                  color="red"
                  loading={loading}
                  onClick={() => handleCardFilterClick(Status.New)}
                  isActive={uiFilters.status === "New"}
              />
              <StatsCard
                  title="In Progress"
                  value={stats.inProgress} // From useMemo
                  icon={Clock}
                  color="yellow"
                  loading={loading}
                  onClick={() => handleCardFilterClick(Status.InProgress)}
                  isActive={uiFilters.status === "InProgress"}
              />
              <StatsCard
                  title="Done"
                  value={stats.done} // From useMemo
                  icon={CheckCircle2}
                  color="green"
                  loading={loading}
                  onClick={() => handleCardFilterClick(Status.Done)}
                  isActive={uiFilters.status === "Done"}
              />
              <StatsCard
                  title="Unassessed"
                  value={stats.unassessed} // From useMemo
                  icon={AlertTriangle}
                  color="orange"
                  loading={loading}
                  onClick={() => handleCardFilterClick("unassessed")}
                  isActive={uiFilters.isAssessed === false}
              />
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
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refetch}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-white/30"
                    >
                      Retry
                    </Button>
                  </CardContent>
                </Card>
            ) : bugsToDisplay.length === 0 ? ( // Check bugsToDisplay for empty state
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="p-5 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full mb-6 backdrop-blur-sm border border-white/10 shadow-lg">
                    <Bug className="h-16 w-16 text-blue-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-100">
                    {searchQuery || uiFilters.status || uiFilters.isAssessed !== undefined || hasActiveApiFilters
                        ? "No bugs found matching your criteria"
                        : "No bugs found"}
                  </h3>
                  <p className="text-sm text-gray-400 max-w-md mb-6">
                    {searchQuery || uiFilters.status || uiFilters.isAssessed !== undefined || hasActiveApiFilters
                        ? "Try adjusting your search terms or filters to find what you're looking for"
                        : "Get started by creating your first bug report or importing from XML"}
                  </p>
                  {!(searchQuery || uiFilters.status || uiFilters.isAssessed !== undefined || hasActiveApiFilters) && (
                      <div className="flex gap-3">
                        <GlassButton
                            onClick={() => setShowCreateDialog(true)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create Bug
                        </GlassButton>
                        <GlassButton
                            variant="outline"
                            onClick={triggerFileInput}
                            disabled={importLoading}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Import XML
                        </GlassButton>
                      </div>
                  )}
                </div>
            ) : (
                <BugList
                    bugs={bugsToDisplay} // Pass the client-side filtered bugs
                    onEdit={setEditingBug}
                    onAssess={setAssessingBug}
                    onDelete={handleDeleteBug}
                    getStatusIcon={getStatusIcon}
                    getStatusColor={getStatusColor}
                />
            )}
          </PageShell>
        </div>

        <BugFormDialog
            isOpen={showCreateDialog}
            onClose={() => setShowCreateDialog(false)}
            onSubmit={handleCreateBug}
            loading={createLoading || assessLoading}
        />
        <BugFormDialog
            isOpen={!!editingBug}
            onClose={() => setEditingBug(null)}
            onSubmit={handleUpdateBug}
            bug={editingBug || undefined}
            loading={updateLoading}
        />
        <BugFilterDialog // This dialog updates apiFilters
            isOpen={showFilterDialog}
            onClose={() => setShowFilterDialog(false)}
            onApply={handleApplyApiFilters} // Use the new handler
            currentFilters={apiFilters} // Pass apiFilters
        />
        <BugAssessmentDialog
            isOpen={!!assessingBug}
            onClose={() => setAssessingBug(null)}
            onSubmit={handleAssessBug}
            bug={assessingBug || undefined}
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
          .line-clamp-1 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
          }
          .line-clamp-2 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }
        `}</style>
      </div>
  )
}

function BugList({
                   bugs,
                   onEdit,
                   onAssess,
                   onDelete,
                   getStatusIcon,
                   getStatusColor,
                 }: {
  bugs: CoreBugResponseDto[]
  onEdit: (bug: CoreBugResponseDto) => void
  onAssess: (bug: CoreBugResponseDto) => void
  onDelete: (bugId: string) => void
  getStatusIcon: (status: string) => React.ReactNode
  getStatusColor: (status: string) => string
}) {
  return (
      <div className="group relative">
        <div className="absolute -inset-px bg-gradient-to-br from-purple-600/40 to-blue-600/40 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500 opacity-70 group-hover:opacity-100"></div>
        <Card className="relative bg-slate-800/70 backdrop-blur-xl border border-slate-700/80 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-xl overflow-hidden">
          <CardHeader className="border-b border-slate-700/60 bg-slate-900/30 backdrop-blur-sm px-6 py-4">
            <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
              <Bug className="h-5 w-5 text-purple-400" />
              Bug Reports
              <Badge
                  variant="outline"
                  className="ml-2 bg-purple-500/20 text-purple-300 border-purple-400/50 text-xs px-2 py-0.5"
              >
                {bugs.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm mt-1">
              Manage and track all bugs in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-x-4 lg:gap-x-6 px-6 py-3 bg-slate-800/50 border-b border-slate-700/60 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <div className="col-span-5">Bug Details</div>
              <div className="col-span-1 text-center">Severity</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-center">Assessment</div>
              <div className="col-span-1 text-center">Tasks</div>
              <div className="col-span-1 text-center">Created</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Bug List */}
            <div className="divide-y divide-slate-700/60">
              {bugs.map((bug, index) => (
                  <div
                      key={bug.bugId}
                      className="px-6 py-4 hover:bg-slate-700/30 transition-colors duration-150"
                      style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Desktop Layout */}
                    <div className="hidden md:grid grid-cols-12 gap-x-4 lg:gap-x-6 items-center">
                      <div className="col-span-12 md:col-span-5">
                        <div className="space-y-1">
                          {bug.jiraKey ? (
                              <a
                                  href={bug.jiraLink || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 font-medium text-sky-400 hover:text-sky-300 hover:underline transition-colors text-sm md:text-base group-hover/item:text-sky-300"
                                  onClick={(e) => e.stopPropagation()}
                              >
                                {bug.jiraKey}
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                          ) : (
                              <span className="font-medium text-slate-100 text-sm md:text-base">No JIRA Key</span>
                          )}
                          <div className="text-xs text-slate-300 mt-1">{bug.bugTitle}</div>
                        </div>
                      </div>
                      <div className="col-span-4 md:col-span-1 text-left md:text-center">
                        <span className="md:hidden text-xs text-slate-500 mr-1">Severity: </span>
                        <BugSeverityBadge severity={bug.severity} className="text-xs" />
                      </div>
                      <div className="col-span-4 md:col-span-1 text-left md:text-center">
                        <span className="md:hidden text-xs text-slate-500 mr-1">Status: </span>
                        <Badge
                            className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 ${getStatusColor(bug.status)}`}
                        >
                          {getStatusIcon(bug.status)}
                          {bug.status}
                        </Badge>
                      </div>
                      <div className="col-span-4 md:col-span-1 text-left md:text-center">
                        <span className="md:hidden text-xs text-slate-500 mr-1">Assessment: </span>
                        <Badge
                            variant={bug.isAssessed ? "default" : "secondary"}
                            className={`inline-flex items-center text-xs px-2 py-0.5 ${
                                bug.isAssessed
                                    ? "bg-green-500/20 text-green-300 border-green-400/40"
                                    : "bg-slate-600/30 text-gray-400 border-slate-500/40"
                            }`}
                        >
                          {bug.isAssessed ? "Assessed" : "Pending"}
                        </Badge>
                      </div>
                      <div className="col-span-4 md:col-span-1 text-left md:text-center">
                        <span className="md:hidden text-xs text-slate-500 mr-1">Tasks: </span>
                        <div className="text-sm inline-block md:block">
                          <span className="text-gray-200 font-medium">{bug.completedTaskCount}</span>
                          <span className="text-gray-400">/{bug.taskCount}</span>
                        </div>
                        {bug.taskCount > 0 && (
                            <div className="w-12 bg-white/10 rounded-full h-1 mt-1 mx-auto hidden md:block">
                              <div
                                  className="h-1 bg-blue-500 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${(bug.completedTaskCount / bug.taskCount) * 100}%`,
                                  }}
                              />
                            </div>
                        )}
                      </div>
                      <div className="col-span-4 md:col-span-1 text-left md:text-center">
                        <span className="md:hidden text-xs text-slate-500 mr-1">Created: </span>
                        <div className="text-xs text-gray-400 inline-block md:block">
                          {new Date(bug.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-2 flex items-center justify-start md:justify-end gap-2 mt-2 md:mt-0">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-md"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View Bug</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-gray-400 hover:text-gray-100 hover:bg-slate-700/50 rounded-md"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                              align="end"
                              className="bg-slate-800/90 backdrop-blur-lg border-slate-700 text-gray-200 shadow-2xl w-40"
                          >
                            {!bug.isAssessed && (
                                <DropdownMenuItem
                                    onClick={() => onEdit(bug)}
                                    className="hover:!bg-slate-700/70 focus:!bg-slate-700/70 cursor-pointer group"
                                >
                                  <Edit className="mr-2 h-4 w-4 text-blue-400 group-hover:text-blue-300" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                            )}
                            {!bug.isAssessed && (
                                <DropdownMenuItem
                                    onClick={() => onAssess(bug)}
                                    className="hover:!bg-slate-700/70 focus:!bg-slate-700/70 cursor-pointer group"
                                >
                                  <CheckSquare className="mr-2 h-4 w-4 text-green-400 group-hover:text-green-300" />
                                  <span>Assess</span>
                                </DropdownMenuItem>
                            )}
                            {!bug.isAssessed && <DropdownMenuSeparator className="bg-slate-700/50" />}
                            <DropdownMenuItem
                                onClick={() => onDelete(bug.bugId)}
                                className="text-red-400 hover:!text-red-300 hover:!bg-red-500/30 focus:!bg-red-500/30 cursor-pointer group"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

function StatsCard({
                     title,
                     value,
                     icon: Icon,
                     color,
                     loading,
                     onClick,
                     isActive,
                   }: {
  title: string
  value: number
  icon: any
  color: string
  loading: boolean
  onClick?: () => void
  isActive?: boolean
}) {
  const colorClasses = {
    blue: "from-blue-500/30 to-cyan-500/30 text-blue-300 bg-blue-600/30 border-blue-500/50 ring-blue-500",
    red: "from-red-500/30 to-orange-500/30 text-red-300 bg-red-600/30 border-red-500/50 ring-red-500",
    yellow: "from-yellow-500/30 to-amber-500/30 text-yellow-300 bg-yellow-600/30 border-yellow-500/50 ring-yellow-500",
    green: "from-green-500/30 to-emerald-500/30 text-green-300 bg-green-600/30 border-green-500/50 ring-green-500",
    orange: "from-orange-500/30 to-amber-500/30 text-orange-300 bg-orange-600/30 border-orange-500/50 ring-orange-500",
  }

  const baseClasses = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue
  const [gradientFrom, gradientTo, textColor, bgColor, borderColor, ringColor] = baseClasses.split(" ")

  return (
      <div
          className={`group relative ${onClick ? "cursor-pointer" : ""}`}
          onClick={onClick}
          role={onClick ? "button" : undefined}
          tabIndex={onClick ? 0 : undefined}
          onKeyDown={
            onClick
                ? (e) => {
                  if (e.key === "Enter" || e.key === " ") onClick()
                }
                : undefined
          }
      >
        <div
            className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-xl 
                    ${isActive ? "blur-xl opacity-100" : "blur-lg group-hover:blur-xl opacity-70 group-hover:opacity-100"} 
                    transition-all duration-300`}
        ></div>
        <Card
            className={`relative bg-slate-800/60 backdrop-blur-lg border ${borderColor} 
                    shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden 
                    ${isActive ? `ring-2 ring-offset-slate-900 ${ringColor}` : "ring-transparent"}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-0.5">{title}</p>
                <p className="text-3xl font-bold text-gray-100">{loading ? "..." : value.toLocaleString()}</p>
              </div>
              <div className={`p-3 ${bgColor} rounded-lg backdrop-filter backdrop-blur-sm bg-opacity-50`}>
                <Icon className={`h-6 w-6 ${textColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}

function BugTableSkeleton() {
  return (
      <div className="group relative">
        <div className="absolute -inset-px bg-gradient-to-br from-purple-600/40 to-blue-600/40 rounded-xl blur-lg opacity-70"></div>
        <Card className="relative bg-slate-800/70 backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-xl overflow-hidden">
          <CardHeader className="border-b border-slate-700/60 bg-slate-900/30 backdrop-blur-sm px-6 py-4">
            <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
              <Bug className="h-5 w-5 text-purple-400" />
              Bug Reports
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm mt-1">Loading bug reports...</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-700/60">
              {Array(5)
                  .fill(0)
                  .map((_, i) => (
                      <div key={i} className="px-6 py-4 animate-pulse">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-3/5 bg-slate-700/50 rounded" />
                              <Skeleton className="h-3 w-1/4 bg-slate-700/50 rounded" />
                              <Skeleton className="h-3 w-4/5 bg-slate-700/50 rounded" />
                            </div>
                            <Skeleton className="h-6 w-16 bg-slate-700/50 rounded-md" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Skeleton className="h-6 w-20 bg-slate-700/50 rounded-md" />
                              <Skeleton className="h-6 w-24 bg-slate-700/50 rounded-md" />
                            </div>
                            <div className="flex gap-2">
                              <Skeleton className="h-8 w-8 bg-slate-700/50 rounded-md" />
                              <Skeleton className="h-8 w-8 bg-slate-700/50 rounded-md" />
                            </div>
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