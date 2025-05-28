import type React from "react"
import { GlassSidebar } from "./glass-sidebar"

export interface GlassLayoutProps {
    children: React.ReactNode
}

export function GlassLayout({ children }: GlassLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 relative">
            {/* Global subtle background elements - less intense than page-specific ones */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 -left-4 w-64 h-64 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                <div className="absolute bottom-1/4 -right-4 w-64 h-64 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                <div className="absolute top-3/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            </div>

            {/* Main Layout */}
            <div className="relative z-10 flex min-h-screen">
                <GlassSidebar />
                <div className="flex-1 relative">
                    {children}
                </div>
            </div>
        </div>
    )
}