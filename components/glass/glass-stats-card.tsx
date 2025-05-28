import { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface GlassStatsCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon: LucideIcon
    glowColor?: 'blue' | 'red' | 'yellow' | 'green' | 'purple' | 'emerald' | 'orange' | 'cyan' | 'pink' | 'teal'
    loading?: boolean
    className?: string
}

const glowColorClasses = {
    blue: 'from-blue-600/20 to-cyan-600/20',
    red: 'from-red-600/20 to-orange-600/20',
    yellow: 'from-yellow-600/20 to-amber-600/20',
    green: 'from-green-600/20 to-emerald-600/20',
    purple: 'from-purple-600/20 to-pink-600/20',
    emerald: 'from-emerald-600/20 to-teal-600/20',
    orange: 'from-orange-600/20 to-amber-600/20',
    cyan: 'from-cyan-600/20 to-teal-600/20',
    pink: 'from-pink-600/20 to-purple-600/20',
    teal: 'from-teal-600/20 to-cyan-600/20'
}

const iconColorClasses = {
    blue: 'text-blue-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    emerald: 'text-emerald-400',
    orange: 'text-orange-400',
    cyan: 'text-cyan-400',
    pink: 'text-pink-400',
    teal: 'text-teal-400'
}

const iconBgClasses = {
    blue: 'bg-blue-500/20',
    red: 'bg-red-500/20',
    yellow: 'bg-yellow-500/20',
    green: 'bg-green-500/20',
    purple: 'bg-purple-500/20',
    emerald: 'bg-emerald-500/20',
    orange: 'bg-orange-500/20',
    cyan: 'bg-cyan-500/20',
    pink: 'bg-pink-500/20',
    teal: 'bg-teal-500/20'
}

const circleColorClasses = {
    blue: 'bg-blue-500/10',
    red: 'bg-red-500/10',
    yellow: 'bg-yellow-500/10',
    green: 'bg-green-500/10',
    purple: 'bg-purple-500/10',
    emerald: 'bg-emerald-500/10',
    orange: 'bg-orange-500/10',
    cyan: 'bg-cyan-500/10',
    pink: 'bg-pink-500/10',
    teal: 'bg-teal-500/10'
}

const trendIconColorClasses = {
    blue: 'text-blue-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    emerald: 'text-emerald-400',
    orange: 'text-orange-400',
    cyan: 'text-cyan-400',
    pink: 'text-pink-400',
    teal: 'text-teal-400'
}

export function GlassStatsCard({
                                   title,
                                   value,
                                   subtitle,
                                   icon: Icon,
                                   glowColor = 'blue',
                                   loading = false,
                                   className = ""
                               }: GlassStatsCardProps) {
    const glowClass = glowColorClasses[glowColor]
    const iconColorClass = iconColorClasses[glowColor]
    const iconBgClass = iconBgClasses[glowColor]
    const circleColorClass = circleColorClasses[glowColor]
    const trendIconColorClass = trendIconColorClasses[glowColor]

    if (loading) {
        return (
            <div className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${glowClass} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300`}></div>
                <Card className={`relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden ${className}`}>
                    <div className={`absolute top-0 right-0 w-32 h-32 ${circleColorClass} rounded-full -mr-16 -mt-16`}></div>
                    <CardContent className="p-6 relative">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="h-4 w-32 bg-white/10 rounded mb-2 animate-pulse"></div>
                                <div className="h-8 w-16 bg-white/10 rounded mb-2 animate-pulse"></div>
                                <div className="h-3 w-24 bg-white/10 rounded animate-pulse"></div>
                            </div>
                            <div className={`p-3 ${iconBgClass} rounded-xl backdrop-blur-sm`}>
                                <div className="h-8 w-8 bg-white/10 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="group relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${glowClass} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300`}></div>
            <Card className={`relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden ${className}`}>
                <div className={`absolute top-0 right-0 w-32 h-32 ${circleColorClass} rounded-full -mr-16 -mt-16`}></div>
                <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-300 mb-1">{title}</p>
                            <p className="text-3xl font-bold text-white">{value}</p>
                            {subtitle && (
                                <p className="text-xs text-gray-400 mt-1 flex items-center">
                                    <Icon className={`h-3 w-3 mr-1 ${trendIconColorClass}`} />
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        <div className={`p-3 ${iconBgClass} rounded-xl backdrop-blur-sm`}>
                            <Icon className={`h-8 w-8 ${iconColorClass}`} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}