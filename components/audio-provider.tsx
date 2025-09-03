"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface Track {
  id: string
  title: string
  artist: string
  album?: string
  image: string
  duration?: string
  preview_url?: string
}

interface AudioContextType {
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  playTrack: (track: Track) => void
  togglePlay: () => void
  setVolume: (volume: number) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(0.7)

  const playTrack = (track: Track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume)
  }

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        playTrack,
        togglePlay,
        setVolume,
      }}
    >
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
