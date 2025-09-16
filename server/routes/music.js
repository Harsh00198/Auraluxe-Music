const express = require("express")
const axios = require("axios")
const { optionalAuth } = require("../middleware/auth")

const router = express.Router()

// Music API service class
class MusicAPIService {
  constructor() {
    this.lastFmApiKey = process.env.LASTFM_API_KEY
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY || "AIzaSyByFLH-DUWScupIA666ib6J-tRQ09gPsoc"
    this.deezerBaseUrl = "https://api.deezer.com"
    this.youtubeBaseUrl = "https://www.googleapis.com/youtube/v3"
    this.itunesBaseUrl = "https://itunes.apple.com/search"
    this.lastFmBaseUrl = "https://ws.audioscrobble.com/2.0/"
  }

  async searchDeezer(query, limit = 10) {
    try {
      const response = await axios.get(`${this.deezerBaseUrl}/search`, {
        params: { q: query, limit },
        timeout: 5000,
      })

      return (
        response.data.data?.map((track) => ({
          id: `deezer-${track.id}`,
          title: track.title,
          artist: track.artist.name,
          album: track.album.title,
          image: track.album.cover_medium,
          duration: this.formatDuration(track.duration),
          preview_url: track.preview,
          source: "deezer",
        })) || []
      )
    } catch (error) {
      console.error("Deezer API error:", error.message)
      return []
    }
  }

  async searchItunes(query, limit = 10) {
    try {
      const response = await axios.get(this.itunesBaseUrl, {
        params: {
          term: query,
          media: "music",
          entity: "song",
          limit,
        },
        timeout: 5000,
      })

      return (
        response.data.results?.map((track) => ({
          id: `itunes-${track.trackId}`,
          title: track.trackName,
          artist: track.artistName,
          album: track.collectionName,
          image: track.artworkUrl100?.replace("100x100", "300x300"),
          duration: this.formatDuration(track.trackTimeMillis / 1000),
          preview_url: track.previewUrl,
          source: "itunes",
        })) || []
      )
    } catch (error) {
      console.error("iTunes API error:", error.message)
      return []
    }
  }

  async searchYouTube(query, limit = 10) {
    if (!this.youtubeApiKey) return []

    try {
      const response = await axios.get(`${this.youtubeBaseUrl}/search`, {
        params: {
          q: query,
          maxResults: limit,
          key: this.youtubeApiKey,
          part: "snippet",
          type: "video",
        },
        timeout: 5000,
      })

      return (
        response.data.items?.map((item) => ({
          id: `youtube-${item.id.videoId}`,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          album: null,
          image: item.snippet.thumbnails?.medium?.url,
          duration: null,
          preview_url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          source: "youtube",
        })) || []
      )
    } catch (error) {
      console.error("YouTube API error:", error.message)
      return []
    }
  }

  async searchLastFm(query, limit = 10) {
    if (!this.lastFmApiKey) return []

    try {
      const response = await axios.get(this.lastFmBaseUrl, {
        params: {
          method: "track.search",
          track: query,
          api_key: this.lastFmApiKey,
          format: "json",
          limit,
        },
        timeout: 5000,
      })

      return (
        response.data.results?.trackmatches?.track?.map((track) => ({
          id: `lastfm-${track.mbid || track.name}`,
          title: track.name,
          artist: track.artist,
          image: track.image?.[2]?.["#text"] || "/placeholder.svg?height=300&width=300",
          duration: null,
          preview_url: null,
          source: "lastfm",
        })) || []
      )
    } catch (error) {
      console.error("Last.fm API error:", error.message)
      return []
    }
  }

  async getTopTracks(limit = 20) {
    try {
      const [deezerChart, itunesChart] = await Promise.allSettled([
        axios.get(`${this.deezerBaseUrl}/chart/0/tracks`, {
          params: { limit: limit / 2 },
          timeout: 5000,
        }),
        axios.get(this.itunesBaseUrl, {
          params: {
            term: "top songs 2024",
            media: "music",
            entity: "song",
            limit: limit / 2,
          },
          timeout: 5000,
        }),
      ])

      let tracks = []

      if (deezerChart.status === "fulfilled") {
        const deezerTracks =
          deezerChart.value.data.data?.map((track) => ({
            id: `deezer-${track.id}`,
            title: track.title,
            artist: track.artist.name,
            album: track.album.title,
            image: track.album.cover_medium,
            duration: this.formatDuration(track.duration),
            preview_url: track.preview,
            source: "deezer",
          })) || []
        tracks = tracks.concat(deezerTracks)
      }

      if (itunesChart.status === "fulfilled") {
        const itunesTracks =
          itunesChart.value.data.results?.map((track) => ({
            id: `itunes-${track.trackId}`,
            title: track.trackName,
            artist: track.artistName,
            album: track.collectionName,
            image: track.artworkUrl100?.replace("100x100", "300x300"),
            duration: this.formatDuration(track.trackTimeMillis / 1000),
            preview_url: track.previewUrl,
            source: "itunes",
          })) || []
        tracks = tracks.concat(itunesTracks)
      }

      return this.deduplicateTracks(tracks).slice(0, limit)
    } catch (error) {
      console.error("Top tracks error:", error.message)
      return []
    }
  }

