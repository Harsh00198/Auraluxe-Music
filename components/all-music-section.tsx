"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Play, Heart, MoreHorizontal, Search } from "lucide-react"
import { useAudio } from "@/contexts/audio-context"
import { useAuth } from "@/contexts/auth-context"

interface Track {
  id: string
  title: string
  artist: string
  album?: string
  image: string
  duration?: string
  preview_url?: string
  source?: string
}

interface AllMusicSectionProps {
  initialQuery?: string
}

export function AllMusicSection({ initialQuery = "" }: AllMusicSectionProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)
  const { playTrack, currentTrack, isPlaying } = useAudio()
  const { user } = useAuth()

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/music/search?q=${encodeURIComponent(query)}&limit=50`,
      )

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.tracks)
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(searchQuery)
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Auto-search when initialQuery changes
  useEffect(() => {
    if (initialQuery && initialQuery !== searchQuery) {
      setSearchQuery(initialQuery)
    }
  }, [initialQuery])

  const likeTrack = async (track: Track) => {
    if (!user) return

    try {
      const token = localStorage.getItem("auraluxe_token")
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/users/like-track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trackId: track.id,
          title: track.title,
          artist: track.artist,
          image: track.image,
          preview_url: track.preview_url,
        }),
      })
    } catch (error) {
      console.error("Failed to like track:", error)
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Discover Music</h2>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search for songs, artists, albums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
        />
      </div>

      <Tabs defaultValue="songs" className="w-full">
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger value="songs" className="data-[state=active]:bg-white/20">
            Songs
          </TabsTrigger>
          <TabsTrigger value="albums" className="data-[state=active]:bg-white/20">
            Albums
          </TabsTrigger>
          <TabsTrigger value="artists" className="data-[state=active]:bg-white/20">
            Artists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="songs" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid gap-2">
              {searchResults.map((track, index) => (
                <Card key={track.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors group">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className="text-gray-400 w-6 text-center text-sm">{index + 1}</span>

                      <div className="relative">
                        <img
                          src={track.image || "/placeholder.svg?height=300&width=300"}
                          alt={track.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <Button
                          size="sm"
                          onClick={() => playTrack(track, searchResults)}
                          className="absolute inset-0 w-12 h-12 rounded bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-4 h-4 text-white fill-white" />
                        </Button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{track.title}</h4>
                        <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                      </div>

                      <div className="hidden md:block flex-1 min-w-0">
                        <p className="text-sm text-gray-400 truncate">{track.album || track.artist}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100"
                          onClick={() => likeTrack(track)}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>

                        <span className="text-sm text-gray-400 w-12 text-right">{track.duration || "3:45"}</span>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Start typing to search for music</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="albums" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-400">Album view coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="artists" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-400">Artist view coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
