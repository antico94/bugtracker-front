import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"
import { GlassButton } from "./glass-button"

interface GlassEmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
    glowColor?: 'blue' | 'purple' | 'emerald' | 'red' | 'yellow' | 'green' | 'orange' | 'cyan' | 'pink'
    className?: string
    children?: ReactNode
}

const glowColorClasses = {
    blue: 'from-blue-500/20 to-cyan-500/20',
    purple: 'from-purple-500/20 to-pink-500/20',
    emerald: 'from-emerald-500/20 to-teal-500/20',
    red: 'from-red-500/20 to-orange-500/20',
    yellow: 'from-yellow-500/20 to-amber-500/20',
    green: 'from-green-500/20 to-emerald-500/20',
    orange: 'from-orange-500/20 to-amber-500/20',
    cyan: 'from-cyan-500/20 to-teal-500/20',
    pink: 'from-pink-500/20 to-purple-500/20'
}

const iconColorClasses = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    emerald: 'text-emerald-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
    orange: 'text-orange-400',
    cyan: 'text-cyan-400',
    pink: 'text-pink-400'
}

export function GlassEmptyState({
                                    icon: Icon,
                                    title,
                                    description,
                                    actionLabel,
                                    onAction,
                                    glowColor = 'blue',
                                    className = "",
                                    children
                                }: GlassEmptyStateProps) {
    const glowClass = glowColorClasses[glowColor]
    const iconColorClass = iconColorClasses[glowColor]

    return (
        <div className={`flex flex-col items-center justify-center py-20 text-center ${className}`}>
            <div className={`p-5 bg-gradient-to-br ${glowClass} rounded-2xl mb-6 backdrop-blur-sm`}>
                <Icon className={`h-16 w-16 ${iconColorClass}`} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-400 max-w-sm mb-6">{description}</p>
            {actionLabel && onAction && (
                <GlassButton onClick={onAction} glowColor={glowColor}>
                    {actionLabel}
                </GlassButton>
            )}
            {children}
        </div>
    )
}