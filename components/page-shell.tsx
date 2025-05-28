import type { ReactNode } from "react"

interface PageShellProps {
  children: ReactNode
}

export function PageShell({ children }: PageShellProps) {
  return <main className="container py-6">{children}</main>
}
