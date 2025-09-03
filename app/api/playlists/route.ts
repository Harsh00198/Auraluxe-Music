import { type NextRequest, NextResponse } from "next/server"

const YOUTUBE_API_KEY = "AIzaSyByFLH-DUWScupIA666ib6J-tRQ09gPsoc"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId") // Treated as YouTube channel ID

  if (!userId) {
    return NextResponse.json({ error: "Channel ID (userId) required" }, { status: 400 })
  }

  try {
    // Fetch playlists for the given channel ID
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${userId}&maxResults=25&key=${YOUTUBE_API_KEY}`
    )
    if (!response.ok) {
      const err = await response.json()
      console.error("YouTube API error:", err)
      return NextResponse.json({ error: "Failed to fetch playlists from YouTube" }, { status: response.status })
    }

    const data = await response.json()
    const playlists = data.items?.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnails: item.snippet.thumbnails,
    }))

    return NextResponse.json({ playlists })
  } catch (error) {
    console.error("Error fetching playlists:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const playlistData = await request.json()
    console.log("Received playlist data:", playlistData)

    // Creating a playlist on YouTube requires OAuth2 user authentication,
    // which can't be done with an API key alone.
    return NextResponse.json(
      { error: "Creating playlists on YouTube requires OAuth2. API key alone is insufficient." },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error in POST:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
