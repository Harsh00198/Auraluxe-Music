"use client"

import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth-modal"
import { MainLayout } from "@/components/main-layout"
import { HomePage } from "@/components/home-page"

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Auraluxe...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthModal />
  }

  return (
    <MainLayout>
      <HomePage />
    </MainLayout>
  )
}
