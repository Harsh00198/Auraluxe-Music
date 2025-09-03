"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Play, Heart, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
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

interface MusicCarouselProps {
  title: string
  tracks: Track[]
  type?: "track" | "artist" | "album"
}

export function MusicCarousel({ title, tracks, type = "track" }: MusicCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { playTrack, currentTrack, isPlaying } = useAudio()
  const { user } = useAuth()

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const handlePlay = (track: Track) => {
    playTrack(track, tracks)
  }

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

  if (!tracks.length) {
    return null
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scroll("left")}
            className="w-8 h-8 p-0 text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scroll("right")}
            className="w-8 h-8 p-0 text-gray-400 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tracks.map((track) => (
          <Card
            key={track.id}
            className={cn(
              "flex-shrink-0 w-48 bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer glow-hover",
              type === "artist" && "w-40",
            )}
          >
            <CardContent className="p-4">
              <div className="relative mb-3">
                <img
                  src={track.image || "/placeholder.svg?height=300&width=300"}
                  alt={track.title}
                  className={cn(
                    "w-full aspect-square object-cover bg-gray-800",
                    type === "artist" ? "rounded-full" : "rounded-lg",
                  )}
                />
                <Button
                  size="sm"
                  onClick={() => handlePlay(track)}
                  className={cn(
                    "absolute bottom-2 right-2 w-10 h-10 rounded-full bg-green-500 hover:bg-green-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg",
                    currentTrack?.id === track.id && isPlaying && "opacity-100 translate-y-0 pulse-glow",
                  )}
                >
                  <Play className="w-4 h-4 text-black fill-black" />
                </Button>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold text-white truncate">{track.title}</h3>
                <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                {track.album && type !== "artist" && <p className="text-xs text-gray-500 truncate">{track.album}</p>}
              </div>

              <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 text-gray-400 hover:text-red-400"
                  onClick={() => likeTrack(track)}
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
