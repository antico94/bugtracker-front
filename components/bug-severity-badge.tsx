import {Badge} from "@/components/ui/badge"
import {BugSeverity} from "@/types"
import {getBugSeverity} from "@/lib/utils";

interface BugSeverityBadgeProps {
    severity: BugSeverity | number
}

export function BugSeverityBadge({severity}: BugSeverityBadgeProps) {
    let badgeContent: string
    let variant: "default" | "destructive" | "outline" | "secondary" | null = null
    let className = ""
    const severityValue = getBugSeverity(severity)

    switch (severityValue) {
        case BugSeverity.Critical: // 0
            badgeContent = "Critical"
            variant = "destructive"
            break
        case BugSeverity.Major: // 1
            badgeContent = "Major"
            variant = null
            className = "bg-orange-500/20 text-orange-300 border-orange-400/30"
            break
        case BugSeverity.Moderate: // 2
            badgeContent = "Moderate"
            variant = null
            className = "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
            break
        case BugSeverity.Minor: // 3
            badgeContent = "Minor"
            variant = null
            className = "bg-green-500/20 text-green-300 border-green-400/30"
            break
        case BugSeverity.None: // 4
        default:
            badgeContent = "None"
            variant = "outline"
            className = "bg-gray-500/20 text-gray-300 border-gray-400/30"
    }

    return (
        <Badge variant={variant} className={className}>
            {badgeContent}
        </Badge>
    )
}