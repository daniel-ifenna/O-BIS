"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Loader2 } from "lucide-react"

export default function SignUp() {
  const [role, setRole] = useState<"manager" | "vendor" | "contractor">("manager")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
  })
  const [error, setError] = useState("")
  const { signUp, isLoading } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signUp({
        ...formData,
        role,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <img src={process.env.NEXT_PUBLIC_LOGO_URL || "/icon.sg.png"} alt="O-BIS" className="w-8 h-8 rounded-lg object-contain" />
            <CardTitle>O-BIS</CardTitle>
          </div>
          <CardDescription>Create your account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Tabs
              value={role}
              onValueChange={(value) => setRole(value as "manager" | "vendor" | "contractor")}
              className="w-full"
            >
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manager">Manager</TabsTrigger>
                <TabsTrigger value="vendor">Vendor</TabsTrigger>
              </TabsList>

              {(["manager", "vendor"] as const).map((userRole) => (
                <TabsContent key={userRole} value={userRole} className="space-y-4">
                  {userRole === "vendor" ? (
                    <div className="space-y-4 py-4">
                      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-sm text-accent-foreground">
                        <p className="font-medium mb-2">Vendor Registration</p>
                        <p>
                          To ensure quality and compliance, vendors must provide business registration details and verification documents.
                        </p>
                      </div>
                      <Link href="/auth/vendor-signup" className="block">
                        <Button type="button" className="w-full bg-accent hover:bg-accent/90">
                          Go to Vendor Registration Portal
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                        />
                      </div>

                      {userRole === "manager" && (
                        <div className="space-y-2">
                          <Label htmlFor="company">Company Name</Label>
                          <Input
                            id="company"
                            name="company"
                            placeholder="Your Company"
                            value={formData.company}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      
                      <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 mt-6">
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isLoading ? "Creating account..." : "Create Account"}
                      </Button>
                    </>
                  )}
                </TabsContent>
              ))}
            </Tabs>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/sign-in" className="text-primary hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
