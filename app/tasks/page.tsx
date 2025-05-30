"use client"

import { useState } from "react"
import { Search, Filter, Plus, ClipboardList, ExternalLink, Calendar, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useCustomTasks } from "@/hooks/use-custom-tasks"

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { tasks, loading, error } = useCustomTasks()

  // Filter tasks based on search query
  const filteredTasks =
    tasks?.filter(
      (task) =>
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.status?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fillRule=%22evenodd%22%3E%3Cg fill=%22%229CA3AF%22 fillOpacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

      <div className="relative z-10">
        <PageHeader title="Task Manager" className="bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="relative w-96 group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur group-hover:blur-md transition-all duration-300"></div>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
              <Input
                type="search"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative pl-10 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-white/30 transition-all duration-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-300"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button className="relative group overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20">
                <span className="relative z-10 flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Button>
            </div>
          </div>
        </PageHeader>

        <PageShell className="py-8">
          {loading ? (
            <div className="space-y-6">
              <TaskTableSkeleton />
            </div>
          ) : error ? (
            <Card className="bg-red-900/20 backdrop-blur-xl border-red-500/30 shadow-2xl">
              <CardContent className="pt-6">
                <p className="text-red-300">Error loading tasks: {error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-white/30"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : tasks?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mb-6 backdrop-blur-sm">
                <ClipboardList className="h-16 w-16 text-blue-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">No Tasks Found</h3>
              <p className="text-sm text-gray-400 max-w-sm">Get started by creating your first task</p>
              <Button className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </div>
          ) : (
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden">
                <CardHeader className="border-b border-white/10 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 backdrop-blur-sm">
                  <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-emerald-400" />
                    Task Manager
                  </CardTitle>
                  <CardDescription className="text-gray-300">Manage and track all tasks in the system</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-white/5 border-b border-white/10 hover:bg-white/[0.07]">
                        <TableHead className="text-gray-300 font-medium">Title</TableHead>
                        <TableHead className="text-gray-300 font-medium">Due Date</TableHead>
                        <TableHead className="text-gray-300 font-medium">Status</TableHead>
                        <TableHead className="text-gray-300 font-medium">Priority</TableHead>
                        <TableHead className="text-gray-300 font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.map((task, index) => (
                        <TableRow
                          key={task.customTaskId}
                          className="border-b border-white/5 hover:bg-white/5 transition-all duration-200"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TableCell>
                            <div className="font-medium text-white">{task.title}</div>
                            <div className="text-sm text-gray-400 truncate max-w-md">{task.description}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-gray-300">
                              <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`
                                ${task.status === "New" ? "bg-blue-500/20 text-blue-300 border-blue-400/30" : ""}
                                ${task.status === "InProgress" ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/30" : ""}
                                ${task.status === "Done" ? "bg-green-500/20 text-green-300 border-green-400/30" : ""}
                              `}
                            >
                              {task.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`
                                ${task.priority === "High" ? "bg-red-500/10 text-red-300 border-red-400/30" : ""}
                                ${task.priority === "Medium" ? "bg-yellow-500/10 text-yellow-300 border-yellow-400/30" : ""}
                                ${task.priority === "Low" ? "bg-green-500/10 text-green-300 border-green-400/30" : ""}
                              `}
                            >
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-white/5 hover:bg-white/10 border-white/20 text-gray-300 hover:text-white transition-all duration-200"
                              >
                                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-500/10 hover:bg-green-500/20 border-green-400/30 text-green-300 hover:text-green-200 transition-all duration-200"
                              >
                                <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                                Complete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </PageShell>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
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
      `,
        }}
      />
    </div>
  )
}

function TaskTableSkeleton() {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-2xl blur-xl transition-all duration-300"></div>
      <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-white/10 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 backdrop-blur-sm">
          <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-emerald-400" />
            Task Manager
          </CardTitle>
          <CardDescription className="text-gray-300">Loading tasks...</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/5 border-b border-white/10">
                <TableHead className="text-gray-300 font-medium">Title</TableHead>
                <TableHead className="text-gray-300 font-medium">Due Date</TableHead>
                <TableHead className="text-gray-300 font-medium">Status</TableHead>
                <TableHead className="text-gray-300 font-medium">Priority</TableHead>
                <TableHead className="text-gray-300 font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i} className="border-b border-white/5 animate-pulse">
                    <TableCell>
                      <div className="h-4 w-48 bg-white/10 rounded mb-2"></div>
                      <div className="h-3 w-72 bg-white/10 rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 bg-white/10 rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-20 bg-white/10 rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-16 bg-white/10 rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <div className="h-8 w-16 bg-white/10 rounded"></div>
                        <div className="h-8 w-24 bg-white/10 rounded"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
