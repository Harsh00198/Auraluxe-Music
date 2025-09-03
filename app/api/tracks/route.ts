import { type NextRequest, NextResponse } from "next/server"

// Get YouTube API key from environment variables or use default
function getYoutubeApiKey(): string {
  return process.env.YOUTUBE_API_KEY ?? "AIzaSyByFLH-DUWScupIA666ib6J-tRQ09gPsoc"
}

const YOUTUBE_API_KEY: string = getYoutubeApiKey()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const type = searchParams.get("type") || "trending"

  try {
    let tracks: any[] = []

    switch (type) {
      case "search":
        if (query) {
          // Search videos matching the query
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=${encodeURIComponent(
              query
            )}&key=${YOUTUBE_API_KEY}`
          )
          const data = await response.json()
          tracks = data.items?.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnails: item.snippet.thumbnails,
            publishedAt: item.snippet.publishedAt,
            channelTitle: item.snippet.channelTitle,
          })) || []
        }
        break

      case "trending":
      default:
        // Simulate trending with popular videos in a region (e.g., IN for India)
        const trendingResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=IN&maxResults=20&key=${YOUTUBE_API_KEY}`
        )
        const trendingData = await trendingResponse.json()
        tracks = trendingData.items?.map((item: any) => ({
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnails: item.snippet.thumbnails,
          publishedAt: item.snippet.publishedAt,
          channelTitle: item.snippet.channelTitle,
          viewCount: item.statistics.viewCount,
        })) || []
    }

    return NextResponse.json({ tracks })
  } catch (error) {
    console.error("Error fetching tracks:", error)
    return NextResponse.json({ error: "Failed to fetch tracks" }, { status: 500 })
  }
}

export async function POST(_request: NextRequest) {
  try {
    // Adding tracks to YouTube playlists or uploading videos requires OAuth 2.0
    return NextResponse.json(
      { error: "Adding tracks to YouTube requires OAuth2. API key alone is insufficient." },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error processing POST:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
