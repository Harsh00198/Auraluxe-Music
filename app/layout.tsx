import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { AudioProvider } from "@/contexts/audio-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Auraluxe - Premium Music Streaming",
  description: "Experience music like never before with immersive 3D visuals and premium sound quality",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <AudioProvider>
            {children}
            <Toaster />
          </AudioProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
