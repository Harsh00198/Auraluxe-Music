// Mock database for development - easily replaceable with real database

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  playlists: string[]
  likedTracks: string[]
}

interface Playlist {
  id: string
  name: string
  description?: string
  userId: string
  tracks: string[]
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

interface Track {
  id: string
  title: string
  artist: string
  album?: string
  image: string
  duration?: string
  preview_url?: string
  genre?: string
  year?: number
}

class MockDatabase {
  private users: Map<string, User> = new Map()
  private playlists: Map<string, Playlist> = new Map()
  private tracks: Map<string, Track> = new Map()

  constructor() {
    this.initializeMockData()
  }

  // User methods
  async createUser(userData: Omit<User, "id" | "playlists" | "likedTracks">): Promise<User> {
    const user: User = {
      id: this.generateId(),
      ...userData,
      playlists: [],
      likedTracks: [],
    }
    this.users.set(user.id, user)
    return user
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user
      }
    }
    return null
  }

  // Playlist methods
  async createPlaylist(playlistData: Omit<Playlist, "id" | "createdAt" | "updatedAt">): Promise<Playlist> {
    const playlist: Playlist = {
      id: this.generateId(),
      ...playlistData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.playlists.set(playlist.id, playlist)

    // Add to user's playlists
    const user = this.users.get(playlist.userId)
    if (user) {
      user.playlists.push(playlist.id)
    }

    return playlist
  }

  async getPlaylistById(id: string): Promise<Playlist | null> {
    return this.playlists.get(id) || null
  }

  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    const user = this.users.get(userId)
    if (!user) return []

    return user.playlists.map((id) => this.playlists.get(id)).filter(Boolean) as Playlist[]
  }

  async addTrackToPlaylist(playlistId: string, trackId: string): Promise<boolean> {
    const playlist = this.playlists.get(playlistId)
    if (!playlist) return false

    if (!playlist.tracks.includes(trackId)) {
      playlist.tracks.push(trackId)
      playlist.updatedAt = new Date()
    }
    return true
  }

  async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<boolean> {
    const playlist = this.playlists.get(playlistId)
    if (!playlist) return false

    const index = playlist.tracks.indexOf(trackId)
    if (index > -1) {
      playlist.tracks.splice(index, 1)
      playlist.updatedAt = new Date()
    }
    return true
  }

  // Track methods
  async addTrack(trackData: Track): Promise<Track> {
    this.tracks.set(trackData.id, trackData)
    return trackData
  }

  async getTrackById(id: string): Promise<Track | null> {
    return this.tracks.get(id) || null
  }

  async searchTracks(query: string): Promise<Track[]> {
    const results: Track[] = []
    const searchTerm = query.toLowerCase()

    for (const track of this.tracks.values()) {
      if (
        track.title.toLowerCase().includes(searchTerm) ||
        track.artist.toLowerCase().includes(searchTerm) ||
        track.album?.toLowerCase().includes(searchTerm)
      ) {
        results.push(track)
      }
    }

    return results
  }

  async getTrendingTracks(limit = 20): Promise<Track[]> {
    // Return random tracks as "trending"
    const allTracks = Array.from(this.tracks.values())
    return this.shuffleArray(allTracks).slice(0, limit)
  }

  // Like/Unlike methods
  async likeTrack(userId: string, trackId: string): Promise<boolean> {
    const user = this.users.get(userId)
    if (!user) return false

    if (!user.likedTracks.includes(trackId)) {
      user.likedTracks.push(trackId)
    }
    return true
  }

  async unlikeTrack(userId: string, trackId: string): Promise<boolean> {
    const user = this.users.get(userId)
    if (!user) return false

    const index = user.likedTracks.indexOf(trackId)
    if (index > -1) {
      user.likedTracks.splice(index, 1)
    }
    return true
  }

  async getLikedTracks(userId: string): Promise<Track[]> {
    const user = this.users.get(userId)
    if (!user) return []

    return user.likedTracks.map((id) => this.tracks.get(id)).filter(Boolean) as Track[]
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = (Math.floor(Math.random() * (i + 1))[(shuffled[i], shuffled[j])] = [shuffled[j], shuffled[i]])
    }
    return shuffled
  }

  private initializeMockData() {
    // Add some sample tracks
    const sampleTracks: Track[] = [
      {
        id: "track-1",
        title: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
        image: "/placeholder.svg?height=300&width=300",
        duration: "3:20",
        genre: "Pop",
        year: 2020,
      },
      {
        id: "track-2",
        title: "Shape of You",
        artist: "Ed Sheeran",
        album: "÷ (Divide)",
        image: "/placeholder.svg?height=300&width=300",
        duration: "3:53",
        genre: "Pop",
        year: 2017,
      },
      {
        id: "track-3",
        title: "Bohemian Rhapsody",
        artist: "Queen",
        album: "A Night at the Opera",
        image: "/placeholder.svg?height=300&width=300",
        duration: "5:55",
        genre: "Rock",
        year: 1975,
      },
      {
        id: "track-4",
        title: "Levitating",
        artist: "Dua Lipa",
        album: "Future Nostalgia",
        image: "/placeholder.svg?height=300&width=300",
        duration: "3:23",
        genre: "Pop",
        year: 2020,
      },
      {
        id: "track-5",
        title: "Watermelon Sugar",
        artist: "Harry Styles",
        album: "Fine Line",
        image: "/placeholder.svg?height=300&width=300",
        duration: "2:54",
        genre: "Pop",
        year: 2020,
      },
    ]

    // Initialize tracks
    sampleTracks.forEach((track) => {
      this.tracks.set(track.id, track)
    })

    // Create sample user
    const sampleUser: User = {
      id: "user-1",
      email: "demo@vibestream.com",
      name: "Demo User",
      playlists: [],
      likedTracks: ["track-1", "track-3"],
    }
    this.users.set(sampleUser.id, sampleUser)
  }

  // Migration helpers for production databases
  async migrateToSupabase() {
    // Helper method to export data for Supabase migration
    return {
      users: Array.from(this.users.values()),
      playlists: Array.from(this.playlists.values()),
      tracks: Array.from(this.tracks.values()),
    }
  }

  async migrateToMongoDB() {
    // Helper method to export data for MongoDB migration
    return {
      users: Array.from(this.users.values()),
      playlists: Array.from(this.playlists.values()),
      tracks: Array.from(this.tracks.values()),
    }
  }
}

export const mockDb = new MockDatabase()
