"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Heart,
  Share,
  Maximize2,
  List,
} from "lucide-react"
import { useAudio } from "@/contexts/audio-context"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

export function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    isShuffled,
    repeatMode,
    togglePlay,
    nextTrack,
    previousTrack,
    setVolume,
    setProgress,
    toggleShuffle,
    toggleRepeat,
  } = useAudio()

  const { user } = useAuth()
  const [isMuted, setIsMuted] = useState(false)
  const [showQueue, setShowQueue] = useState(false)

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100
    setVolume(newVolume)
  }

  const handleProgressChange = (value: number[]) => {
    setProgress(value[0])
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    setVolume(isMuted ? 0.7 : 0)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const likeCurrentTrack = async () => {
    if (!user || !currentTrack) return

    try {
      const token = localStorage.getItem("auraluxe_token")
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/users/like-track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trackId: currentTrack.id,
          title: currentTrack.title,
          artist: currentTrack.artist,
          image: currentTrack.image,
          preview_url: currentTrack.preview_url,
        }),
      })
    } catch (error) {
      console.error("Failed to like track:", error)
    }
  }

  if (!currentTrack) return null

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-30 bg-black/90 backdrop-blur-xl border-t border-white/20 rounded-none">
      <div className="flex items-center gap-4 p-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative">
            <img
              src={currentTrack.image || "/placeholder.svg?height=300&width=300"}
              alt={currentTrack.title}
              className="w-14 h-14 rounded-lg object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-white truncate">{currentTrack.title}</h4>
            <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 text-gray-400 hover:text-red-400"
            onClick={likeCurrentTrack}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShuffle}
              className={cn("w-8 h-8 p-0 text-gray-400 hover:text-white", isShuffled && "text-green-400")}
            >
              <Shuffle className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-gray-400 hover:text-white"
              onClick={previousTrack}
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-200 text-black shadow-lg"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-gray-400 hover:text-white"
              onClick={nextTrack}
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRepeat}
              className={cn("w-8 h-8 p-0 text-gray-400 hover:text-white", repeatMode !== "off" && "text-green-400")}
            >
              <Repeat className="w-4 h-4" />
              {repeatMode === "one" && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full text-xs flex items-center justify-center text-black font-bold">
                  1
                </span>
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-gray-400 w-10 text-right">{formatTime((progress / 100) * duration)}</span>
            <Slider value={[progress]} onValueChange={handleProgressChange} max={100} step={0.1} className="flex-1" />
            <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Additional Controls */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 text-gray-400 hover:text-white"
            onClick={() => setShowQueue(!showQueue)}
          >
            <List className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-white">
            <Share className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-white">
            <Maximize2 className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="w-8 h-8 p-0 text-gray-400 hover:text-white"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <Slider value={[volume * 100]} onValueChange={handleVolumeChange} max={100} step={1} className="w-20" />
          </div>
        </div>
      </div>
    </Card>
  )
}
