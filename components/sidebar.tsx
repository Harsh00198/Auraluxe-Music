"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import { Home, Search, Library, Heart, Plus, Music, TrendingUp, Clock, Download, List, Shield } from "lucide-react"

interface SidebarProps {
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
}

const mainMenuItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: Library, label: "Your Library", href: "/library" },
]

const libraryItems = [
  { icon: Heart, label: "Liked Songs", href: "/liked-songs" },
  { icon: Download, label: "Downloads", href: "/downloads" },
  { icon: Clock, label: "Recently Played", href: "/recently-played" },
  { icon: TrendingUp, label: "Top Charts", href: "/top-charts" },
]

export function Sidebar({ expanded, onExpandedChange }: SidebarProps) {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (user && expanded) {
      fetchPlaylists()
    }
  }, [user, expanded])

  const fetchPlaylists = async () => {
    if (!user) return

    setLoading(true)
    try {
      const token = localStorage.getItem("auraluxe_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/playlists`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPlaylists(data.playlists)
      }
    } catch (error) {
      console.error("Failed to fetch playlists:", error)
    } finally {
      setLoading(false)
    }
  }

  const createPlaylist = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem("auraluxe_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/playlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `My Playlist #${playlists.length + 1}`,
          description: "A new playlist",
        }),
      })

      if (response.ok) {
        fetchPlaylists()
      }
    } catch (error) {
      console.error("Failed to create playlist:", error)
    }
  }

  return (
    <div
      className={cn(
        "relative h-full bg-black/20 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ease-in-out",
        expanded ? "w-64" : "w-16",
      )}
      onMouseEnter={() => onExpandedChange(true)}
      onMouseLeave={() => onExpandedChange(false)}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            {expanded && <span className="text-xl font-bold text-white">Auraluxe</span>}
          </div>
        </div>

        <ScrollArea className="flex-1 px-2">
          {/* Main Menu */}
          <div className="py-4">
            {mainMenuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Button
                  asChild
                  key={item.label}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 mb-1 text-gray-300 hover:text-white hover:bg-white/10",
                    isActive && "bg-white/10 text-white",
                    !expanded && "px-3",
                  )}
                >
                  <Link href={item.href} aria-current={isActive ? "page" : undefined}>
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {expanded && <span>{item.label}</span>}
                  </Link>
                </Button>
              )
            })}
          </div>

          {/* Admin Dashboard */}
          {user?.role === "admin" && (
            <div className="py-4 border-t border-white/10">
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 mb-1 text-purple-300 hover:text-purple-200 hover:bg-purple-500/10",
                  pathname === "/admin" && "bg-purple-500/10 text-purple-200",
                  !expanded && "px-3",
                )}
              >
                <Link href="/admin" aria-current={pathname === "/admin" ? "page" : undefined}>
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  {expanded && <span>Admin</span>}
                </Link>
              </Button>
            </div>
          )}

          {/* Library */}
          <div className="py-4 border-t border-white/10">
            {expanded && (
              <h3 className="px-3 mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">Your Library</h3>
            )}
            {libraryItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Button
                  asChild
                  key={item.label}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 mb-1 text-gray-300 hover:text-white hover:bg-white/10",
                    isActive && "bg-white/10 text-white",
                    !expanded && "px-3",
                  )}
                >
                  <Link href={item.href} aria-current={isActive ? "page" : undefined}>
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {expanded && <span>{item.label}</span>}
                  </Link>
                </Button>
              )
            })}
          </div>

          {/* Playlists */}
          {expanded && user && (
            <div className="py-4 border-t border-white/10">
              <div className="flex items-center justify-between px-3 mb-2">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Playlists</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-6 h-6 p-0 text-gray-400 hover:text-white"
                  onClick={createPlaylist}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {loading ? (
                <div className="px-3 py-2 text-sm text-gray-400">Loading...</div>
              ) : (
                playlists.map((playlist) => (
                  <Button
                    key={playlist._id}
                    variant="ghost"
                    className="w-full justify-start gap-3 mb-1 text-gray-300 hover:text-white hover:bg-white/10 text-sm"
                    asChild
                  >
                    <Link href={`/library/${playlist._id}`}>
                      <List className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{playlist.name}</span>
                    </Link>
                  </Button>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
