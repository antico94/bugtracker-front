import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {BugSeverity, severityMap} from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date

  // Check if date is valid
  if (isNaN(dateObj.getTime())) return 'Invalid Date'

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date

  // Check if date is valid
  if (isNaN(dateObj.getTime())) return 'Invalid Date'

  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatRelativeTime(date: string | Date): string {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date

  // Check if date is valid
  if (isNaN(dateObj.getTime())) return 'Invalid Date'

  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`

  return formatDate(dateObj)
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'new':
      return 'bg-red-500/20 text-red-300 border-red-400/30'
    case 'inprogress':
    case 'in progress':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
    case 'done':
    case 'completed':
      return 'bg-green-500/20 text-green-300 border-green-400/30'
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
  }
}

export function getSeverityColor(severity: number) {
  switch (severity) {
    case 0: // Critical
      return 'bg-red-500/20 text-red-300 border-red-400/30'
    case 1: // Major
      return 'bg-orange-500/20 text-orange-300 border-orange-400/30'
    case 2: // Moderate
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
    case 3: // Minor
      return 'bg-green-500/20 text-green-300 border-green-400/30'
    case 4: // None
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
  }
}

export function getBugSeverity(severity: unknown): BugSeverity | undefined {
  if (typeof severity === "number" && Object.values(BugSeverity).includes(severity)) {
    return severity as BugSeverity;
  }

  if (typeof severity === "string") {
    return severityMap[severity];
  }

  return undefined;
}