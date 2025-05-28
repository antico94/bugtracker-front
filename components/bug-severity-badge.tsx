import { Badge } from "@/components/ui/badge"
import { BugSeverity } from "@/types"

interface BugSeverityBadgeProps {
  severity: BugSeverity | number
}

export function BugSeverityBadge({ severity }: BugSeverityBadgeProps) {
  let badgeContent: string
  let variant: "default" | "destructive" | "outline" | "secondary" | null = null
  let className = ""

  // Handle both enum string values and numeric values (from API)
  if (typeof severity === "number") {
    switch (severity) {
      case 0:
        badgeContent = "Critical"
        variant = "destructive"
        break
      case 1:
        badgeContent = "Major"
        variant = null
        className = "bg-orange-500 text-white hover:bg-orange-500/80"
        break
      case 2:
        badgeContent = "Moderate"
        variant = null
        className = "bg-yellow-500 text-white hover:bg-yellow-500/80"
        break
      case 3:
        badgeContent = "Minor"
        variant = null
        className = "bg-green-500 text-white hover:bg-green-500/80"
        break
      default:
        badgeContent = "None"
        variant = "outline"
    }
  } else {
    switch (severity) {
      case BugSeverity.Critical:
        badgeContent = "Critical"
        variant = "destructive"
        break
      case BugSeverity.Major:
        badgeContent = "Major"
        variant = null
        className = "bg-orange-500 text-white hover:bg-orange-500/80"
        break
      case BugSeverity.Moderate:
        badgeContent = "Moderate"
        variant = null
        className = "bg-yellow-500 text-white hover:bg-yellow-500/80"
        break
      case BugSeverity.Minor:
        badgeContent = "Minor"
        variant = null
        className = "bg-green-500 text-white hover:bg-green-500/80"
        break
      default:
        badgeContent = "None"
        variant = "outline"
    }
  }

  return (
    <Badge variant={variant} className={className}>
      {badgeContent}
    </Badge>
  )
}
