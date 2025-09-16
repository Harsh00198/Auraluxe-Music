"use client"

import { MainLayout } from "@/components/main-layout"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LibraryPage() {
  const [playlists, setPlaylists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const token = localStorage.getItem("auraluxe_token")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/playlists`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setPlaylists(data.playlists || [])
        }
      } catch (e) {
        console.error("Failed to fetch playlists", e)
      } finally {
        setLoading(false)
      }
    }
    fetchPlaylists()
  }, [])

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white mb-6">Your Library</h1>

        {loading ? (
          <p className="text-gray-300">Loading playlists...</p>
        ) : playlists.length === 0 ? (
          <p className="text-gray-300">No playlists yet.</p>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((pl) => (
              <Card key={pl._id} className="bg-white/5 border-white/10">
                <CardContent className="p-4 flex items-center gap-4">
                  <img
                    src={pl.coverImage || "/placeholder.svg?height=200&width=200"}
                    alt={pl.name}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{pl.name}</h3>
                    <p className="text-gray-400 text-sm truncate">{pl.description || "Playlist"}</p>
                  </div>
                  <Button asChild size="sm" className="shrink-0">
                    <Link href={`/library/${pl._id}`}>Open</Link>
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


