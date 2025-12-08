"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

export interface User {
  id: string
  name: string
  email: string
  role: "manager" | "contractor" | "vendor"
  company?: string
  isVerified?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signUp: (data: {
    name: string
    email: string
    password: string
    role: "manager" | "contractor" | "vendor"
    company?: string
  }) => Promise<void>
  signIn: (email: string, password: string, expectedRole?: string) => Promise<{ success: boolean; error?: string }>
  signInWithRole: (email: string, password: string, role: "manager" | "contractor" | "vendor" | "admin") => Promise<void>
  signOut: () => void
  login: (email: string, password: string, role?: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user")
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        // Basic optimistic set
        setUser(parsedUser)
        
        // Background verify
        fetch(`/api/auth/exists?email=${encodeURIComponent(parsedUser.email)}`)
          .then(async (res) => {
            if (!res.ok) throw new Error("verify failed")
            const data = await res.json()
            if (data?.exists && data.user?.email === parsedUser.email) {
              setUser(data.user)
              try { document.cookie = `auth_role=${data.user.role}; Path=/; SameSite=Lax` } catch {}
            } else {
              localStorage.removeItem("auth_user")
              setUser(null)
            }
          })
          .catch(() => {
            // If verify fails (network), keep local state or logout? 
            // Better to keep local state for offline support, but for strict security we might logout.
            // For now, assume session is valid until 401 elsewhere.
          })
      } catch (error) {
        localStorage.removeItem("auth_user")
      }
    }
    setIsLoading(false)
  }, [])

  const signUp = async (data: {
    name: string
    email: string
    password: string
    role: "manager" | "contractor" | "vendor"
    company?: string
  }) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        let errorMessage = "Sign up failed"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {}
        throw new Error(errorMessage)
      }

      const userData = await response.json()

      setUser(userData)
      localStorage.setItem("auth_user", JSON.stringify(userData))
      if ((userData as any)?.token) {
        try { localStorage.setItem("auth_token", String((userData as any).token)) } catch {}
      }
      try { document.cookie = `auth_role=${userData.role}; Path=/; SameSite=Lax` } catch {}
      const next = userData.role === "vendor" ? "/vendor/portal" : userData.role === "contractor" ? "/contractor/dashboard" : "/manager/dashboard"
      router.push(next)
    } catch (err) {
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string, role?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        let errorMessage = "Sign in failed"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {}
        return { success: false, error: errorMessage }
      }

      const userData = await response.json()
      
      if (role && userData.role !== role) {
        return { success: false, error: `Unauthorized. Account is not an ${role}.` }
      }

      setUser(userData)
      localStorage.setItem("auth_user", JSON.stringify(userData))
      if ((userData as any)?.token) {
        try { localStorage.setItem("auth_token", String((userData as any).token)) } catch {}
      }
      try {
        document.cookie = `auth_role=${userData.role}; Path=/; SameSite=Lax`
      } catch {}
      
      // We don't auto redirect in this function, caller handles it
      return { success: true }
    } catch (err) {
      return { success: false, error: "Network error" }
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const res = await login(email, password)
    if (!res.success) throw new Error(res.error)
    // Auto redirect
    if (user) {
        const next = user.role === "vendor" ? "/vendor/portal" : user.role === "contractor" ? "/contractor/dashboard" : user.role === "admin" ? "/admin/dashboard" : "/manager/dashboard"
        router.push(next)
    }
    // Note: user state update is async, so `user` might be null here if we just called login.
    // Better to rely on login return if we want to redirect immediately, or let useEffect handle it.
    // But for compatibility with existing code:
    const saved = localStorage.getItem("auth_user")
    if (saved) {
        const u = JSON.parse(saved)
        const next = u.role === "vendor" ? "/vendor/portal" : u.role === "contractor" ? "/contractor/dashboard" : u.role === "admin" ? "/admin/dashboard" : "/manager/dashboard"
        router.push(next)
    }
    return // void
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("auth_user")
    localStorage.removeItem("auth_token")
    try {
      document.cookie = "auth_role=; Path=/; Max-Age=0; SameSite=Lax"
    } catch {}
    router.push("/")
  }

  const signInWithRole = async (email: string, password: string, role: "manager" | "contractor" | "vendor" | "admin") => {
     await signIn(email, password)
  }

  return <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signInWithRole, signOut, login }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
