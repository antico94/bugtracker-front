import { useState, useMemo } from "react"
import { Search, Plus, Minus, Check, AlertTriangle, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BugSeverityBadge } from "@/components/bug-severity-badge"
import { useCoreBugs } from "@/hooks/use-core-bugs"
import type { CoreBugResponseDto, BugSeverity, Status, ProductType } from "@/types"

interface BugSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedBugIds: string[]) => Promise<void>
  mode: "add" | "remove"
  title?: string
  description?: string
  excludeBugIds?: string[]
  includeBugIds?: string[]
  loading?: boolean
}

interface FilterOptions {
  search: string
  severity?: BugSeverity
  status?: Status
  isAssessed?: boolean
  productType?: ProductType
}

export default function BugSelectionDialog({
  isOpen,
  onClose,
  onConfirm,
  mode,
  title,
  description,
  excludeBugIds = [],
  includeBugIds = [],
  loading = false
}: BugSelectionDialogProps) {
  const [selectedBugIds, setSelectedBugIds] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    severity: undefined,
    status: undefined,
    isAssessed: undefined,
    productType: undefined
  })

  // Fetch bugs with current filters
  const {
    bugs: allBugs,
    loading: bugsLoading
  } = useCoreBugs({
    severity: filters.severity,
    status: filters.status,
    isAssessed: filters.isAssessed,
    assessedProductType: filters.productType
  })

  // Filter bugs based on mode and search
  const filteredBugs = useMemo(() => {
    let bugs = allBugs

    // Apply mode-specific filtering
    if (mode === "add") {
      // For add mode, exclude bugs that are already in the list
      bugs = bugs.filter(bug => !excludeBugIds.includes(bug.bugId))
    } else {
      // For remove mode, only show bugs that are in the list
      bugs = bugs.filter(bug => includeBugIds.includes(bug.bugId))
    }

    // Apply search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase()
      bugs = bugs.filter(bug =>
        bug.bugTitle.toLowerCase().includes(searchTerm) ||
        bug.jiraKey.toLowerCase().includes(searchTerm) ||
        bug.bugDescription.toLowerCase().includes(searchTerm)
      )
    }

    return bugs
  }, [allBugs, excludeBugIds, includeBugIds, mode, filters.search])

  const toggleBugSelection = (bugId: string) => {
    const newSelected = new Set(selectedBugIds)
    if (newSelected.has(bugId)) {
      newSelected.delete(bugId)
    } else {
      newSelected.add(bugId)
    }
    setSelectedBugIds(newSelected)
  }

  const selectAll = () => {
    setSelectedBugIds(new Set(filteredBugs.map(bug => bug.bugId)))
  }

  const clearSelection = () => {
    setSelectedBugIds(new Set())
  }

  const handleConfirm = async () => {
    try {
      await onConfirm(Array.from(selectedBugIds))
      setSelectedBugIds(new Set())
      onClose()
    } catch (error) {
      console.error("Failed to update bug selection:", error)
    }
  }

  const resetFilters = () => {
    setFilters({
      search: "",
      severity: undefined,
      status: undefined,
      isAssessed: undefined,
      productType: undefined
    })
  }

  if (!isOpen) return null

  const dialogTitle = title || (mode === "add" ? "Add Bugs to Weekly Report" : "Remove Bugs from Weekly Report")
  const dialogDescription = description || (mode === "add" 
    ? "Select bugs to add to this weekly core bugs report"
    : "Select bugs to remove from this weekly core bugs report"
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-4xl max-h-[90vh]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl"></div>
        <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl flex flex-col h-[90vh]">
          <CardHeader className="border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl shadow-lg ${
                  mode === "add" ? "bg-green-500/20" : "bg-red-500/20"
                }`}>
                  {mode === "add" ? (
                    <Plus className="h-6 w-6 text-green-400" />
                  ) : (
                    <Minus className="h-6 w-6 text-red-400" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-white">
                    {dialogTitle}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {dialogDescription}
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

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Filters */}
            <div className="p-4 border-b border-white/10 bg-white/5 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search bugs by title, JIRA key, or description..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                />
              </div>

              {/* Filter controls */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs text-gray-300 mb-1 block">Severity</Label>
                  <Select
                    value={filters.severity?.toString() || ""}
                    onValueChange={(value) => setFilters(prev => ({ 
                      ...prev, 
                      severity: value ? parseInt(value) as BugSeverity : undefined 
                    }))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white text-xs">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Severity</SelectItem>
                      <SelectItem value="0">Critical</SelectItem>
                      <SelectItem value="1">Major</SelectItem>
                      <SelectItem value="2">Moderate</SelectItem>
                      <SelectItem value="3">Minor</SelectItem>
                      <SelectItem value="4">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-gray-300 mb-1 block">Status</Label>
                  <Select
                    value={filters.status || ""}
                    onValueChange={(value) => setFilters(prev => ({ 
                      ...prev, 
                      status: value || undefined 
                    }))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white text-xs">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Status</SelectItem>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="InProgress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-gray-300 mb-1 block">Assessment</Label>
                  <Select
                    value={filters.isAssessed?.toString() || ""}
                    onValueChange={(value) => setFilters(prev => ({ 
                      ...prev, 
                      isAssessed: value ? value === "true" : undefined 
                    }))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white text-xs">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="true">Assessed</SelectItem>
                      <SelectItem value="false">Unassessed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-gray-300 mb-1 block">Product</Label>
                  <Select
                    value={filters.productType || ""}
                    onValueChange={(value) => setFilters(prev => ({ 
                      ...prev, 
                      productType: value || undefined 
                    }))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white text-xs">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Product</SelectItem>
                      <SelectItem value="InteractiveResponseTechnology">IRT</SelectItem>
                      <SelectItem value="TM">Trial Manager</SelectItem>
                      <SelectItem value="ExternalModule">External Module</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Selection controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                    disabled={filteredBugs.length === 0}
                    className="bg-white/5 border-white/20 text-gray-300 hover:bg-white/10"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Select All ({filteredBugs.length})
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                    disabled={selectedBugIds.size === 0}
                    className="bg-white/5 border-white/20 text-gray-300 hover:bg-white/10"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="bg-white/5 border-white/20 text-gray-300 hover:bg-white/10"
                  >
                    Reset Filters
                  </Button>
                </div>
                <div className="text-sm text-gray-400">
                  {selectedBugIds.size} selected
                </div>
              </div>
            </div>

            {/* Bug list */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {bugsLoading ? (
                    // Loading skeleton
                    <div className="space-y-3">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                          <Skeleton className="h-4 w-4 bg-white/20" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4 bg-white/20" />
                            <Skeleton className="h-3 w-1/2 bg-white/20" />
                          </div>
                          <Skeleton className="h-5 w-16 bg-white/20" />
                        </div>
                      ))}
                    </div>
                  ) : filteredBugs.length === 0 ? (
                    // Empty state
                    <div className="p-8 text-center">
                      <Info className="h-8 w-8 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No Bugs Found</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        {mode === "add" 
                          ? "No bugs match your criteria or all bugs are already added."
                          : "No bugs are available to remove with the current filters."
                        }
                      </p>
                      {(filters.search || filters.severity !== undefined || filters.status || filters.isAssessed !== undefined || filters.productType) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetFilters}
                          className="bg-white/5 border-white/20 text-gray-300 hover:bg-white/10"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  ) : (
                    // Bug list
                    filteredBugs.map((bug) => (
                      <div
                        key={bug.bugId}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                          selectedBugIds.has(bug.bugId)
                            ? "bg-blue-500/20 border-blue-400/30"
                            : "bg-white/5 border-white/20 hover:bg-white/10"
                        }`}
                        onClick={() => toggleBugSelection(bug.bugId)}
                      >
                        <Checkbox
                          checked={selectedBugIds.has(bug.bugId)}
                          onCheckedChange={() => toggleBugSelection(bug.bugId)}
                          className="border-white/30 data-[state=checked]:bg-blue-500"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">
                            {bug.bugTitle}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="font-mono bg-red-500/10 border-red-400/30 text-red-300 text-xs">
                              {bug.jiraKey}
                            </Badge>
                            {bug.isAssessed && bug.assessedProductType && (
                              <Badge variant="outline" className="bg-green-500/10 border-green-400/30 text-green-300 text-xs">
                                {bug.assessedProductType === "InteractiveResponseTechnology" ? "IRT" : bug.assessedProductType}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <BugSeverityBadge severity={bug.severity} />
                          <Badge
                            className={
                              bug.status === "Done"
                                ? "bg-green-500/20 text-green-300 border-green-400/30"
                                : bug.status === "InProgress"
                                ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                                : "bg-blue-500/20 text-blue-300 border-blue-400/30"
                            }
                          >
                            {bug.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 bg-white/5 p-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {selectedBugIds.size > 0 ? (
                  <>
                    <Info className="h-4 w-4" />
                    <span>
                      {selectedBugIds.size} bug{selectedBugIds.size !== 1 ? 's' : ''} selected
                      {mode === "add" ? " to add" : " to remove"}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    <span>Select at least one bug to continue</span>
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
                  onClick={handleConfirm}
                  disabled={loading || selectedBugIds.size === 0}
                  className={`shadow-lg disabled:opacity-50 ${
                    mode === "add"
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      : "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {mode === "add" ? "Adding..." : "Removing..."}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {mode === "add" ? (
                        <Plus className="h-4 w-4" />
                      ) : (
                        <Minus className="h-4 w-4" />
                      )}
                      {mode === "add" ? `Add ${selectedBugIds.size} Bug${selectedBugIds.size !== 1 ? 's' : ''}` : `Remove ${selectedBugIds.size} Bug${selectedBugIds.size !== 1 ? 's' : ''}`}
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