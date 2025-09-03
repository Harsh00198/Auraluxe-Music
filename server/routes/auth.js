const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" })
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email ? "Email already registered" : "Username already taken",
      })
    }

    // Create user
    const user = new User({ username, email, password })
    await user.save()

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Server error during registration" })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Server error during login" })
  }
})

// Get current user
router.get("/me", auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role,
      profile: req.user.profile,
      preferences: req.user.preferences,
      likedTracks: req.user.likedTracks,
      recentlyPlayed: req.user.recentlyPlayed,
    },
  })
})

// Update user profile
router.patch("/profile", auth, async (req, res) => {
  try {
    const { profile, avatar } = req.body

    const updateData = {}
    if (profile) updateData.profile = profile
    if (avatar) updateData.avatar = avatar

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select("-password")

    res.json({ message: "Profile updated successfully", user })
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(500).json({ error: "Failed to update profile" })
  }
})

// Update user preferences
router.patch("/preferences", auth, async (req, res) => {
  try {
    const { theme, volume, autoplay, notifications } = req.body

    const updateData = {}
    if (theme) updateData["preferences.theme"] = theme
    if (typeof volume === "number") updateData["preferences.volume"] = Math.max(0, Math.min(1, volume))
    if (typeof autoplay === "boolean") updateData["preferences.autoplay"] = autoplay
    if (notifications) updateData["preferences.notifications"] = notifications

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updateData }, { new: true }).select("-password")

    res.json({ message: "Preferences updated", user })
  } catch (error) {
    console.error("Preferences update error:", error)
    res.status(500).json({ error: "Failed to update preferences" })
  }
})

// Change password
router.patch("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required" })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" })
    }

    // Verify current password
    const isMatch = await req.user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" })
    }

    // Update password
    req.user.password = newPassword
    await req.user.save()

    res.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ error: "Failed to change password" })
  }
})

module.exports = router
