import React from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ExternalLink, Eye, Edit, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { GlassButton } from "@/components/glass/glass-button"
import { GlassEmptyState } from "@/components/glass/glass-empty-state"
import { BugSeverityBadge } from "@/components/bug-severity-badge"
import type { CoreBugResponseDto } from "@/types"

interface BugTableColumn {
  key: string
  label: string
  width?: string
  align?: "left" | "center" | "right"
}

interface BugTableAction {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: (bug: CoreBugResponseDto) => void
  variant?: "default" | "outline" | "ghost"
  glowColor?: "blue" | "purple" | "emerald" | "red" | "yellow" | "green" | "orange" | "cyan" | "pink"
  loading?: boolean
  disabled?: boolean
}

interface BugTableProps {
  bugs: CoreBugResponseDto[]
  loading?: boolean
  columns?: BugTableColumn[]
  actions?: BugTableAction[]
  showDefaultActions?: boolean
  onBugClick?: (bug: CoreBugResponseDto) => void
  emptyStateTitle?: string
  emptyStateDescription?: string
  emptyStateAction?: React.ReactNode
  className?: string
}

const defaultColumns: BugTableColumn[] = [
  { key: "title", label: "Title", width: "40%" },
  { key: "severity", label: "Severity", width: "15%" },
  { key: "status", label: "Status", width: "15%" },
  { key: "created", label: "Created", width: "15%" },
  { key: "tasks", label: "Tasks", width: "10%" },
  { key: "actions", label: "Actions", width: "5%", align: "right" }
]

export function BugTable({
  bugs,
  loading = false,
  columns = defaultColumns,
  actions = [],
  showDefaultActions = true,
  onBugClick,
  emptyStateTitle = "No Bugs Found",
  emptyStateDescription = "No bugs match your current criteria.",
  emptyStateAction,
  className = ""
}: BugTableProps) {
  const renderCellContent = (bug: CoreBugResponseDto, column: BugTableColumn) => {
    switch (column.key) {
      case "title":
        return (
          <div className={onBugClick ? "cursor-pointer" : ""} onClick={() => onBugClick?.(bug)}>
            <div className="font-medium text-white">{bug.bugTitle}</div>
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <Badge variant="outline" className="font-mono bg-red-500/10 border-red-400/30 text-red-300 text-xs">
                {bug.jiraKey}
              </Badge>
            </div>
          </div>
        )
      
      case "severity":
        return <BugSeverityBadge severity={bug.severity} />
      
      case "status":
        return (
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
        )
      
      case "created":
        return (
          <div className="text-sm text-gray-400">
            {formatDistanceToNow(new Date(bug.createdAt), { addSuffix: true })}
          </div>
        )
      
      case "tasks":
        return (
          <div className="text-sm text-gray-300">
            <span className="text-green-400">{bug.completedTaskCount}</span>
            <span className="text-gray-500">/</span>
            <span>{bug.taskCount}</span>
          </div>
        )
      
      case "actions":
        return (
          <div className="flex items-center justify-end gap-2">
            {showDefaultActions && (
              <>
                <Link href={`/bugs/${bug.bugId}`}>
                  <GlassButton variant="outline" size="sm" glowColor="blue">
                    <Eye className="h-3 w-3" />
                  </GlassButton>
                </Link>
                {bug.jiraLink && (
                  <a
                    href={bug.jiraLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GlassButton variant="outline" size="sm" glowColor="purple">
                      <ExternalLink className="h-3 w-3" />
                    </GlassButton>
                  </a>
                )}
              </>
            )}
            {actions.map((action, index) => (
              <GlassButton
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => action.onClick(bug)}
                glowColor={action.glowColor || "blue"}
                loading={action.loading}
                disabled={action.disabled}
              >
                {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                {action.label}
              </GlassButton>
            ))}
          </div>
        )
      
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-4 ${className}`}>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 bg-white/20" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full bg-white/20" />
                <Skeleton className="h-4 w-3/4 bg-white/20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (bugs.length === 0) {
    return (
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-8 ${className}`}>
        <GlassEmptyState
          icon={ExternalLink}
          title={emptyStateTitle}
          description={emptyStateDescription}
          action={emptyStateAction}
        />
      </div>
    )
  }

  return (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg overflow-hidden ${className}`}>
      <Table>
        <TableHeader>
          <TableRow className="border-white/20 hover:bg-white/5">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                style={{ width: column.width }}
                className={`text-gray-300 font-medium ${
                  column.align === "center" ? "text-center" :
                  column.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {bugs.map((bug) => (
            <TableRow
              key={bug.bugId}
              className="border-white/10 hover:bg-white/5 transition-colors"
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={`py-4 ${
                    column.align === "center" ? "text-center" :
                    column.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {renderCellContent(bug, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Export a simplified version for backward compatibility
export function RecentBugsTable({ bugs, loading }: { bugs: CoreBugResponseDto[], loading?: boolean }) {
  return (
    <BugTable
      bugs={bugs}
      loading={loading}
      emptyStateTitle="No Recent Bugs"
      emptyStateDescription="No recent bugs found."
    />
  )
}