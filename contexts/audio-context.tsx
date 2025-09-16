"use client"

import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"

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

interface AudioContextType {
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  progress: number
  duration: number
  queue: Track[]
  currentIndex: number
  isShuffled: boolean
  repeatMode: "off" | "one" | "all"
  isLoading: boolean
  playTrack: (track: Track, queue?: Track[]) => void
  togglePlay: () => void
  nextTrack: () => void
  previousTrack: () => void
  setVolume: (volume: number) => void
  setProgress: (progress: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  addToQueue: (track: Track) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  shuffleQueue: () => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export function AudioProvider({ children }: { children: ReactNode }) {
  const { user, updatePreferences } = useAuth()
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(0.7)
  const [progress, setProgressState] = useState(0)
  const [duration, setDuration] = useState(0)
  const [queue, setQueue] = useState<Track[]>([])
  const [originalQueue, setOriginalQueue] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isShuffled, setIsShuffled] = useState(false)
  const [repeatMode, setRepeatMode] = useState<"off" | "one" | "all">("off")
  const [isLoading, setIsLoading] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const progressUpdateRef = useRef<NodeJS.Timeout>()

  // Initialize volume from user preferences
  useEffect(() => {
    if (user?.preferences?.volume !== undefined) {
      setVolumeState(user.preferences.volume)
    }
  }, [user])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100
        setProgressState(progress)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
      setIsLoading(false)
    }

