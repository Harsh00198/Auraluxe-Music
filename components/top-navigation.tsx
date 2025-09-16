"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { Search, Bell, Settings, User, LogOut, ChevronLeft, ChevronRight } from "lucide-react"

export function TopNavigation() {
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-20 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-white">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search for songs, artists, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
              />
            </div>
          </form>
        </div>

        {/* User Controls */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-white">
            <Bell className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.username} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-xl border-white/20" align="end">
              <div className="px-2 py-1.5 text-sm text-white">
                <div className="font-medium">{user?.username}</div>
                <div className="text-xs text-gray-400">{user?.email}</div>
              </div>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem asChild className="text-white hover:bg-white/10">
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-white hover:bg-white/10">
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem className="text-white hover:bg-white/10" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
