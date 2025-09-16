"use client"

import { MainLayout } from "@/components/main-layout"
import { useEffect, useState } from "react"
import { MusicCarousel } from "@/components/music-carousel"

export default function TopChartsPage() {
  const [tracks, setTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/music/trending?limit=30`)
        if (res.ok) {
          const data = await res.json()
          setTracks(data.tracks || [])
        }
      } catch (e) {
        console.error("Failed to fetch top charts", e)
      } finally {
        setLoading(false)
      }
    }
    fetchTop()
  }, [])

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white mb-6">Top Charts</h1>
        {loading ? (
          <p className="text-gray-300">Loading...</p>
        ) : (
          <MusicCarousel title="Popular Now" tracks={tracks} />
        )}
      </div>
    </MainLayout>
  )
}


