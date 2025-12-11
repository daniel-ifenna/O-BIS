"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, ChevronLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function ContractorPaymentRequestPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [balance, setBalance] = useState<number | null>(null)
  const [formError, setFormError] = useState("")
  const [form, setForm] = useState({ projectId: "", amount: "", bankName: "", branch: "", accountType: "", accountNumber: "" })
  const [proof, setProof] = useState<File | null>(null)

  useEffect(() => {
    const run = async () => {
      if (!user?.id) return
      const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || localStorage.getItem("contractorToken") || "")) || ""
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`/api/wallet/${user.id}`, { headers })
      if (res.ok) {
        const data = await res.json()
        setBalance(Number(data.balance || 0))
      }
    }
    run().catch(() => {})
  }, [user?.id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    if (!form.projectId || !form.amount || !form.bankName || !form.branch || !form.accountType || !form.accountNumber || !proof) {
      setFormError("All fields and proof of delivery are required")
      return
    }
    const fd = new FormData()
    fd.append("projectId", form.projectId)
    fd.append("amount", form.amount)
    fd.append("bankName", form.bankName)
    fd.append("branch", form.branch)
    fd.append("accountType", form.accountType)
    fd.append("accountNumber", form.accountNumber)
    fd.append("proof", proof)
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || localStorage.getItem("contractorToken") || "")) || ""
    try {
      const res = await fetch("/api/contractor/payments/requests", { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd })
      if (res.ok) {
        router.push("/contractor/dashboard")
      } else {
        const err = await res.json().catch(() => ({}))
        setFormError(err?.error || "Failed to submit request")
      }
    } catch {
      setFormError("Network error")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/contractor/dashboard">
            <Button variant="ghost" size="icon"><ChevronLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payment Request</h1>
            <p className="text-sm text-muted-foreground">Submit proof and settlement details</p>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-card/60 border-border/50 mb-6">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Escrow Wallet</p>
            <p className="text-2xl font-bold text-primary">{balance == null ? "Loading..." : new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(balance)}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/50">
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>All fields are required</CardDescription>
          </CardHeader>
          <CardContent>
            {formError && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4 flex gap-2">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{formError}</p>
              </div>
            )}
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Project ID</Label>
                  <Input value={form.projectId} onChange={(e) => setForm((p) => ({ ...p, projectId: e.target.value }))} />
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
                </div>
                <div>
                  <Label>Bank Name</Label>
                  <Input value={form.bankName} onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))} />
                </div>
                <div>
                  <Label>Branch</Label>
                  <Input value={form.branch} onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))} />
                </div>
                <div>
                  <Label>Account Type</Label>
                  <Input value={form.accountType} onChange={(e) => setForm((p) => ({ ...p, accountType: e.target.value }))} />
                </div>
                <div>
                  <Label>Account Number</Label>
                  <Input value={form.accountNumber} onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Proof of Delivery</Label>
                <Input type="file" onChange={(e) => setProof(e.target.files?.[0] || null)} />
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90">Submit Request</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

