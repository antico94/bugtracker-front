import { ReactNode, ButtonHTMLAttributes } from "react"
import { Button } from "@/components/ui/button"

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: 'primary' | 'outline' | 'ghost' | 'dialog-primary' | 'dialog-secondary' | 'workflow-decision' | 'workflow-action'
    size?: 'sm' | 'default' | 'lg'
    glowColor?: 'blue' | 'purple' | 'emerald' | 'red' | 'yellow' | 'green' | 'orange' | 'cyan' | 'pink'
    loading?: boolean
    className?: string
    elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
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
                                elevation = 'lg',
                                disabled,
                                ...props
                            }: GlassButtonProps) {
    const colorClasses = glowColorClasses[glowColor]

    // Get elevation shadow classes
    const getElevationClasses = (elev: string) => {
        switch (elev) {
            case 'none': return ''
            case 'sm': return 'shadow-sm'
            case 'md': return 'shadow-md'
            case 'lg': return 'shadow-lg shadow-black/25'
            case 'xl': return 'shadow-xl shadow-black/30'
            default: return 'shadow-lg shadow-black/25'
        }
    }

    const elevationClass = getElevationClasses(elevation)

    if (variant === 'primary') {
        return (
            <div className="relative group">
                {/* Enhanced glow effect with proper shadow separation */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${colorClasses.glow} rounded-lg blur-sm opacity-30 group-hover:opacity-50 transition duration-300 pointer-events-none`}></div>

                <Button
                    className={`
            relative overflow-hidden
            ${colorClasses.bg} backdrop-blur-md
            border ${colorClasses.border}
            ${colorClasses.text} font-medium
            ${elevationClass}
            hover:${colorClasses.bg.replace('/20', '/30')}
            hover:border-white/40
            hover:shadow-2xl hover:shadow-black/40
            hover:brightness-110 hover:-translate-y-0.5
            transition-all duration-200 ease-out
            active:brightness-95 active:translate-y-0
            transform-gpu
            ${className}
          `}
                    style={{
                        textRendering: 'optimizeLegibility',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale'
                    }}
                    size={size}
                    disabled={disabled || loading}
                    {...props}
                >
                    {/* Enhanced inner highlight for better glass effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-white/5 to-transparent pointer-events-none"></div>
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>

                    <span className="relative z-10 flex items-center justify-center text-white font-medium">
            {loading && <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white/60 border-t-white"></div>}
                        {children}
          </span>
                </Button>
            </div>
        )
    }

    if (variant === 'dialog-primary') {
        return (
            <div className="relative group">
                {/* Dialog-optimized glow effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorClasses.glow} rounded-lg blur opacity-40 group-hover:opacity-60 transition duration-300 pointer-events-none`}></div>

                <Button
                    className={`
            relative overflow-hidden min-w-[120px]
            ${colorClasses.bg} backdrop-blur-md
            border ${colorClasses.border}
            ${colorClasses.text} font-semibold
            shadow-lg shadow-black/25
            hover:${colorClasses.bg.replace('/20', '/30')}
            hover:border-white/40
            hover:shadow-xl hover:shadow-black/30
            hover:brightness-110 hover:-translate-y-0.5
            transition-all duration-200 ease-out
            active:brightness-95 active:translate-y-0
            transform-gpu
            ${className}
          `}
                    style={{
                        textRendering: 'optimizeLegibility',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale'
                    }}
                    size={size}
                    disabled={disabled || loading}
                    {...props}
                >
                    {/* Enhanced glass effect for dialogs */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none"></div>
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"></div>

                    <span className="relative z-10 flex items-center justify-center text-white font-semibold">
            {loading && <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white/60 border-t-white"></div>}
                        {children}
          </span>
                </Button>
            </div>
        )
    }

    if (variant === 'dialog-secondary') {
        return (
            <div className="relative group">
                {/* Subtle glow for secondary dialog buttons */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-white/10 to-white/5 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-300 pointer-events-none`}></div>

                <Button
                    variant="outline"
                    size={size}
                    className={`
            relative overflow-hidden min-w-[120px]
            bg-white/5 backdrop-blur-md
            border border-white/20
            text-white/90 font-medium
            shadow-md shadow-black/20
            hover:bg-white/10 hover:border-white/30
            hover:shadow-lg hover:shadow-black/25
            hover:brightness-110 hover:-translate-y-0.5
            transition-all duration-200 ease-out
            active:brightness-95 active:translate-y-0
            transform-gpu
            ${className}
          `}
                    style={{
                        textRendering: 'optimizeLegibility',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale'
                    }}
                    disabled={disabled || loading}
                    {...props}
                >
                    {/* Subtle glass effect for secondary buttons */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>

                    <span className="relative z-10 flex items-center justify-center font-medium">
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
                {/* Enhanced glow effect for outline buttons */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorClasses.glow} rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300 pointer-events-none`}></div>

                <Button
                    variant="outline"
                    size={size}
                    className={`
            relative overflow-hidden
            bg-white/5 backdrop-blur-md
            border border-white/20
            text-white/90 font-medium
            ${elevationClass}
            hover:bg-white/10 hover:border-white/30
            hover:shadow-xl hover:shadow-black/30
            hover:brightness-110 hover:-translate-y-0.5
            transition-all duration-200 ease-out
            active:brightness-95 active:translate-y-0
            transform-gpu
            ${className}
          `}
                    style={{
                        textRendering: 'optimizeLegibility',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale'
                    }}
                    disabled={disabled || loading}
                    {...props}
                >
                    {/* Enhanced inner highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>

                    <span className="relative z-10 flex items-center justify-center font-medium">
            {loading && <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white/60 border-t-white"></div>}
                        {children}
          </span>
                </Button>
            </div>
        )
    }

    if (variant === 'workflow-decision') {
        return (
            <div className="relative group">
                {/* Optimized glow effect for workflow decision buttons */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${colorClasses.glow} rounded-xl blur-md opacity-40 group-hover:opacity-60 group-active:opacity-70 transition-all duration-300 pointer-events-none`}></div>
                
                <Button
                    className={`
            relative overflow-hidden
            ${colorClasses.bg} backdrop-blur-lg
            border-2 ${colorClasses.border}
            ${colorClasses.text} font-semibold
            shadow-2xl shadow-black/40
            hover:${colorClasses.bg.replace('/20', '/30')}
            hover:border-white/50
            hover:shadow-3xl hover:shadow-black/50
            hover:brightness-110 hover:-translate-y-1 hover:scale-105
            active:translate-y-0 active:scale-100 active:brightness-95
            transition-all duration-250 ease-out
            transform-gpu
            flex flex-col items-center justify-center gap-2
            min-h-[100px] min-w-[140px]
            ${className}
          `}
                    style={{
                        textRendering: 'optimizeLegibility',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale'
                    }}
                    size={size}
                    disabled={disabled || loading}
                    {...props}
                >
                    {/* Enhanced glass effect with multiple layers */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/10 to-transparent pointer-events-none rounded-lg"></div>
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"></div>
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent pointer-events-none"></div>
                    
                    {/* Content container for perfect centering */}
                    <div className="relative z-10 flex flex-col items-center justify-center gap-2 text-center px-4">
                        {loading && <div className="h-6 w-6 mb-1 animate-spin rounded-full border-2 border-white/60 border-t-white"></div>}
                        {children}
                    </div>
                </Button>
            </div>
        )
    }

    if (variant === 'workflow-action') {
        return (
            <div className="relative group">
                {/* Clean glow for action buttons */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorClasses.glow} rounded-lg blur opacity-30 group-hover:opacity-50 transition-all duration-200 pointer-events-none`}></div>
                
                <Button
                    className={`
            relative overflow-hidden w-full
            ${colorClasses.bg} backdrop-blur-md
            border ${colorClasses.border}
            ${colorClasses.text} font-semibold
            shadow-lg shadow-black/30
            hover:${colorClasses.bg.replace('/20', '/30')}
            hover:border-white/40
            hover:shadow-xl hover:shadow-black/40
            hover:brightness-110 hover:-translate-y-0.5
            active:translate-y-0 active:brightness-95
            transition-all duration-200 ease-out
            transform-gpu
            ${className}
          `}
                    style={{
                        textRendering: 'optimizeLegibility',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale'
                    }}
                    size={size}
                    disabled={disabled || loading}
                    {...props}
                >
                    {/* Refined glass effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-white/5 to-transparent pointer-events-none"></div>
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"></div>
                    
                    <span className="relative z-10 flex items-center justify-center font-semibold">
                        {loading && <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white/60 border-t-white"></div>}
                        {children}
                    </span>
                </Button>
            </div>
        )
    }

    // Ghost variant - enhanced for better UX
    return (
        <Button
            variant="ghost"
            size={size}
            className={`
        relative overflow-hidden
        text-white/80 font-medium
        hover:bg-white/10 hover:text-white
        hover:backdrop-blur-sm
        hover:brightness-110 hover:-translate-y-0.5
        hover:shadow-md hover:shadow-black/20
        transition-all duration-200 ease-out
        active:brightness-95 active:translate-y-0
        transform-gpu
        ${className}
      `}
            style={{
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
            }}
            disabled={disabled || loading}
            {...props}
        >
      {/* Subtle glass effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
      
      <span className="relative z-10 flex items-center justify-center font-medium">
        {loading && <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white/60 border-t-white"></div>}
          {children}
      </span>
        </Button>
    )
}