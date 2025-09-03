"use client"

import { MainLayout } from "@/components/main-layout"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { useAudio } from "@/contexts/audio-context"

export default function RecentlyPlayedPage() {
  const [tracks, setTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { playTrack } = useAudio()

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const token = localStorage.getItem("auraluxe_token")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/users/recently-played`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          const normalized = (data.recentlyPlayed || []).map((t: any) => ({
            id: t.trackId,
            title: t.title,
            artist: t.artist,
            image: t.image,
            preview_url: t.preview_url,
          }))
          setTracks(normalized)
        }
      } catch (e) {
        console.error("Failed to fetch recently played", e)
      } finally {
        setLoading(false)
      }
    }
    fetchRecent()
  }, [])

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white mb-6">Recently Played</h1>
        {loading ? (
          <p className="text-gray-300">Loading...</p>
        ) : tracks.length === 0 ? (
          <p className="text-gray-300">No recent plays yet.</p>
        ) : (
          <div className="grid gap-3">
            {tracks.map((track) => (
              <Card key={track.id} className="bg-white/5 border-white/10 group">
                <CardContent className="flex items-center gap-4 p-4">
                  <img src={track.image} alt={track.title} className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white truncate">{track.title}</p>
                    <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                  </div>
                  <Button size="sm" className="opacity-0 group-hover:opacity-100" onClick={() => playTrack(track, tracks)}>
                    <Play className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}


