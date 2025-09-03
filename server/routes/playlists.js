const express = require("express")
const Playlist = require("../models/Playlist")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Get user's playlists
router.get("/", auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select("-tracks.preview_url") // Exclude preview URLs for list view

    res.json({ playlists })
  } catch (error) {
    console.error("Get playlists error:", error)
    res.status(500).json({ error: "Failed to fetch playlists" })
  }
})

// Get specific playlist
router.get("/:id", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user._id }, { isPublic: true }, { "collaborators.userId": req.user._id }],
    })

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" })
    }

    res.json({ playlist })
  } catch (error) {
    console.error("Get playlist error:", error)
    res.status(500).json({ error: "Failed to fetch playlist" })
  }
})

// Create new playlist
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, isPublic = false } = req.body

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Playlist name is required" })
    }

    const playlist = new Playlist({
      name: name.trim(),
      description: description?.trim() || "",
      userId: req.user._id,
      isPublic,
      tracks: [],
    })

    await playlist.save()

    res.status(201).json({
      message: "Playlist created successfully",
      playlist,
    })
  } catch (error) {
    console.error("Create playlist error:", error)
    res.status(500).json({ error: "Failed to create playlist" })
  }
})

// Update playlist
router.patch("/:id", auth, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" })
    }

    if (name !== undefined) playlist.name = name.trim()
    if (description !== undefined) playlist.description = description.trim()
    if (isPublic !== undefined) playlist.isPublic = isPublic

    await playlist.save()

    res.json({
      message: "Playlist updated successfully",
      playlist,
    })
  } catch (error) {
    console.error("Update playlist error:", error)
    res.status(500).json({ error: "Failed to update playlist" })
  }
})

// Delete playlist
router.delete("/:id", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" })
    }

    res.json({ message: "Playlist deleted successfully" })
  } catch (error) {
    console.error("Delete playlist error:", error)
    res.status(500).json({ error: "Failed to delete playlist" })
  }
})

// Add track to playlist
router.post("/:id/tracks", auth, async (req, res) => {
  try {
    const { trackId, title, artist, album, image, duration, preview_url, source } = req.body

    if (!trackId || !title || !artist || !source) {
      return res.status(400).json({ error: "Missing required track information" })
    }

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" })
    }

    // Check if track already exists
    const existingTrack = playlist.tracks.find((track) => track.trackId === trackId)
    if (existingTrack) {
      return res.status(400).json({ error: "Track already in playlist" })
    }

    // Add track with position
    const newTrack = {
      trackId,
      title,
      artist,
      album: album || "",
      image: image || "/placeholder.svg?height=300&width=300",
      duration: duration || "3:00",
      preview_url: preview_url || "",
      source,
      position: playlist.tracks.length,
    }

    playlist.tracks.push(newTrack)
    await playlist.save()

    res.json({
      message: "Track added to playlist",
      playlist,
      addedTrack: newTrack,
    })
  } catch (error) {
    console.error("Add track error:", error)
    res.status(500).json({ error: "Failed to add track to playlist" })
  }
})

// Remove track from playlist
router.delete("/:id/tracks/:trackId", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" })
    }

    const trackIndex = playlist.tracks.findIndex((track) => track.trackId === req.params.trackId)
    if (trackIndex === -1) {
      return res.status(404).json({ error: "Track not found in playlist" })
    }

    playlist.tracks.splice(trackIndex, 1)

    // Update positions
    playlist.tracks.forEach((track, index) => {
      track.position = index
    })

    await playlist.save()

    res.json({
      message: "Track removed from playlist",
      playlist,
    })
  } catch (error) {
    console.error("Remove track error:", error)
    res.status(500).json({ error: "Failed to remove track from playlist" })
  }
})

// Reorder tracks in playlist
router.patch("/:id/reorder", auth, async (req, res) => {
  try {
    const { trackIds } = req.body

    if (!Array.isArray(trackIds)) {
      return res.status(400).json({ error: "trackIds must be an array" })
    }

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" })
    }

    // Reorder tracks based on provided order
    const reorderedTracks = []
    trackIds.forEach((trackId, index) => {
      const track = playlist.tracks.find((t) => t.trackId === trackId)
      if (track) {
        track.position = index
        reorderedTracks.push(track)
      }
    })

    playlist.tracks = reorderedTracks
    await playlist.save()

    res.json({
      message: "Playlist reordered successfully",
      playlist,
    })
  } catch (error) {
    console.error("Reorder playlist error:", error)
    res.status(500).json({ error: "Failed to reorder playlist" })
  }
})

module.exports = router
