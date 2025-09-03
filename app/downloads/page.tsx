"use client"

import { MainLayout } from "@/components/main-layout"
import { Card, CardContent } from "@/components/ui/card"

export default function DownloadsPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white mb-6">Downloads</h1>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-gray-300">Downloads are device-specific and offline-only. Feature coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}


