"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bug, ClipboardList, Home, Microscope } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Studies",
    href: "/studies",
    icon: Microscope,
  },
  {
    name: "Bugs",
    href: "/bugs",
    icon: Bug,
  },
  {
    name: "Task Manager",
    href: "/tasks",
    icon: ClipboardList,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block w-64 shrink-0">
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2">
          <Bug className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">BugTracker</span>
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}
