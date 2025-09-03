const mongoose = require("mongoose")

const trackSchema = new mongoose.Schema({
  trackId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  album: String,
  image: String,
  duration: String,
  preview_url: String,
  source: {
    type: String,
    enum: ["deezer", "itunes", "lastfm", "spotify"],
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  position: {
    type: Number,
    required: true,
  },
})

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tracks: [trackSchema],
    isPublic: {
      type: Boolean,
      default: false,
    },
    coverImage: {
      type: String,
      default: null,
    },
    tags: [String],
    totalDuration: {
      type: Number,
      default: 0,
    },
    playCount: {
      type: Number,
      default: 0,
    },
    lastPlayed: Date,
    collaborators: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        permissions: {
          type: String,
          enum: ["view", "edit", "admin"],
          default: "view",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Indexes for better performance
playlistSchema.index({ userId: 1 })
playlistSchema.index({ isPublic: 1 })
playlistSchema.index({ name: "text", description: "text" })
playlistSchema.index({ "tracks.trackId": 1 })

// Virtual for track count
playlistSchema.virtual("trackCount").get(function () {
  return this.tracks.length
})

// Calculate total duration when tracks are modified
playlistSchema.pre("save", function (next) {
  if (this.isModified("tracks")) {
    this.totalDuration = this.tracks.reduce((total, track) => {
      if (track.duration) {
        const [minutes, seconds] = track.duration.split(":").map(Number)
        return total + minutes * 60 + seconds
      }
      return total + 180 // Default 3 minutes if no duration
    }, 0)
  }
  next()
})

module.exports = mongoose.model("Playlist", playlistSchema)
