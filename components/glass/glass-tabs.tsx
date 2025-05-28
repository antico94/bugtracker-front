import { ReactNode } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"

interface TabItem {
    value: string
    label: string
    icon?: LucideIcon
    count?: number
    glowColor?: 'blue' | 'emerald' | 'purple' | 'red' | 'yellow' | 'green' | 'orange' | 'cyan' | 'pink'
    content: ReactNode
}

interface GlassTabsProps {
    tabs: TabItem[]
    defaultValue?: string
    className?: string
}

const glowColorClasses = {
    blue: 'data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600',
    emerald: 'data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600',
    purple: 'data-[state=active]:from-purple-600 data-[state=active]:to-pink-600',
    red: 'data-[state=active]:from-red-600 data-[state=active]:to-orange-600',
    yellow: 'data-[state=active]:from-yellow-600 data-[state=active]:to-amber-600',
    green: 'data-[state=active]:from-green-600 data-[state=active]:to-emerald-600',
    orange: 'data-[state=active]:from-orange-600 data-[state=active]:to-amber-600',
    cyan: 'data-[state=active]:from-cyan-600 data-[state=active]:to-teal-600',
    pink: 'data-[state=active]:from-pink-600 data-[state=active]:to-purple-600'
}

const badgeColorClasses = {
    blue: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
    emerald: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
    purple: 'bg-purple-500/20 text-purple-200 border-purple-400/30',
    red: 'bg-red-500/20 text-red-200 border-red-400/30',
    yellow: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30',
    green: 'bg-green-500/20 text-green-200 border-green-400/30',
    orange: 'bg-orange-500/20 text-orange-200 border-orange-400/30',
    cyan: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
    pink: 'bg-pink-500/20 text-pink-200 border-pink-400/30'
}

export function GlassTabs({ tabs, defaultValue, className = "" }: GlassTabsProps) {
    const firstTab = tabs[0]?.value || ""

    return (
        <Tabs defaultValue={defaultValue || firstTab} className={`w-full ${className}`}>
            <TabsList className="mb-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-1.5 h-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const glowClass = glowColorClasses[tab.glowColor || 'blue']
                    const badgeClass = badgeColorClasses[tab.glowColor || 'blue']

                    return (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r ${glowClass} data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 px-4 py-2.5`}
                        >
                            {Icon && <Icon className="h-4 w-4" />}
                            <span className="font-medium">{tab.label}</span>
                            {typeof tab.count !== 'undefined' && (
                                <Badge variant="secondary" className={`ml-2 ${badgeClass}`}>
                                    {tab.count}
                                </Badge>
                            )}
                        </TabsTrigger>
                    )
                })}
            </TabsList>

            {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="space-y-6">
                    {tab.content}
                </TabsContent>
            ))}
        </Tabs>
    )
}