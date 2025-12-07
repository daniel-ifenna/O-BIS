"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Loader2, CheckCircle } from "lucide-react"

export default function VendorSignup() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    businessReg: "",
    contact: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    categories: "",
    certifications: "",
    bio: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      if (!formData.companyName || !formData.email || !formData.phone || !formData.password) {
        setError("Please fill in all required fields")
        return
      }
      setStep(2)
    } else {
      setIsLoading(true)
      try {
        const res = await fetch("/api/auth/vendor-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Failed to register" }))
          throw new Error(data.error || "Failed to register")
        }
        setSuccess(true)
        setError("")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to register. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 border-border/50">
          <CardHeader className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">Welcome to O-BIS!</CardTitle>
            <CardDescription>Your vendor account has been created successfully</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
              <p className="text-green-900 mb-2">
                <strong>Next Steps:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-green-800">
                <li>Check your email for confirmation</li>
                <li>Complete your vendor profile</li>
                <li>Start submitting quotes on procurement opportunities</li>
              </ul>
            </div>
            <Link href="/public-procurement" className="w-full">
              <Button className="w-full bg-accent hover:bg-accent/90">Browse Procurement Requests</Button>
            </Link>
            <Link href="/auth/sign-in" className="w-full">
              <Button variant="outline" className="w-full bg-transparent">
                Sign In to Your Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <img src={process.env.NEXT_PUBLIC_LOGO_URL || "/icon.svg.png"} alt="O-BIS" className="w-8 h-8 rounded-lg object-contain" />
            <CardTitle>O-BIS</CardTitle>
          </div>
          <CardTitle>Become a Vendor</CardTitle>
          <CardDescription>Step {step} of 2 - Create your vendor account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="Your company name"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessReg">Business Registration Number</Label>
                  <Input
                    id="businessReg"
                    name="businessReg"
                    placeholder="e.g., RC123456"
                    value={formData.businessReg}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Person Name *</Label>
                  <Input
                    id="contact"
                    name="contact"
                    placeholder="Full name"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="company@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+234 XXX XXX XXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Street address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="e.g., Lagos"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      placeholder="e.g., Lagos"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categories">What do you supply? (Comma-separated)</Label>
                  <Input
                    id="categories"
                    name="categories"
                    placeholder="e.g., Steel, Cement, Aggregates"
                    value={formData.categories}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications & Licenses</Label>
                  <Input
                    id="certifications"
                    name="certifications"
                    placeholder="e.g., ISO 9001, API certification"
                    value={formData.certifications}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">About Your Business</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Brief description of your company and experience"
                    value={formData.bio}
                    onChange={handleChange}
                    className="min-h-24"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {step === 2 && (
                <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => setStep(1)}>
                  Back
                </Button>
              )}
              <Button type="submit" disabled={isLoading} className="flex-1 bg-accent hover:bg-accent/90">
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {step === 1 ? "Continue" : "Create Account"}
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/sign-in" className="text-accent hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
