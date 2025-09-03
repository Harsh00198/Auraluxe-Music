"use client"

import { useState, useEffect } from "react"
import { MusicCarousel } from "@/components/music-carousel"
import { AllMusicSection } from "@/components/all-music-section"

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

export function HomePage() {
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendingTracks()
  }, [])

  const fetchTrendingTracks = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/music/trending?limit=20`,
      )
      if (response.ok) {
        const data = await response.json()
        setTrendingTracks(data.tracks)
      }
    } catch (error) {
      console.error("Failed to fetch trending tracks:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <div className="animate-pulse">
          <div className="h-32 bg-white/10 rounded-2xl mb-8"></div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="mb-8">
              <div className="h-6 bg-white/10 rounded w-48 mb-4"></div>
              <div className="flex gap-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="w-48 h-64 bg-white/10 rounded-lg"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to Auraluxe</h1>
          <p className="text-xl text-white/80 mb-6">
            Discover your next favorite song with our premium music streaming experience
          </p>
        </div>
        <div className="absolute inset-0 bg-black/20" />

        {/* Floating elements */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      </section>

      {/* Music Carousels */}
      <MusicCarousel title="Trending Now" tracks={trendingTracks} />
      <MusicCarousel title="New Releases" tracks={trendingTracks.slice(0, 10)} />
      <MusicCarousel title="Hindi Hits" tracks={trendingTracks.slice(5, 15)} />
      <MusicCarousel title="Weekly Top Songs" tracks={trendingTracks.slice(10, 20)} />
      <MusicCarousel title="Popular Artists" tracks={trendingTracks.slice(0, 8)} type="artist" />
      <MusicCarousel title="Evergreen Classics" tracks={trendingTracks.slice(3, 13)} />
      <MusicCarousel title="Featured Albums" tracks={trendingTracks.slice(7, 17)} type="album" />

      {/* All Music Section */}
      <AllMusicSection />
    </div>
  )
}
