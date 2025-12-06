"use client"

import { useEffect, type ReactNode, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"
import { toast } from "@/hooks/use-toast"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: "manager" | "contractor" | "vendor"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      const target = requiredRole === "vendor" ? "/vendor/sign-in" : requiredRole === "contractor" ? "/contractor/sign-in" : "/auth/sign-in"
      router.replace(target)
    } else if (!isLoading && requiredRole && user?.role && user.role !== requiredRole) {
      const correct = user.role === "vendor" ? "/vendor/portal" : user.role === "contractor" ? "/contractor/dashboard" : "/manager/dashboard"
      router.replace(correct)
    }
  }, [user, isLoading, requiredRole, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (requiredRole && user?.role !== requiredRole) {
    const msg = "Redirecting to your dashboard..."
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <p className="text-muted-foreground">{msg}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    const msg = "Redirecting to sign in..."
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <p className="text-muted-foreground">{msg}</p>
        </div>
      </div>
    )
  }

  if (user && user.role && requiredRole && user.role === requiredRole && (user as any).isVerified === false) {
    const handleResend = async () => {
      try {
        setResending(true)
        const res = await fetch("/api/auth/verification/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: user.email }) })
        if (res.ok) {
          toast({ title: "Verification email sent", description: "Check your inbox to complete verification" })
        } else {
          const e = await res.json().catch(() => ({}))
          toast({ title: "Please wait before resending", description: String(e?.error || "Try again later"), variant: "destructive" as any })
        }
      } catch {
        toast({ title: "Failed to resend", description: "Try again later", variant: "destructive" as any })
      } finally {
        setResending(false)
      }
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-foreground font-semibold">Email verification required</p>
          <p className="text-muted-foreground">We sent a verification link to {user.email}. Complete verification to access your dashboard.</p>
          <button onClick={handleResend} disabled={resending} className="inline-flex items-center px-4 py-2 rounded bg-primary text-white disabled:opacity-50">
            {resending ? "Sending..." : "Resend verification email"}
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
