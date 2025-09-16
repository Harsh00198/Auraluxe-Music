const express = require("express")
const User = require("../models/User")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Like/Unlike track
router.post("/like-track", auth, async (req, res) => {
  try {
    const { trackId, title, artist, image, preview_url } = req.body

    if (!trackId || !title || !artist) {
      return res.status(400).json({ error: "Missing required track information" })
    }

    const user = await User.findById(req.user._id)
    const existingLike = user.likedTracks.find((track) => track.trackId === trackId)

    if (existingLike) {
      // Unlike track
      user.likedTracks = user.likedTracks.filter((track) => track.trackId !== trackId)
      await user.save()

      res.json({
        message: "Track unliked",
        liked: false,
        likedTracks: user.likedTracks,
      })
    } else {
      // Like track
      user.likedTracks.unshift({
        trackId,
        title,
        artist,
        image: image || "/placeholder.svg?height=300&width=300",
        preview_url: preview_url || "",
      })

      // Keep only last 1000 liked tracks
      if (user.likedTracks.length > 1000) {
        user.likedTracks = user.likedTracks.slice(0, 1000)
      }

      await user.save()

      res.json({
        message: "Track liked",
        liked: true,
        likedTracks: user.likedTracks,
      })
    }
  } catch (error) {
    console.error("Like track error:", error)
    res.status(500).json({ error: "Failed to like/unlike track" })
  }
})

// Add to recently played
router.post("/recently-played", auth, async (req, res) => {
  try {
    const { trackId, title, artist, image, preview_url } = req.body

    if (!trackId || !title || !artist) {
      return res.status(400).json({ error: "Missing required track information" })
    }

    const user = await User.findById(req.user._id)

    // Remove if already exists
    user.recentlyPlayed = user.recentlyPlayed.filter((track) => track.trackId !== trackId)

    // Add to beginning
    user.recentlyPlayed.unshift({
      trackId,
      title,
      artist,
      image: image || "/placeholder.svg?height=300&width=300",
      preview_url: preview_url || "",
    })

    // Keep only last 50 tracks
    if (user.recentlyPlayed.length > 50) {
      user.recentlyPlayed = user.recentlyPlayed.slice(0, 50)
    }

    await user.save()

    res.json({
      message: "Added to recently played",
      recentlyPlayed: user.recentlyPlayed,
    })
  } catch (error) {
    console.error("Recently played error:", error)
    res.status(500).json({ error: "Failed to add to recently played" })
  }
})

// Get user's liked tracks
router.get("/liked-tracks", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("likedTracks")
    res.json({ likedTracks: user.likedTracks })
  } catch (error) {
    console.error("Get liked tracks error:", error)
    res.status(500).json({ error: "Failed to fetch liked tracks" })
  }
})

// Get user's recently played
router.get("/recently-played", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("recentlyPlayed")
    res.json({ recentlyPlayed: user.recentlyPlayed })
  } catch (error) {
    console.error("Get recently played error:", error)
    res.status(500).json({ error: "Failed to fetch recently played" })
  }
})

module.exports = router
