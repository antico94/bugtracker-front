import { ReactNode } from "react"

interface GlassPageHeaderProps {
    title: string | ReactNode
    children?: ReactNode
    className?: string
}

export function GlassPageHeader({ title, children, className = "" }: GlassPageHeaderProps) {
    return (
        <header className={`sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl ${className}`}>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>

            <div className="relative container flex h-16 items-center justify-between py-4">
                <h2 className="text-xl font-bold text-white drop-shadow-lg">{title}</h2>
                {children && (
                    <div className="flex items-center gap-4">
                        {children}
                    </div>
                )}
            </div>
        </header>
    )
}