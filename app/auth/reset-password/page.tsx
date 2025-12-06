"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // If no token, show error immediately
  useEffect(() => {
    if (!token) {
      setStatus("error")
      setErrorMessage("Invalid or missing reset token.")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setStatus("error")
      setErrorMessage("Passwords do not match")
      return
    }
    if (formData.password.length < 8) {
      setStatus("error")
      setErrorMessage("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)
    setStatus("idle")
    setErrorMessage("")

    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: formData.password }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password")
      }

      setStatus("success")
    } catch (err: any) {
      setStatus("error")
      setErrorMessage(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Password Reset Complete</h3>
          <p className="text-sm text-muted-foreground">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
        </div>
        <Button asChild className="w-full mt-4">
          <Link href="/auth/sign-in">Sign In Now</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === "error" && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}

      {!token && (
        <Button asChild variant="outline" className="w-full">
          <Link href="/auth/sign-in">Return to Sign In</Link>
        </Button>
      )}

      {token && (
        <>
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </>
      )}
    </form>
  )
}

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/auth/sign-in" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <CardTitle>Set New Password</CardTitle>
          </div>
          <CardDescription>Create a strong password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
