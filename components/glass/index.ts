// Glass Components - Reusable glassmorphism UI components
export { AnimatedBackground } from "./animated-background"
export { GlassPageHeader } from "./glass-page-header"
export { GlassCard } from "./glass-card"
export { GlassStatsCard } from "./glass-stats-card"
export { GlassSearchBar } from "./glass-search-bar"
export { GlassButton } from "./glass-button"
export { GlassTabs } from "./glass-tabs"
export { GlassEmptyState } from "./glass-empty-state"
export { GlassSidebar } from "./glass-sidebar"
export { GlassLayout } from "./glass-layout"

// Export prop types for TypeScript support
export type { GlassSidebarProps } from "./glass-sidebar"
export type { GlassLayoutProps } from "./glass-layout"

// Common types for glass components
export type GlowColor = 'blue' | 'purple' | 'emerald' | 'red' | 'yellow' | 'green' | 'orange' | 'cyan' | 'pink' | 'teal'

// Utility function for date formatting (used in existing components)
export function formatDate(date: string | Date): string {
    if (!date) return 'N/A'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString()
}