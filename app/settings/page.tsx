"use client"

import { MainLayout } from "@/components/main-layout"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

export default function SettingsPage() {
  const { user, updatePreferences } = useAuth()
  const [autoplay, setAutoplay] = useState<boolean>(!!user?.preferences?.autoplay)
  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white mb-6">Settings</h1>
        {user ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Autoplay</p>
                  <p className="text-gray-400 text-sm">Continue playing similar tracks automatically</p>
                </div>
                <Switch
                  checked={autoplay}
                  onCheckedChange={(val) => {
                    setAutoplay(val)
                    updatePreferences({ autoplay: val })
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-gray-300 flex items-center justify-between">
              <p>Please sign in to manage settings.</p>
              <Button>Sign in</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}


