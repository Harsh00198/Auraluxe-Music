"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNavigation } from "@/components/top-navigation"
import { MusicPlayer } from "@/components/music-player"
// import { ThreeBackground } from "@/components/three-background"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Static Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <Sidebar expanded={sidebarExpanded} onExpandedChange={setSidebarExpanded} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation */}
          <TopNavigation />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto pb-24">{children}</main>
        </div>
      </div>

      {/* Music Player */}
      <MusicPlayer />
    </div>
  )
}
