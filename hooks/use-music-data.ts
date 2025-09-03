"use client"

import { useState, useEffect } from "react"

interface Track {
  id: string
  title: string
  artist: string
  album?: string
  image: string
  duration?: string
  preview_url?: string
}

// Mock data - In production, this would come from your APIs
const generateMockTracks = (count: number, prefix: string): Track[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    title: `${prefix} Song ${i + 1}`,
    artist: `Artist ${i + 1}`,
    album: `Album ${i + 1}`,
    image: `/placeholder.svg?height=300&width=300`,
    duration: `${Math.floor(Math.random() * 3) + 2}:${Math.floor(Math.random() * 60)
      .toString()
      .padStart(2, "0")}`,
    preview_url: `https://www.soundjay.com/misc/sounds/bell-ringing-05.wav`, // Sample audio URL
  }))
}

export function useMusicData() {
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([])
  const [newReleases, setNewReleases] = useState<Track[]>([])
  const [hindiHits, setHindiHits] = useState<Track[]>([])
  const [topSongs, setTopSongs] = useState<Track[]>([])
  const [artists, setArtists] = useState<Track[]>([])
  const [evergreen, setEvergreen] = useState<Track[]>([])
  const [albums, setAlbums] = useState<Track[]>([])
  const [allTracks, setAllTracks] = useState<Track[]>([])
  const [allAlbums, setAllAlbums] = useState<Track[]>([])
  const [allArtists, setAllArtists] = useState<Track[]>([])

  useEffect(() => {
    // Simulate API calls with mock data
    setTrendingTracks(generateMockTracks(10, "Trending"))
    setNewReleases(generateMockTracks(10, "New"))
    setHindiHits(generateMockTracks(10, "Hindi"))
    setTopSongs(generateMockTracks(10, "Top"))
    setArtists(generateMockTracks(10, "Artist"))
    setEvergreen(generateMockTracks(10, "Classic"))
    setAlbums(generateMockTracks(10, "Album"))
    setAllTracks(generateMockTracks(50, "All"))
    setAllAlbums(generateMockTracks(20, "AllAlbum"))
    setAllArtists(generateMockTracks(15, "AllArtist"))
  }, [])

  return {
    trendingTracks,
    newReleases,
    hindiHits,
    topSongs,
    artists,
    evergreen,
    albums,
    allTracks,
    allAlbums,
    allArtists,
  }
}
