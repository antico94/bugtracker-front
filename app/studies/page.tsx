"use client"

/**
 * Enhanced Studies Management Page with Professional Design
 *
 * Design improvements:
 * - Dark theme with sophisticated glassmorphism effects
 * - Animated gradient background blobs for visual interest
 * - Enhanced color scheme with gradient accents
 * - Improved card designs with glass effects and subtle animations
 * - Better visual hierarchy and spacing
 * - Professional hover states and transitions
 * - Enhanced empty states with actionable CTAs
 * - Refined typography and color contrasts
 * - Subtle patterns and depth with shadows
 * - Premium feel with attention to detail
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStudies, useIRTs, useTrialManagers } from "@/hooks"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Search, Plus, FileText, Beaker, ChevronUp, ChevronDown, TrendingUp, Database, Sparkles, Activity, BarChart3 } from 'lucide-react'
import { GlassButton } from "@/components/glass"

// Define sort types
type SortDirection = "asc" | "desc"
type SortConfig<T> = {
  key: keyof T | string | null
  direction: SortDirection
}

export default function StudiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // Sorting states for each table
  const [irtSort, setIrtSort] = useState<SortConfig<any>>({ key: null, direction: "asc" })
  const [tmSort, setTmSort] = useState<SortConfig<any>>({ key: null, direction: "asc" })
  const [studySort, setStudySort] = useState<SortConfig<any>>({ key: null, direction: "asc" })

  const { irts, loading: irtsLoading } = useIRTs()
  const { trialManagers, loading: tmsLoading } = useTrialManagers()
  const { studies, loading: studiesLoading } = useStudies()

  // Filter data based on search query
  const filteredIRTs = irts.filter(
      (irt) =>
          irt.version?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          irt.jiraKey?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          irt.protocol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          irt.study?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredTMs = trialManagers.filter(
      (tm) =>
          tm.version?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tm.jiraKey?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tm.protocol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tm.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredStudies = studies.filter(
      (study) =>
          study.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          study.protocol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          study.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Generic sort function
  const sortData = <T extends Record<string, any>>(data: T[], sortConfig: SortConfig<T>): T[] => {
    if (!sortConfig.key) return data

    return [...data].sort((a, b) => {
      const getNestedValue = (obj: any, path: string): any => {
        const keys = path.split(".")
        return keys.reduce((o, key) => (o && o[key] !== undefined ? o[key] : null), obj)
      }

      const aValue = getNestedValue(a, sortConfig.key as string)
      const bValue = getNestedValue(b, sortConfig.key as string)

      if (aValue === null || aValue === undefined) return sortConfig.direction === "asc" ? 1 : -1
      if (bValue === null || bValue === undefined) return sortConfig.direction === "asc" ? -1 : 1

      if (Array.isArray(aValue) && Array.isArray(bValue)) {
        const aLength = aValue.length
        const bLength = bValue.length
        return sortConfig.direction === "asc" ? aLength - bLength : bLength - aLength
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortConfig.direction === "asc" ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1
    })
  }

  // Sort handler
  const handleSort = <T extends Record<string, any>>(
      key: string,
      currentSort: SortConfig<T>,
      setSort: React.Dispatch<React.SetStateAction<SortConfig<T>>>,
  ) => {
    if (currentSort.key === key) {
      setSort({
        key,
        direction: currentSort.direction === "asc" ? "desc" : "asc",
      })
    } else {
      setSort({
        key,
        direction: "asc",
      })
    }
  }

  // Apply sorting
  const sortedIRTs = sortData(filteredIRTs, irtSort)
  const sortedTMs = sortData(filteredTMs, tmSort)
  const sortedStudies = sortData(filteredStudies, studySort)

  // Sort indicator component
  const SortIndicator = ({ column, sortConfig }: { column: string; sortConfig: SortConfig<any> }) => {
    if (sortConfig.key !== column) return null
    return sortConfig.direction === "asc" ? (
        <ChevronUp className="ml-1 h-3.5 w-3.5 inline text-blue-500/70" />
    ) : (
        <ChevronDown className="ml-1 h-3.5 w-3.5 inline text-blue-500/70" />
    )
  }

  // Statistics cards
  const totalIRTs = irts.length
  const totalTMs = trialManagers.length
  const totalStudies = studies.length
  const totalTasks = studies.reduce((acc, study) => acc + (study.tasks?.length || 0), 0)

  console.log("Studies data:", { irts, trialManagers, studies })

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
          <PageHeader
              title="Studies Management"
              className="bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-96 group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur group-hover:blur-md transition-all duration-300"></div>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
                <Input
                    placeholder="Search across all studies, IRTs, and trial managers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="relative pl-10 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-white/30 transition-all duration-300"
                />
              </div>
              <GlassButton onClick={() => router.push('/studies/new')}>
                <Plus className="mr-2 h-4 w-4" />
                New Study
              </GlassButton>
            </div>
          </PageHeader>

          <PageShell className="py-8">
            <div className="space-y-6">
              {/* Statistics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-300 mb-1">Total IRTs</p>
                          <p className="text-3xl font-bold text-white">{totalIRTs}</p>
                          <p className="text-xs text-gray-400 mt-1 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Active technologies
                          </p>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm">
                          <Beaker className="h-8 w-8 text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16"></div>
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-300 mb-1">Trial Managers</p>
                          <p className="text-3xl font-bold text-white">{totalTMs}</p>
                          <p className="text-xs text-gray-400 mt-1 flex items-center">
                            <Activity className="h-3 w-3 mr-1" />
                            Managing trials
                          </p>
                        </div>
                        <div className="p-3 bg-emerald-500/20 rounded-xl backdrop-blur-sm">
                          <FileText className="h-8 w-8 text-emerald-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16"></div>
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-300 mb-1">Active Studies</p>
                          <p className="text-3xl font-bold text-white">{totalStudies}</p>
                          <p className="text-xs text-gray-400 mt-1 flex items-center">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            In progress
                          </p>
                        </div>
                        <div className="p-3 bg-purple-500/20 rounded-xl backdrop-blur-sm">
                          <Database className="h-8 w-8 text-purple-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-amber-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16"></div>
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-300 mb-1">Total Tasks</p>
                          <p className="text-3xl font-bold text-white">{totalTasks}</p>
                          <p className="text-xs text-gray-400 mt-1 flex items-center">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Tracked items
                          </p>
                        </div>
                        <div className="p-3 bg-orange-500/20 rounded-xl backdrop-blur-sm">
                          <TrendingUp className="h-8 w-8 text-orange-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Tabs defaultValue="irts" className="w-full">
                {/* Enhanced Glassmorphism Tab Navigation */}
                <div className="relative group mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-30"></div>
                  <TabsList className="relative w-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-2 h-auto min-h-[80px] grid grid-cols-1 md:grid-cols-3 gap-2">
                    <TabsTrigger
                        value="irts"
                        className="relative group/tab flex items-center justify-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/80 data-[state=active]:to-cyan-600/80 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-white/10 transition-all duration-300 px-6 py-4 rounded-xl border border-transparent data-[state=active]:border-white/30 text-gray-300 hover:text-white font-medium overflow-hidden"
                    >
                      {/* Subtle glow for active state */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300 rounded-xl"></div>

                      <div className="relative z-10 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20 backdrop-blur-sm">
                          <Beaker className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-sm">Interactive Response Technologies</span>
                        </div>
                        <Badge className="ml-auto bg-blue-500/30 text-blue-200 border-blue-400/40 backdrop-blur-sm shadow-lg">
                          {totalIRTs}
                        </Badge>
                      </div>
                    </TabsTrigger>

                    <TabsTrigger
                        value="tms"
                        className="relative group/tab flex items-center justify-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600/80 data-[state=active]:to-teal-600/80 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-white/10 transition-all duration-300 px-6 py-4 rounded-xl border border-transparent data-[state=active]:border-white/30 text-gray-300 hover:text-white font-medium overflow-hidden"
                    >
                      {/* Subtle glow for active state */}
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300 rounded-xl"></div>

                      <div className="relative z-10 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20 backdrop-blur-sm">
                          <FileText className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-sm">Trial Managers</span>
                        </div>
                        <Badge className="ml-auto bg-emerald-500/30 text-emerald-200 border-emerald-400/40 backdrop-blur-sm shadow-lg">
                          {totalTMs}
                        </Badge>
                      </div>
                    </TabsTrigger>

                    <TabsTrigger
                        value="studies"
                        className="relative group/tab flex items-center justify-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/80 data-[state=active]:to-pink-600/80 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-white/10 transition-all duration-300 px-6 py-4 rounded-xl border border-transparent data-[state=active]:border-white/30 text-gray-300 hover:text-white font-medium overflow-hidden"
                    >
                      {/* Subtle glow for active state */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300 rounded-xl"></div>

                      <div className="relative z-10 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20 backdrop-blur-sm">
                          <Database className="h-5 w-5 text-purple-400" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-sm">Studies Overview</span>
                        </div>
                        <Badge className="ml-auto bg-purple-500/30 text-purple-200 border-purple-400/40 backdrop-blur-sm shadow-lg">
                          {totalStudies}
                        </Badge>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="irts" className="space-y-6">
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 backdrop-blur-sm">
                      <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                        <Beaker className="h-5 w-5 text-blue-400" />
                        Interactive Response Technologies
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Manage and view all Interactive Response Technologies (IRTs) in the system
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      {irtsLoading ? (
                          <div className="p-6">
                            <TableSkeleton />
                          </div>
                      ) : sortedIRTs.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="p-5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl mb-6 backdrop-blur-sm">
                              <Beaker className="h-16 w-16 text-blue-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-white">No IRTs Found</h3>
                            <p className="text-sm text-gray-400 max-w-sm">
                              {searchQuery ? "No IRTs match your search criteria" : "Get started by creating your first IRT"}
                            </p>
                            <GlassButton className="mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                              <Plus className="mr-2 h-4 w-4" />
                              Create IRT
                            </GlassButton>
                          </div>
                      ) : (
                          <div className="overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-white/5 border-b border-white/10 hover:bg-white/[0.07]">
                                  <TableHead
                                      className="text-gray-300 font-medium cursor-pointer select-none hover:text-white transition-colors duration-200"
                                      onClick={() => handleSort("jiraKey", irtSort, setIrtSort)}
                                  >
                                    JIRA Key
                                    <SortIndicator column="jiraKey" sortConfig={irtSort} />
                                  </TableHead>
                                  <TableHead
                                      className="text-gray-300 font-medium cursor-pointer select-none hover:text-white transition-colors duration-200"
                                      onClick={() => handleSort("protocol", irtSort, setIrtSort)}
                                  >
                                    Protocol
                                    <SortIndicator column="protocol" sortConfig={irtSort} />
                                  </TableHead>
                                  <TableHead
                                      className="text-gray-300 font-medium cursor-pointer select-none hover:text-white transition-colors duration-200"
                                      onClick={() => handleSort("version", irtSort, setIrtSort)}
                                  >
                                    Version
                                    <SortIndicator column="version" sortConfig={irtSort} />
                                  </TableHead>
                                  <TableHead className="text-gray-300 font-medium text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {sortedIRTs.map((irt, index) => (
                                    <TableRow
                                        key={irt.interactiveResponseTechnologyId || index}
                                        className="border-b border-white/5 hover:bg-white/5 transition-all duration-200"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                      <TableCell>
                                        {irt.jiraKey ? (
                                            <a
                                                href={irt.jiraLink || "#"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200 group"
                                            >
                                              {irt.jiraKey}
                                              <ExternalLink className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        ) : (
                                            <span className="text-gray-500">—</span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="font-mono bg-blue-500/10 border-blue-400/30 text-blue-300"
                                        >
                                          {irt.protocol || "—"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="font-mono bg-blue-500/10 border-blue-400/30 text-blue-300">
                                          {irt.version}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {irt.webLink && (
                                            <GlassButton
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.open(irt.webLink, "_blank")}
                                                className="bg-white/5 hover:bg-white/10 border-white/20 text-gray-300 hover:text-white transition-all duration-200"
                                            >
                                              <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                              View
                                            </GlassButton>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tms" className="space-y-6">
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/10 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 backdrop-blur-sm">
                      <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                        <FileText className="h-5 w-5 text-emerald-400" />
                        Trial Managers
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Manage and view all Trial Managers in the system
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      {tmsLoading ? (
                          <div className="p-6">
                            <TableSkeleton />
                          </div>
                      ) : sortedTMs.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="p-5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl mb-6 backdrop-blur-sm">
                              <FileText className="h-16 w-16 text-emerald-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-white">No Trial Managers Found</h3>
                            <p className="text-sm text-gray-400 max-w-sm">
                              {searchQuery
                                  ? "No Trial Managers match your search criteria"
                                  : "Get started by creating your first Trial Manager"}
                            </p>
                            <GlassButton className="mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                              <Plus className="mr-2 h-4 w-4" />
                              Create Trial Manager
                            </GlassButton>
                          </div>
                      ) : (
                          <div className="overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-white/5 border-b border-white/10 hover:bg-white/[0.07]">
                                  <TableHead
                                      className="text-gray-300 font-medium cursor-pointer select-none hover:text-white transition-colors duration-200"
                                      onClick={() => handleSort("jiraKey", tmSort, setTmSort)}
                                  >
                                    JIRA Key
                                    <SortIndicator column="jiraKey" sortConfig={tmSort} />
                                  </TableHead>
                                  <TableHead
                                      className="text-gray-300 font-medium cursor-pointer select-none hover:text-white transition-colors duration-200"
                                      onClick={() => handleSort("client.name", tmSort, setTmSort)}
                                  >
                                    Client
                                    <SortIndicator column="client.name" sortConfig={tmSort} />
                                  </TableHead>
                                  <TableHead
                                      className="text-gray-300 font-medium cursor-pointer select-none hover:text-white transition-colors duration-200"
                                      onClick={() => handleSort("protocol", tmSort, setTmSort)}
                                  >
                                    Protocol
                                    <SortIndicator column="protocol" sortConfig={tmSort} />
                                  </TableHead>
                                  <TableHead
                                      className="text-gray-300 font-medium cursor-pointer select-none hover:text-white transition-colors duration-200"
                                      onClick={() => handleSort("version", tmSort, setTmSort)}
                                  >
                                    Version
                                    <SortIndicator column="version" sortConfig={tmSort} />
                                  </TableHead>
                                  <TableHead className="text-gray-300 font-medium text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {sortedTMs.map((tm, index) => (
                                    <TableRow
                                        key={tm.trialManagerId || index}
                                        className="border-b border-white/5 hover:bg-white/5 transition-all duration-200"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                      <TableCell>
                                        {tm.jiraKey ? (
                                            <a
                                                href={tm.jiraLink || "#"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-200 group"
                                            >
                                              {tm.jiraKey}
                                              <ExternalLink className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        ) : (
                                            <span className="text-gray-500">—</span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <p className="font-medium text-gray-200">{tm.client?.name || "—"}</p>
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="font-mono bg-emerald-500/10 border-emerald-400/30 text-emerald-300"
                                        >
                                          {tm.protocol || "—"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="font-mono bg-emerald-500/10 border-emerald-400/30 text-emerald-300">
                                          {tm.version}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {tm.webLink && (
                                            <GlassButton
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.open(tm.webLink, "_blank")}
                                                className="bg-white/5 hover:bg-white/10 border-white/20 text-gray-300 hover:text-white transition-all duration-200"
                                            >
                                              <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                              View
                                            </GlassButton>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="studies" className="space-y-6">
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/10 bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm">
                      <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                        <Database className="h-5 w-5 text-purple-400" />
                        Studies Overview
                      </CardTitle>
                      <CardDescription className="text-gray-300">View and manage all studies in the system</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      {studiesLoading ? (
                          <div className="p-6">
                            <TableSkeleton />
                          </div>
                      ) : sortedStudies.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl mb-6 backdrop-blur-sm">
                              <Database className="h-16 w-16 text-purple-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-white">No Studies Found</h3>
                            <p className="text-sm text-gray-400 max-w-sm">
                              {searchQuery
                                  ? "No studies match your search criteria"
                                  : "Get started by creating your first study"}
                            </p>
                            <GlassButton
                                className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                onClick={() => router.push('/studies/new')}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Create Study
                            </GlassButton>
                          </div>
                      ) : (
                          <div className="overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-white/5 border-b border-white/10 hover:bg-white/[0.07]">
                                  <TableHead
                                      className="text-gray-300 font-medium cursor-pointer select-none hover:text-white transition-colors duration-200"
                                      onClick={() => handleSort("name", studySort, setStudySort)}
                                  >
                                    Study Name
                                    <SortIndicator column="name" sortConfig={studySort} />
                                  </TableHead>
                                  <TableHead
                                      className="text-gray-300 font-medium cursor-pointer select-none hover:text-white transition-colors duration-200"
                                      onClick={() => handleSort("client.name", studySort, setStudySort)}
                                  >
                                    Client
                                    <SortIndicator column="client.name" sortConfig={studySort} />
                                  </TableHead>
                                  <TableHead
                                      className="text-gray-300 font-medium cursor-pointer select-none hover:text-white transition-colors duration-200"
                                      onClick={() => handleSort("protocol", studySort, setStudySort)}
                                  >
                                    Protocol
                                    <SortIndicator column="protocol" sortConfig={studySort} />
                                  </TableHead>
                                  <TableHead
                                      className="text-gray-300 font-medium cursor-pointer select-none hover:text-white transition-colors duration-200"
                                      onClick={() => handleSort("description", studySort, setStudySort)}
                                  >
                                    Description
                                    <SortIndicator column="description" sortConfig={studySort} />
                                  </TableHead>
                                  <TableHead
                                      className="text-gray-300 font-medium text-center cursor-pointer select-none hover:text-white transition-colors duration-200"
                                      onClick={() =>
                                          handleSort("interactiveResponseTechnologies.length", studySort, setStudySort)
                                      }
                                  >
                                    IRTs
                                    <SortIndicator column="interactiveResponseTechnologies.length" sortConfig={studySort} />
                                  </TableHead>
                                  <TableHead
                                      className="text-gray-300 font-medium text-center cursor-pointer select-none hover:text-white transition-colors duration-200"
                                      onClick={() => handleSort("tasks.length", studySort, setStudySort)}
                                  >
                                    Tasks
                                    <SortIndicator column="tasks.length" sortConfig={studySort} />
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {sortedStudies.map((study, index) => (
                                    <TableRow
                                        key={study.studyId || index}
                                        className="border-b border-white/5 hover:bg-white/5 transition-all duration-200"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                      <TableCell className="font-semibold text-gray-100">{study.name}</TableCell>
                                      <TableCell className="font-medium text-gray-300">{study.client?.name || "—"}</TableCell>
                                      <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="font-mono bg-purple-500/10 border-purple-400/30 text-purple-300"
                                        >
                                          {study.protocol}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="max-w-[300px]">
                                        <p className="truncate text-sm text-gray-400">{study.description}</p>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Badge variant="outline" className="font-mono bg-purple-500/10 border-purple-400/30 text-purple-300">
                                          {study.interactiveResponseTechnologies?.length || 0}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Badge variant="outline" className="font-mono bg-purple-500/10 border-purple-400/30 text-purple-300">
                                          {study.tasks?.length || 0}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </PageShell>
        </div>

        <style jsx>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
  )
}

function TableSkeleton() {
  return (
      <div className="overflow-hidden rounded-lg border border-white/10">
        <Table>
          <TableHeader>
            <TableRow className="bg-white/5">
              <TableHead>
                <Skeleton className="h-4 w-20 bg-white/10" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24 bg-white/10" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-20 bg-white/10" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-16 bg-white/10" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-16 bg-white/10" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell>
                    <Skeleton className="h-4 w-24 bg-white/10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 bg-white/10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20 bg-white/10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16 bg-white/10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-16 bg-white/10" />
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
  )
}