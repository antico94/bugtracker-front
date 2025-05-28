import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface GlassCardProps {
    children: ReactNode
    className?: string
    glowColor?: 'blue' | 'purple' | 'emerald' | 'red' | 'yellow' | 'green' | 'orange' | 'cyan' | 'pink' | 'teal'
    title?: string
    titleIcon?: ReactNode
    description?: string
    headerClassName?: string
    contentClassName?: string
    showGlow?: boolean
    showCircle?: boolean
}

const glowColorClasses = {
    blue: 'from-blue-600/20 to-cyan-600/20',
    purple: 'from-purple-600/20 to-pink-600/20',
    emerald: 'from-emerald-600/20 to-teal-600/20',
    red: 'from-red-600/20 to-orange-600/20',
    yellow: 'from-yellow-600/20 to-amber-600/20',
    green: 'from-green-600/20 to-emerald-600/20',
    orange: 'from-orange-600/20 to-amber-600/20',
    cyan: 'from-cyan-600/20 to-teal-600/20',
    pink: 'from-pink-600/20 to-purple-600/20',
    teal: 'from-teal-600/20 to-cyan-600/20'
}

const titleGlowColorClasses = {
    blue: 'from-blue-600/10 to-cyan-600/10',
    purple: 'from-purple-600/10 to-pink-600/10',
    emerald: 'from-emerald-600/10 to-teal-600/10',
    red: 'from-red-600/10 to-orange-600/10',
    yellow: 'from-yellow-600/10 to-amber-600/10',
    green: 'from-green-600/10 to-emerald-600/10',
    orange: 'from-orange-600/10 to-amber-600/10',
    cyan: 'from-cyan-600/10 to-teal-600/10',
    pink: 'from-pink-600/10 to-purple-600/10',
    teal: 'from-teal-600/10 to-cyan-600/10'
}

const circleColorClasses = {
    blue: 'bg-blue-500/10',
    purple: 'bg-purple-500/10',
    emerald: 'bg-emerald-500/10',
    red: 'bg-red-500/10',
    yellow: 'bg-yellow-500/10',
    green: 'bg-green-500/10',
    orange: 'bg-orange-500/10',
    cyan: 'bg-cyan-500/10',
    pink: 'bg-pink-500/10',
    teal: 'bg-teal-500/10'
}

export function GlassCard({
                              children,
                              className = "",
                              glowColor = 'purple',
                              title,
                              titleIcon,
                              description,
                              headerClassName = "",
                              contentClassName = "",
                              showGlow = true,
                              showCircle = false
                          }: GlassCardProps) {
    const glowClass = glowColorClasses[glowColor]
    const titleGlowClass = titleGlowColorClasses[glowColor]
    const circleClass = circleColorClasses[glowColor]

    return (
        <div className="group relative">
            {showGlow && (
                <div className={`absolute inset-0 bg-gradient-to-r ${glowClass} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300`}></div>
            )}
            <Card className={`relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/15 overflow-hidden ${className}`}>
                {showCircle && (
                    <div className={`absolute top-0 right-0 w-32 h-32 ${circleClass} rounded-full -mr-16 -mt-16`}></div>
                )}
                {title && (
                    <CardHeader className={`border-b border-white/10 bg-gradient-to-r ${titleGlowClass} backdrop-blur-sm ${headerClassName}`}>
                        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                            {titleIcon}
                            {title}
                        </CardTitle>
                        {description && (
                            <CardDescription className="text-gray-300">{description}</CardDescription>
                        )}
                    </CardHeader>
                )}
                {title ? (
                    <CardContent className={`p-6 ${contentClassName}`}>
                        {children}
                    </CardContent>
                ) : (
                    <CardContent className={`p-6 relative ${contentClassName}`}>
                        {children}
                    </CardContent>
                )}
            </Card>
        </div>
    )
}