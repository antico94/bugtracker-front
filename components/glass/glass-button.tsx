import { ReactNode, ButtonHTMLAttributes } from "react"
import { Button } from "@/components/ui/button"

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: 'primary' | 'outline' | 'ghost'
    size?: 'sm' | 'default' | 'lg'
    glowColor?: 'blue' | 'purple' | 'emerald' | 'red' | 'yellow' | 'green' | 'orange' | 'cyan' | 'pink'
    loading?: boolean
    className?: string
}

const glowColorClasses = {
    blue: {
        bg: 'bg-blue-500/20',
        border: 'border-blue-400/30',
        glow: 'from-blue-500/30 to-cyan-500/30',
        hoverGlow: 'group-hover:shadow-blue-500/25',
        text: 'text-blue-100'
    },
    purple: {
        bg: 'bg-purple-500/20',
        border: 'border-purple-400/30',
        glow: 'from-purple-500/30 to-pink-500/30',
        hoverGlow: 'group-hover:shadow-purple-500/25',
        text: 'text-purple-100'
    },
    emerald: {
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-400/30',
        glow: 'from-emerald-500/30 to-teal-500/30',
        hoverGlow: 'group-hover:shadow-emerald-500/25',
        text: 'text-emerald-100'
    },
    red: {
        bg: 'bg-red-500/20',
        border: 'border-red-400/30',
        glow: 'from-red-500/30 to-orange-500/30',
        hoverGlow: 'group-hover:shadow-red-500/25',
        text: 'text-red-100'
    },
    yellow: {
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-400/30',
        glow: 'from-yellow-500/30 to-amber-500/30',
        hoverGlow: 'group-hover:shadow-yellow-500/25',
        text: 'text-yellow-100'
    },
    green: {
        bg: 'bg-green-500/20',
        border: 'border-green-400/30',
        glow: 'from-green-500/30 to-emerald-500/30',
        hoverGlow: 'group-hover:shadow-green-500/25',
        text: 'text-green-100'
    },
    orange: {
        bg: 'bg-orange-500/20',
        border: 'border-orange-400/30',
        glow: 'from-orange-500/30 to-amber-500/30',
        hoverGlow: 'group-hover:shadow-orange-500/25',
        text: 'text-orange-100'
    },
    cyan: {
        bg: 'bg-cyan-500/20',
        border: 'border-cyan-400/30',
        glow: 'from-cyan-500/30 to-teal-500/30',
        hoverGlow: 'group-hover:shadow-cyan-500/25',
        text: 'text-cyan-100'
    },
    pink: {
        bg: 'bg-pink-500/20',
        border: 'border-pink-400/30',
        glow: 'from-pink-500/30 to-purple-500/30',
        hoverGlow: 'group-hover:shadow-pink-500/25',
        text: 'text-pink-100'
    }
}

export function GlassButton({
                                children,
                                variant = 'primary',
                                size = 'default',
                                glowColor = 'purple',
                                loading = false,
                                className = "",
                                disabled,
                                ...props
                            }: GlassButtonProps) {
    const colorClasses = glowColorClasses[glowColor]

    if (variant === 'primary') {
        return (
            <div className="relative group">
                {/* Subtle glow effect behind the button */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorClasses.glow} rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300 pointer-events-none`}></div>

                <Button
                    className={`
            relative overflow-hidden
            ${colorClasses.bg} backdrop-blur-xl
            border ${colorClasses.border}
            ${colorClasses.text} font-medium
            shadow-lg ${colorClasses.hoverGlow}
            hover:${colorClasses.bg.replace('/20', '/30')}
            hover:border-white/40
            hover:shadow-xl hover:scale-[1.02]
            transition-all duration-300
            active:scale-[0.98]
            ${className}
          `}
                    size={size}
                    disabled={disabled || loading}
                    {...props}
                >
                    {/* Inner highlight for glass effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

                    <span className="relative z-10 flex items-center text-white drop-shadow-sm">
            {loading && <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white/60 border-t-white"></div>}
                        {children}
          </span>
                </Button>
            </div>
        )
    }

    if (variant === 'outline') {
        return (
            <div className="relative group">
                {/* Subtle glow effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorClasses.glow} rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300 pointer-events-none`}></div>

                <Button
                    variant="outline"
                    size={size}
                    className={`
            relative overflow-hidden
            bg-white/5 backdrop-blur-xl
            border border-white/20
            text-white/90 font-medium
            shadow-lg
            hover:bg-white/10 hover:border-white/30
            hover:shadow-xl hover:scale-[1.02]
            transition-all duration-300
            active:scale-[0.98]
            ${className}
          `}
                    disabled={disabled || loading}
                    {...props}
                >
                    {/* Inner highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                    <span className="relative z-10 flex items-center drop-shadow-sm">
            {loading && <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white/60 border-t-white"></div>}
                        {children}
          </span>
                </Button>
            </div>
        )
    }

    // Ghost variant
    return (
        <Button
            variant="ghost"
            size={size}
            className={`
        relative overflow-hidden
        text-white/80 font-medium
        hover:bg-white/10 hover:text-white
        hover:backdrop-blur-sm
        transition-all duration-300
        active:scale-[0.98]
        ${className}
      `}
            disabled={disabled || loading}
            {...props}
        >
      <span className="relative z-10 flex items-center">
        {loading && <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white/60 border-t-white"></div>}
          {children}
      </span>
        </Button>
    )
}