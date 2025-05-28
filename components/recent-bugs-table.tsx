import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ExternalLink } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BugSeverityBadge } from "@/components/bug-severity-badge"
import type { CoreBugResponseDto } from "@/types"

interface RecentBugsTableProps {
  bugs: CoreBugResponseDto[]
  loading?: boolean
}

export function RecentBugsTable({ bugs, loading }: RecentBugsTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (bugs.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No bugs found</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Tasks</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bugs.map((bug) => (
          <TableRow key={bug.bugId}>
            <TableCell className="font-medium">
              <div>
                <div className="font-medium">{bug.bugTitle}</div>
                <div className="text-sm text-muted-foreground">{bug.jiraKey}</div>
              </div>
            </TableCell>
            <TableCell>
              <BugSeverityBadge severity={bug.severity} />
            </TableCell>
            <TableCell>
              <Badge variant={bug.status === "Done" ? "default" : "secondary"}>{bug.status}</Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(bug.createdAt), { addSuffix: true })}
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {bug.completedTaskCount}/{bug.taskCount}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Link href={`/bugs/${bug.bugId}`} className="text-sm text-primary hover:underline">
                  View
                </Link>
                {bug.jiraLink && (
                  <a
                    href={bug.jiraLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
