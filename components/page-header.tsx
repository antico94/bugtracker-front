import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title: string
    children?: ReactNode
    className?: string
}

export function PageHeader({ title, children, className }: PageHeaderProps) {
    return (
        <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
            <div className="container flex h-16 items-center justify-between py-4">
                <h2 className="text-xl font-bold">{title}</h2>
                {children}
            </div>
        </header>
    )
}