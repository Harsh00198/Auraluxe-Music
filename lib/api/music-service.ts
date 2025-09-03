interface ApiTrack {
  id: string
  title: string
  artist: string
  album?: string
  image: string
  duration?: string
  preview_url?: string
}

class MusicService {
  private YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "AIzaSyByFLH-DUWScupIA666ib6J-tRQ09gPsoc"

  // Search YouTube videos matching the query
  async searchTracks(query: string, limit = 10): Promise<ApiTrack[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${limit}&q=${encodeURIComponent(
          query
        )}&key=${this.YOUTUBE_API_KEY}`,
      )
      const data = await response.json()

      return (
        data.items?.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          image: item.snippet.thumbnails?.medium?.url || "/placeholder.svg?height=300&width=300",
          // Note: YouTube Search API doesn't return duration or preview_url
        })) || []
      )
    } catch (error) {
      console.error("Error searching YouTube tracks:", error)
      return []
    }
  }

  // Fetch trending YouTube videos as "top tracks"
  async getTopTracks(limit = 10): Promise<ApiTrack[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&chart=mostPopular&regionCode=IN&maxResults=${limit}&key=${this.YOUTUBE_API_KEY}`,
      )
      const data = await response.json()

      return (
        data.items?.map((item: any) => ({
          id: item.id,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          image: item.snippet.thumbnails?.medium?.url || "/placeholder.svg?height=300&width=300",
          duration: this.parseIsoDuration(item.contentDetails.duration),
        })) || []
      )
    } catch (error) {
      console.error("Error fetching YouTube top tracks:", error)
      return []
    }
  }

  // Provide a single source of combined results: YouTube only
  async getCombinedResults(query: string): Promise<ApiTrack[]> {
    try {
      const youtubeResults = await this.searchTracks(query, 20)
      return youtubeResults
    } catch (error) {
      console.error("Error getting combined YouTube results:", error)
      return []
    }
  }

  // Parse ISO 8601 duration returned by YouTube API to mm:ss
  private parseIsoDuration(isoDuration: string): string {
    const regex = /PT(?:(\d+)M)?(?:(\d+)S)?/
    const matches = regex.exec(isoDuration)
    const minutes = parseInt(matches?.[1] || "0", 10)
    const seconds = parseInt(matches?.[2] || "0", 10)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }
}

export const musicService = new MusicService()
