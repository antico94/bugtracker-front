import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface GlassSearchBarProps {
    placeholder?: string
    value: string
    onChange: (value: string) => void
    className?: string
    width?: string
}

export function GlassSearchBar({
                                   placeholder = "Search...",
                                   value,
                                   onChange,
                                   className = "",
                                   width = "w-96"
                               }: GlassSearchBarProps) {
    return (
        <div className={`relative ${width} group ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur group-hover:blur-md transition-all duration-300"></div>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
            <Input
                type="search"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="relative pl-10 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-white/30 transition-all duration-300"
            />
        </div>
    )
}