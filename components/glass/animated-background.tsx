import { ReactNode } from "react"

interface AnimatedBackgroundProps {
    children: ReactNode
    className?: string
    intensity?: 'subtle' | 'normal' | 'intense'
    showGrid?: boolean
}

export function AnimatedBackground({
                                       children,
                                       className = "",
                                       intensity = 'normal',
                                       showGrid = true
                                   }: AnimatedBackgroundProps) {
    // Adjust opacity and size based on intensity
    const opacityClass = {
        subtle: 'opacity-10',
        normal: 'opacity-20',
        intense: 'opacity-30'
    }[intensity]

    const sizeClass = {
        subtle: 'w-64 h-64',
        normal: 'w-96 h-96',
        intense: 'w-[32rem] h-[32rem]'
    }[intensity]

    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden ${className}`}>
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                <div className={`absolute top-0 -left-4 ${sizeClass} bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl ${opacityClass} animate-blob`}></div>
                <div className={`absolute top-0 -right-4 ${sizeClass} bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl ${opacityClass} animate-blob animation-delay-2000`}></div>
                <div className={`absolute -bottom-8 left-20 ${sizeClass} bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl ${opacityClass} animate-blob animation-delay-4000`}></div>
            </div>

            {/* Grid Pattern Overlay */}
            {showGrid && (
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fillRule=%22evenodd%22%3E%3Cg fill=%22%239CA3AF%22 fillOpacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
            )}

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    )
}