    const handleLoadStart = () => {
      setIsLoading(true)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0
        audio.play().catch(console.error)
      } else {
        handleTrackEnd()
      }
    }

    const handleError = (e: Event) => {
      console.error("Audio error:", e)
      setIsPlaying(false)
      setIsLoading(false)
      // Try next track if available
      if (queue.length > 1) {
        nextTrack()
      }
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleWaiting = () => {
      setIsLoading(true)
    }

    const handlePlaying = () => {
      setIsLoading(false)
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("loadstart", handleLoadStart)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("waiting", handleWaiting)
    audio.addEventListener("playing", handlePlaying)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("loadstart", handleLoadStart)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("waiting", handleWaiting)
      audio.removeEventListener("playing", handlePlaying)
    }
  }, [repeatMode, queue.length])

  // Handle track end based on repeat and shuffle modes
  const handleTrackEnd = () => {
    if (repeatMode === "all" || currentIndex < queue.length - 1) {
      nextTrack()
    } else {
      setIsPlaying(false)
      setProgressState(0)
    }
  }

  // Sync audio with state
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack?.preview_url) return

    const loadAndPlay = async () => {
      try {
        // Pause current playback
        if (!audio.paused) {
          audio.pause()
        }

        // Only update source if it's different
        if (audio.src !== currentTrack.preview_url) {
          audio.src = currentTrack.preview_url ?? ""
          audio.load()
        }

        // Set volume
        audio.volume = volume

        // Play or pause based on state
        if (isPlaying) {
          await audio.play()
        }
      } catch (err) {
        const error = err as DOMException
        if (error.name !== "AbortError") {
          console.error("Audio playback error:", error)
          setIsPlaying(false)
          setIsLoading(false)
        }
      }
    }

    void loadAndPlay()
  }, [currentTrack, isPlaying])

  // Update volume when changed
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = volume
    }
  }, [volume])

  const playTrack = async (track: Track, newQueue?: Track[]) => {
    setCurrentTrack(track)
    setIsPlaying(true)
    setProgressState(0)

    if (newQueue) {
      setQueue(newQueue)
      setOriginalQueue([...newQueue])
      const index = newQueue.findIndex((t) => t.id === track.id)
      setCurrentIndex(index >= 0 ? index : 0)
    } else if (queue.length === 0) {
      // If no queue exists, create one with just this track
      setQueue([track])
      setOriginalQueue([track])
      setCurrentIndex(0)
    }

    // Add to recently played
    if (user) {
      try {
        const token = localStorage.getItem("auraluxe_token")
        await fetch(`${API_BASE_URL}/users/recently-played`, {
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
        console.error("Failed to add to recently played:", error)
      }
    }
  }

  const togglePlay = () => {
    if (!currentTrack) return
    setIsPlaying(!isPlaying)
  }

  const nextTrack = () => {
    if (queue.length === 0) return

    let nextIndex = currentIndex + 1

    if (isShuffled) {
      // Generate random index different from current
      const availableIndices = queue.map((_, i) => i).filter((i) => i !== currentIndex)
      if (availableIndices.length > 0) {
        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
      }
    } else if (nextIndex >= queue.length) {
      if (repeatMode === "all") {
        nextIndex = 0
      } else {
        setIsPlaying(false)
        return
      }
    }

    setCurrentIndex(nextIndex)
    setCurrentTrack(queue[nextIndex])
    setIsPlaying(true)
    setProgressState(0)
  }

  const previousTrack = () => {
    if (queue.length === 0) return

    // If more than 3 seconds have passed, restart current track
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      setProgressState(0)
      return
    }

    let prevIndex = currentIndex - 1

    if (prevIndex < 0) {
      if (repeatMode === "all") {
        prevIndex = queue.length - 1
      } else {
        return
      }
    }

    setCurrentIndex(prevIndex)
    setCurrentTrack(queue[prevIndex])
    setIsPlaying(true)
    setProgressState(0)
  }

  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setVolumeState(clampedVolume)

    // Update user preferences
    if (user) {
      updatePreferences({ volume: clampedVolume })
    }
  }

  const setProgress = (newProgress: number) => {
    const audio = audioRef.current
    if (audio && duration) {
      const newTime = (newProgress / 100) * duration
      audio.currentTime = newTime
      setProgressState(newProgress)
    }
  }

  const toggleShuffle = () => {
    const newShuffled = !isShuffled
    setIsShuffled(newShuffled)

    if (newShuffled) {
      // Shuffle the queue but keep current track at current position
      const shuffledQueue = [...queue]
      const currentTrackItem = shuffledQueue[currentIndex]

      // Remove current track temporarily
      shuffledQueue.splice(currentIndex, 1)

      // Shuffle remaining tracks
      for (let i = shuffledQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffledQueue[i], shuffledQueue[j]] = [shuffledQueue[j], shuffledQueue[i]]
      }

      // Put current track back at index 0
      shuffledQueue.unshift(currentTrackItem)
      setQueue(shuffledQueue)
      setCurrentIndex(0)
    } else {
      // Restore original order
      setQueue([...originalQueue])
      const originalIndex = originalQueue.findIndex((track) => track.id === currentTrack?.id)
      setCurrentIndex(originalIndex >= 0 ? originalIndex : 0)
    }
  }

  const toggleRepeat = () => {
    const modes: Array<"off" | "one" | "all"> = ["off", "one", "all"]
    const currentModeIndex = modes.indexOf(repeatMode)
    const nextMode = modes[(currentModeIndex + 1) % modes.length]
    setRepeatMode(nextMode)
  }

  const addToQueue = (track: Track) => {
    const newQueue = [...queue, track]
    setQueue(newQueue)
    if (!isShuffled) {
      setOriginalQueue([...originalQueue, track])
    }
  }

  const removeFromQueue = (index: number) => {
    const newQueue = queue.filter((_, i) => i !== index)
    setQueue(newQueue)

    if (!isShuffled) {
      const trackToRemove = queue[index]
      setOriginalQueue((prev) => prev.filter((track) => track.id !== trackToRemove.id))
    }

    if (index < currentIndex) {
      setCurrentIndex((prev) => prev - 1)
    } else if (index === currentIndex) {
      if (newQueue.length > 0) {
        const nextIndex = Math.min(currentIndex, newQueue.length - 1)
        setCurrentIndex(nextIndex)
        setCurrentTrack(newQueue[nextIndex])
      } else {
        setCurrentTrack(null)
        setIsPlaying(false)
      }
    }
  }

  const clearQueue = () => {
    setQueue([])
    setOriginalQueue([])
    setCurrentIndex(0)
    setCurrentTrack(null)
    setIsPlaying(false)
    setProgressState(0)
  }

  const shuffleQueue = () => {
    if (queue.length <= 1) return

    const shuffledQueue = [...queue]
    const currentTrackItem = currentTrack

    // Remove current track if it exists
    const currentTrackIndex = shuffledQueue.findIndex((track) => track.id === currentTrackItem?.id)
    if (currentTrackIndex >= 0) {
      shuffledQueue.splice(currentTrackIndex, 1)
    }

    // Shuffle remaining tracks
    for (let i = shuffledQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledQueue[i], shuffledQueue[j]] = [shuffledQueue[j], shuffledQueue[i]]
    }

    // Add current track back at the beginning if it exists
    if (currentTrackItem) {
      shuffledQueue.unshift(currentTrackItem)
    }

    setQueue(shuffledQueue)
    setCurrentIndex(0)
  }

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        progress,
        duration,
        queue,
        currentIndex,
        isShuffled,
        repeatMode,
        isLoading,
        playTrack,
        togglePlay,
        nextTrack,
        previousTrack,
        setVolume,
        setProgress,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        removeFromQueue,
        clearQueue,
        shuffleQueue,
      }}
    >
      <audio ref={audioRef} preload="metadata" />
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}