  formatDuration(seconds) {
    if (!seconds) return null
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  deduplicateTracks(tracks) {
    const seen = new Set()
    return tracks.filter((track) => {
      const key = `${track.title?.toLowerCase() || ""}-${track.artist?.toLowerCase() || ""}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
}

const musicAPI = new MusicAPIService()

// Search music across all APIs
router.get("/search", optionalAuth, async (req, res) => {
  try {
    const { q: query, limit = 20 } = req.query

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: "Search query must be at least 2 characters" })
    }

    const searchLimit = Math.ceil(limit / 4) // 4 APIs now!

    const [deezerResults, itunesResults, lastfmResults, youtubeResults] = await Promise.allSettled([
      musicAPI.searchDeezer(query, searchLimit),
      musicAPI.searchItunes(query, searchLimit),
      musicAPI.searchLastFm(query, searchLimit),
      musicAPI.searchYouTube(query, searchLimit), // ✅ YouTube search
    ])

    let allTracks = []

    if (deezerResults.status === "fulfilled") allTracks = allTracks.concat(deezerResults.value)
    if (itunesResults.status === "fulfilled") allTracks = allTracks.concat(itunesResults.value)
    if (lastfmResults.status === "fulfilled") allTracks = allTracks.concat(lastfmResults.value)
    if (youtubeResults.status === "fulfilled") allTracks = allTracks.concat(youtubeResults.value) // ✅ YouTube results

    const uniqueTracks = musicAPI.deduplicateTracks(allTracks)

    res.json({
      tracks: uniqueTracks.slice(0, limit),
      total: uniqueTracks.length,
      query,
    })
  } catch (error) {
    console.error("Search error:", error)
    res.status(500).json({ error: "Search failed" })
  }
})

// Get trending tracks
router.get("/trending", optionalAuth, async (req, res) => {
  try {
    const { limit = 20 } = req.query
    const tracks = await musicAPI.getTopTracks(Number.parseInt(limit))

    res.json({
      tracks,
      category: "trending",
    })
  } catch (error) {
    console.error("Trending tracks error:", error)
    res.status(500).json({ error: "Failed to fetch trending tracks" })
  }
})

// Get track by ID (for streaming)
router.get("/track/:id", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params
    const [source, trackId] = id.split("-", 2)

    let track = null

    switch (source) {
      case "deezer":
        try {
          const response = await axios.get(`${musicAPI.deezerBaseUrl}/track/${trackId}`)
          const data = response.data
          track = {
            id: `deezer-${data.id}`,
            title: data.title,
            artist: data.artist.name,
            album: data.album.title,
            image: data.album.cover_medium,
            duration: musicAPI.formatDuration(data.duration),
            preview_url: data.preview,
            source: "deezer",
          }
        } catch (error) {
          console.error("Deezer track fetch error:", error.message)
        }
        break

      case "itunes":
        try {
          const response = await axios.get(musicAPI.itunesBaseUrl, {
            params: { id: trackId, entity: "song" },
          })
          const data = response.data.results?.[0]
          if (data) {
            track = {
              id: `itunes-${data.trackId}`,
              title: data.trackName,
              artist: data.artistName,
              album: data.collectionName,
              image: data.artworkUrl100?.replace("100x100", "300x300"),
              duration: musicAPI.formatDuration(data.trackTimeMillis / 1000),
              preview_url: data.previewUrl,
              source: "itunes",
            }
          }
        } catch (error) {
          console.error("iTunes track fetch error:", error.message)
        }
        break
    }

    if (!track) {
      return res.status(404).json({ error: "Track not found" })
    }

    res.json({ track })
  } catch (error) {
    console.error("Track fetch error:", error)
    res.status(500).json({ error: "Failed to fetch track" })
  }
})

module.exports = router
