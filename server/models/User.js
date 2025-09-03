const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    avatar: {
      type: String,
      default: null,
    },
    profile: {
      firstName: String,
      lastName: String,
      bio: {
        type: String,
        maxlength: 500,
      },
      location: String,
      website: String,
      birthDate: Date,
    },
    preferences: {
      theme: {
        type: String,
        enum: ["dark", "light"],
        default: "dark",
      },
      volume: {
        type: Number,
        default: 0.7,
        min: 0,
        max: 1,
      },
      autoplay: {
        type: Boolean,
        default: true,
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
      },
    },
    likedTracks: [
      {
        trackId: String,
        title: String,
        artist: String,
        image: String,
        preview_url: String,
        likedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    recentlyPlayed: [
      {
        trackId: String,
        title: String,
        artist: String,
        image: String,
        preview_url: String,
        playedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    followedArtists: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better performance
userSchema.index({ email: 1 })
userSchema.index({ username: 1 })
userSchema.index({ "likedTracks.trackId": 1 })

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  return user
}

module.exports = mongoose.model("User", userSchema)
