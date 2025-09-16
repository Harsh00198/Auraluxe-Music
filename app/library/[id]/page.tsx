"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { useAudio } from "@/contexts/audio-context"

export default function PlaylistDetailPage() {
  const params = useParams<{ id: string }>()
  const playlistId = params?.id
  const [playlist, setPlaylist] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const { playTrack } = useAudio()

  useEffect(() => {
    if (!playlistId) return
    const fetchPlaylist = async () => {
      try {
        const token = localStorage.getItem("auraluxe_token")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/playlists/${playlistId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setPlaylist(data.playlist)
        }
      } catch (e) {
        console.error("Failed to fetch playlist", e)
      } finally {
        setLoading(false)
      }
    }
    fetchPlaylist()
  }, [playlistId])

  const normalizedTracks = (playlist?.tracks || []).map((t: any) => ({
    id: t.trackId,
    title: t.title,
    artist: t.artist,
    album: t.album,
    image: t.image,
    duration: t.duration,
    preview_url: t.preview_url,
  }))

  return (
    <MainLayout>
      <div className="p-6">
        {loading ? (
          <p className="text-gray-300">Loading...</p>
        ) : !playlist ? (
          <p className="text-gray-300">Playlist not found.</p>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              <img
                src={playlist.coverImage || "/placeholder.svg?height=200&width=200"}
                alt={playlist.name}
                className="w-24 h-24 rounded object-cover"
              />
              <div>
                <h1 className="text-3xl font-semibold text-white">{playlist.name}</h1>
                <p className="text-gray-400">{playlist.description || "Playlist"}</p>
              </div>
            </div>

            {normalizedTracks.length === 0 ? (
              <p className="text-gray-300">No tracks in this playlist yet.</p>
            ) : (
              <div className="grid gap-3">
                {normalizedTracks.map((track) => (
                  <Card key={track.id} className="bg-white/5 border-white/10 group">
                    <CardContent className="flex items-center gap-4 p-4">
                      <img src={track.image} alt={track.title} className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white truncate">{track.title}</p>
                        <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                      </div>
                      <Button size="sm" className="opacity-0 group-hover:opacity-100" onClick={() => playTrack(track, normalizedTracks)}>
                        <Play className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}


