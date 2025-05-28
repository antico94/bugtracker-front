import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { GlassLayout } from "@/components/glass"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bug Tracker",
  description: "Track and manage bugs efficiently",
  generator: 'v0.dev'
}

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html lang="en" suppressHydrationWarning className="dark">
      <body className={inter.className}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <GlassLayout>
          {children}
        </GlassLayout>
      </ThemeProvider>
      </body>
      </html>
  )
}