"use client"

import { Suspense } from "react"
import { MainLayout } from "@/components/main-layout"
import { AllMusicSection } from "@/components/all-music-section"
import { useSearchParams } from "next/navigation"

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white mb-6">
          {query ? `Search Results for "${query}"` : "Search"}
        </h1>
        <AllMusicSection initialQuery={query || ""} />
      </div>
    </MainLayout>
  )
}

export default function SearchPage() {
  return (
    <Suspense 
      fallback={
        <MainLayout>
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-white mb-6">Search</h1>
            <div className="text-gray-400">Loading...</div>
          </div>
        </MainLayout>
      }
    >
      <SearchContent />
    </Suspense>
  )
}


