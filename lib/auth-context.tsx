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
  signIn: (email: string, password: string) => Promise<void>
  signInWithRole: (email: string, password: string, role: "manager" | "contractor" | "vendor") => Promise<void>
  signOut: () => void
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
        fetch(`/api/auth/exists?email=${encodeURIComponent(parsedUser.email)}`)
          .then(async (res) => {
            if (!res.ok) throw new Error("verify failed")
            const data = await res.json()
            if (data?.exists && data.user?.email === parsedUser.email) {
              setUser(data.user)
              try { document.cookie = `auth_role=${data.user.role}; Path=/; SameSite=Lax` } catch {}
              console.log("[v0] User verified via Prisma:", parsedUser.email)
            } else {
              localStorage.removeItem("auth_user")
            }
          })
          .catch(() => {
            localStorage.removeItem("auth_user")
          })
      } catch (error) {
        console.error("[v0] Failed to parse saved user:", error)
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
      console.log("[v0] Signing up user:", data.email)
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
        } catch (e) {
          errorMessage = `Sign up failed: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      let userData
      try {
        userData = await response.json()
      } catch (e) {
        throw new Error("Invalid server response")
      }

      setUser(userData)
      localStorage.setItem("auth_user", JSON.stringify(userData))
      if ((userData as any)?.token) {
        try { localStorage.setItem("auth_token", String((userData as any).token)) } catch {}
      }
      try { document.cookie = `auth_role=${userData.role}; Path=/; SameSite=Lax` } catch {}
      const next = userData.role === "vendor" ? "/vendor/portal" : userData.role === "contractor" ? "/contractor/dashboard" : "/manager/dashboard"
      console.log("[v0] Sign up successful, redirecting to:", next)
      router.push(next)
    } catch (err) {
      console.error("[v0] Sign up error:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log("[v0] Signing in user:", email)
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
        } catch (e) {
          errorMessage = `Sign in failed: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      let userData
      try {
        userData = await response.json()
      } catch (e) {
        throw new Error("Invalid server response")
      }

      setUser(userData)
      localStorage.setItem("auth_user", JSON.stringify(userData))
      if ((userData as any)?.token) {
        try { localStorage.setItem("auth_token", String((userData as any).token)) } catch {}
      }
      try {
        document.cookie = `auth_role=${userData.role}; Path=/; SameSite=Lax`
      } catch {}
      const next = userData.role === "vendor" ? "/vendor/portal" : userData.role === "contractor" ? "/contractor/dashboard" : "/manager/dashboard"
      console.log("[v0] Sign in successful, redirecting to:", next)
      router.push(next)
    } catch (err) {
      console.error("[v0] Sign in error:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    console.log("[v0] Signing out user")
    setUser(null)
    localStorage.removeItem("auth_user")
    try {
      document.cookie = "auth_role=; Path=/; Max-Age=0; SameSite=Lax"
    } catch {}
    router.push("/")
  }

  const signInWithRole = async (email: string, password: string, role: "manager" | "contractor" | "vendor") => {
    setIsLoading(true)
    try {
      let endpoint = "/api/auth/signin"
      if (role === "contractor") endpoint = "/api/auth/contractor/signin"
      if (role === "manager") endpoint = "/api/auth/manager/signin"
      if (role === "vendor") endpoint = "/api/auth/vendor/signin"
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })
      if (!response.ok) {
        let msg = "Sign in failed"
        try {
          const e = await response.json()
          msg = e.error || msg
        } catch {}
        throw new Error(msg)
      }
      let payload: any
      try {
        payload = await response.json()
      } catch {
        throw new Error("Invalid server response")
      }
      const userData: User = payload?.user || payload
      if (userData?.role !== role) {
        throw new Error("Account role mismatch for this portal")
      }
      setUser(userData)
      localStorage.setItem("auth_user", JSON.stringify(userData))
      if (payload?.token) {
        try { localStorage.setItem("auth_token", String(payload.token)) } catch {}
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

  return <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signInWithRole, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
