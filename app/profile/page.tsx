"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Globe, 
  Lock, 
  Settings,
  Music,
  Heart,
  Clock,
  Shield
} from "lucide-react"

export default function ProfilePage() {
  const { user, updateProfile, updatePreferences, changePassword } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: user?.profile?.firstName || "",
    lastName: user?.profile?.lastName || "",
    bio: user?.profile?.bio || "",
    location: user?.profile?.location || "",
    website: user?.profile?.website || "",
    birthDate: user?.profile?.birthDate || "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleProfileSave = async () => {
    const success = await updateProfile(profileData)
    if (success) {
      setIsEditing(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match")
      return
    }
    
    const success = await changePassword(passwordData.currentPassword, passwordData.newPassword)
    if (success) {
      setIsChangingPassword(false)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    }
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-gray-300 flex items-center justify-between">
              <p>Please sign in to view your profile.</p>
              <Button>Sign in</Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              <Shield className="w-4 h-4 mr-2" />
              {user.role}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white/20">
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-white/20">
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-white/20">
              Preferences
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-white/20">
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Personal Information</CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-400">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      disabled={!isEditing}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-400">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      disabled={!isEditing}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-400">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!isEditing}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-gray-400">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      disabled={!isEditing}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-gray-400">Website</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                      disabled={!isEditing}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                {isEditing && (
                  <Button onClick={handleProfileSave} className="w-full">
                    Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Change Password</CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                  >
                    {isChangingPassword ? "Cancel" : "Change Password"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isChangingPassword ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-gray-400">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-gray-400">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-400">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <Button onClick={handlePasswordChange} className="w-full">
                      Update Password
                    </Button>
                  </>
                ) : (
                  <p className="text-gray-400">Click "Change Password" to update your password.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">App Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-gray-400 text-sm">Receive email updates about your account</p>
                  </div>
                  <Switch
                    checked={user.preferences?.notifications?.email}
                    onCheckedChange={(checked) => 
                      updatePreferences({ 
                        notifications: { 
                          ...user.preferences?.notifications, 
                          email: checked 
                        } 
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Push Notifications</p>
                    <p className="text-gray-400 text-sm">Receive push notifications in your browser</p>
                  </div>
                  <Switch
                    checked={user.preferences?.notifications?.push}
                    onCheckedChange={(checked) => 
                      updatePreferences({ 
                        notifications: { 
                          ...user.preferences?.notifications, 
                          push: checked 
                        } 
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Autoplay</p>
                    <p className="text-gray-400 text-sm">Automatically play similar tracks</p>
                  </div>
                  <Switch
                    checked={user.preferences?.autoplay}
                    onCheckedChange={(checked) => updatePreferences({ autoplay: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Heart className="w-8 h-8 text-red-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{user.likedTracks?.length || 0}</p>
                      <p className="text-gray-400 text-sm">Liked Songs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{user.recentlyPlayed?.length || 0}</p>
                      <p className="text-gray-400 text-sm">Recently Played</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Music className="w-8 h-8 text-purple-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">0</p>
                      <p className="text-gray-400 text-sm">Playlists</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}


