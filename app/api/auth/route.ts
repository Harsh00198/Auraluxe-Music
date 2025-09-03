import { type NextRequest, NextResponse } from "next/server"
import { mockDb } from "@/lib/database/mock-db"

export async function POST(request: NextRequest) {
  try {
    const { email, name, action } = await request.json()

    if (action === "login") {
      const user = await mockDb.getUserByEmail(email)
      if (user) {
        return NextResponse.json({ user, success: true })
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
    }

    if (action === "register") {
      const existingUser = await mockDb.getUserByEmail(email)
      if (existingUser) {
        return NextResponse.json({ error: "User already exists" }, { status: 409 })
      }

      const user = await mockDb.createUser({ email, name })
      return NextResponse.json({ user, success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
