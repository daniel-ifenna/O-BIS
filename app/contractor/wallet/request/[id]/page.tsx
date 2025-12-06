"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Upload, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function RequestPayment({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [notes, setNotes] = useState("")
  const { user } = useAuth()

  const milestone = {
    id: params.id,
    project: "Office Building Renovation",
    name: "M2: Framing & Structural Work",
    amount: "$35,500",
    weight: 30,
    progress: 75,
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setProofFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!proofFile) {
      alert("Please upload proof of delivery")
      return
    }
    if (!user) {
      router.push("/auth/sign-in")
      return
    }
    router.push("/contractor/wallet?status=submitted")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/contractor/wallet">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Request Payment</h1>
            <p className="text-sm text-muted-foreground">{milestone.project}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Milestone Info */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader>
            <CardTitle>{milestone.name}</CardTitle>
            <CardDescription>{milestone.project}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Payment Amount</p>
                <p className="text-2xl font-bold text-primary">{milestone.amount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="text-2xl font-bold">{milestone.weight}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Progress</p>
                <p className="text-2xl font-bold">{milestone.progress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Request Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Proof of Delivery */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Proof of Completion</CardTitle>
              <CardDescription>Upload documentation proving milestone completion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {proofFile ? (
                <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <span className="text-sm font-medium">{proofFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setProofFile(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="proof-file"
                    accept=".pdf,.doc,.docx,.zip"
                    required
                  />
                  <label htmlFor="proof-file" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Click to upload proof documents</p>
                    <p className="text-xs text-muted-foreground">
                      Inspection reports, certificates, photos (PDF, DOC, ZIP up to 50MB)
                    </p>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>Optional message to the project manager</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="E.g., 'All work completed as per specifications. Quality inspection passed. Ready for next phase.'"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-24"
                />
              </div>
            </CardContent>
          </Card>

          {/* Terms */}
          <Card className="bg-accent/10 border border-accent/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-foreground mb-2">Before Submitting</p>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• Ensure all milestone work is 100% complete</li>
                    <li>• Include all required proof documents</li>
                    <li>• Attach inspection reports and photos</li>
                    <li>• The manager has 5 business days to review</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-4">
            <Link href="/contractor/wallet" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={!proofFile}>
              Submit Payment Request
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
