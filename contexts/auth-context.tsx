"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  username: string
  email: string
  role: "user" | "admin" | "moderator"
  avatar?: string
  profile?: {
    firstName?: string
    lastName?: string
    bio?: string
    location?: string
    website?: string
    birthDate?: string
  }
  preferences: {
    theme: string
    volume: number
    autoplay: boolean
    notifications: {
      email: boolean
      push: boolean
    }
  }
  likedTracks: any[]
  recentlyPlayed: any[]
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
  logout: () => void
  updateProfile: (profile: Partial<User["profile"]>) => Promise<boolean>
  updatePreferences: (preferences: Partial<User["preferences"]>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  isAdmin: boolean
  isModerator: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const isAdmin = user?.role === "admin"
  const isModerator = user?.role === "moderator" || user?.role === "admin"

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("auraluxe_token")
      console.log("Auth Token:", token)
      console.log("API_BASE_URL:", API_BASE_URL)

      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // *** FIX APPLIED HERE ***
        // If the token is expired or invalid (status 401), log the user out.
        if (response.status === 401) {
          localStorage.removeItem("auraluxe_token")
          setUser(null)
        }
        const errorText = await response.text()
        console.error("Auth check failed:", response.status, errorText)
        localStorage.removeItem("auraluxe_token")
      }
    } catch (error: any) {
      console.error("Network error in checkAuth:", error.message || error)
      localStorage.removeItem("auraluxe_token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("auraluxe_token", data.token)
        setUser(data.user)
        toast({
          title: "Welcome back!",
          description: `Logged in as ${data.user.username}`,
        })
        return true
      } else {
        toast({
          title: "Login failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("auraluxe_token", data.token)
        setUser(data.user)
        toast({
          title: "Welcome to Auraluxe!",
          description: `Account created for ${data.user.username}`,
        })
        return true
      } else {
        toast({
          title: "Registration failed",
          description: data.error || "Failed to create account",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    // Note: Ensure you have created the `/auth/forgot-password` endpoint in your backend server.
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Reset link sent",
          description: "Check your email for instructions to reset your password.",
        })
        return true
      } else {
        toast({
          title: "Reset failed",
          description: data.error || "Unable to send reset email.",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Reset password error:", error)
      toast({
        title: "Reset failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const updateProfile = async (profile: Partial<User["profile"]>): Promise<boolean> => {
    try {
      const token = localStorage.getItem("auraluxe_token")
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
        return true
      } else {
        const data = await response.json()
        toast({
          title: "Update failed",
          description: data.error || "Failed to update profile",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Update failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("auraluxe_token")
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (response.ok) {
        toast({
          title: "Password changed",
          description: "Your password has been updated successfully.",
        })
        return true
      } else {
        const data = await response.json()
        toast({
          title: "Change failed",
          description: data.error || "Failed to change password",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Password change error:", error)
      toast({
        title: "Change failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("auraluxe_token")
    setUser(null)
    toast({
      title: "Logged out",
      description: "See you next time!",
    })
  }

  const updatePreferences = async (preferences: Partial<User["preferences"]>) => {
    try {
      const token = localStorage.getItem("auraluxe_token")
      const response = await fetch(`${API_BASE_URL}/auth/preferences`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Update preferences error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        resetPassword,
        logout,
        updateProfile,
        updatePreferences,
        changePassword,
        isAdmin,
        isModerator,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}