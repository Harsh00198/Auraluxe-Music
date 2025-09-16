const express = require("express")
const User = require("../models/User")
const Playlist = require("../models/Playlist")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get all users (admin only)
router.get("/users", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", role = "" } = req.query
    
    const query = {}
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }
    if (role) {
      query.role = role
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

// Get user by ID (admin only)
router.get("/users/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ error: "Failed to fetch user" })
  }
})

// Update user (admin only)
router.patch("/users/:id", adminAuth, async (req, res) => {
  try {
    const { role, isActive, profile, preferences } = req.body
    
    const updateData = {}
    if (role !== undefined) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive
    if (profile) updateData.profile = profile
    if (preferences) updateData.preferences = preferences

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select("-password")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({ message: "User updated successfully", user })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({ error: "Failed to update user" })
  }
})

// Delete user (admin only)
router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Also delete user's playlists
    await Playlist.deleteMany({ userId: req.params.id })

    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({ error: "Failed to delete user" })
  }
})

// Get all playlists (admin only)
router.get("/playlists", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query
    
    const query = {}
    if (search) {
      query.name = { $regex: search, $options: "i" }
    }

    const playlists = await Playlist.find(query)
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Playlist.countDocuments(query)

    res.json({
      playlists,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get playlists error:", error)
    res.status(500).json({ error: "Failed to fetch playlists" })
  }
})

// Get dashboard stats (admin only)
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isActive: true })
    const totalPlaylists = await Playlist.countDocuments()
    const adminUsers = await User.countDocuments({ role: "admin" })
    const moderatorUsers = await User.countDocuments({ role: "moderator" })

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    })

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalPlaylists,
        adminUsers,
        moderatorUsers,
        recentUsers,
      }
    })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({ error: "Failed to fetch stats" })
  }
})

module.exports = router
