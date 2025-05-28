"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bug, ClipboardList, Home, Microscope } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    {
        name: "Dashboard",
        href: "/",
        icon: Home,
        glowColor: "blue"
    },
    {
        name: "Studies",
        href: "/studies",
        icon: Microscope,
        glowColor: "purple"
    },
    {
        name: "Bugs",
        href: "/bugs",
        icon: Bug,
        glowColor: "red"
    },
    {
        name: "Task Manager",
        href: "/tasks",
        icon: ClipboardList,
        glowColor: "emerald"
    },
]

const glowColorClasses = {
    blue: 'from-blue-600/20 to-cyan-600/20',
    purple: 'from-purple-600/20 to-pink-600/20',
    red: 'from-red-600/20 to-orange-600/20',
    emerald: 'from-emerald-600/20 to-teal-600/20',
}

const activeGlowClasses = {
    blue: 'bg-gradient-to-r from-blue-600 to-cyan-600',
    purple: 'bg-gradient-to-r from-purple-600 to-pink-600',
    red: 'bg-gradient-to-r from-red-600 to-orange-600',
    emerald: 'bg-gradient-to-r from-emerald-600 to-teal-600',
}

export interface GlassSidebarProps {
    className?: string
}

export function GlassSidebar({ className = "" }: GlassSidebarProps = {}) {
    const pathname = usePathname()

    return (
        <div className={`hidden md:block w-64 shrink-0 ${className}`}>
            {/* Sidebar with Glassmorphism - now properly positioned */}
            <div className="h-screen bg-white/5 backdrop-blur-xl border-r border-white/10 shadow-2xl sticky top-0">
                {/* Logo/Brand Section */}
                <div className="flex h-16 items-center border-b border-white/10 px-4 bg-white/5">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <Bug className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">BugTracker</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2 p-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        const glowClass = glowColorClasses[item.glowColor as keyof typeof glowColorClasses]
                        const activeGlowClass = activeGlowClasses[item.glowColor as keyof typeof activeGlowClasses]

                        return (
                            <div key={item.href} className="relative group">
                                {/* Glow effect for active and hover states */}
                                {isActive && (
                                    <div className={`absolute inset-0 bg-gradient-to-r ${glowClass} rounded-lg blur-sm pointer-events-none`}></div>
                                )}

                                <Link
                                    href={item.href}
                                    className={cn(
                                        "relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-300 z-10",
                                        "hover:bg-white/10 hover:shadow-lg",
                                        isActive
                                            ? `${activeGlowClass} text-white shadow-lg`
                                            : "text-gray-300 hover:text-white"
                                    )}
                                >
                                    <Icon className={cn(
                                        "h-5 w-5 transition-all duration-300",
                                        isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                                    )} />
                                    <span className="transition-all duration-300">{item.name}</span>

                                    {/* Active indicator */}
                                    {isActive && (
                                        <div className="absolute right-2 w-2 h-2 bg-white rounded-full shadow-lg pointer-events-none"></div>
                                    )}
                                </Link>

                                {/* Hover glow effect */}
                                {!isActive && (
                                    <div className={`absolute inset-0 bg-gradient-to-r ${glowClass} rounded-lg blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none`}></div>
                                )}
                            </div>
                        )
                    })}
                </nav>

                {/* Bottom section - could add user info, settings, etc. */}
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                        <p className="text-xs text-gray-400 text-center">
                            Version 1.0.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}