"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function VerifyPage() {
  const router = useRouter()
  const [status, setStatus] = useState<{ ok?: boolean; error?: string } | null>(null)

  useEffect(() => {
    const token = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") || "" : ""
    if (!token) {
      setStatus({ error: "Missing verification token" })
      return
    }
    ;(async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
        if (res.ok) {
          setStatus({ ok: true })
        } else {
          const e = await res.json().catch(() => ({}))
          setStatus({ error: String(e?.error || "Verification failed") })
        }
      } catch {
        setStatus({ error: "Verification failed" })
      }
    })()
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status == null && <p className="text-muted-foreground">Verifying...</p>}
          {status?.ok && (
            <div className="space-y-3">
              <p className="text-foreground">Your email has been verified successfully.</p>
              <Button onClick={() => router.push("/auth/sign-in")} className="bg-primary hover:bg-primary/90">Continue to Sign In</Button>
            </div>
          )}
          {status?.error && (
            <div className="space-y-3">
              <p className="text-destructive">{status.error}</p>
              <Button onClick={() => router.push("/auth/sign-in")} variant="outline" className="bg-transparent">Go to Sign In</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
