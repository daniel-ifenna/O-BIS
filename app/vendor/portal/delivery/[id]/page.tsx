"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Upload, CheckCircle } from "lucide-react"

export default function MarkDelivery({ params }: { params: { id: string } }) {
  const router = useRouter()

  const contract = {
    id: params.id,
    item: "Concrete Mix C30",
    project: "Office Building Renovation",
    quantity: 100,
    unit: "cubic meters",
    price: "$11,500",
    deliveryLocation: "Downtown Site",
    deliveryToken: "TOKEN_CONCRETE_001",
  }

  const [formData, setFormData] = useState({
    actualDeliveryDate: new Date().toISOString().split("T")[0],
    deliveryNotes: "",
    driverName: "",
    vehicleNumber: "",
    // Bank Details
    bankName: "",
    branch: "",
    accountType: "current",
    accountNumber: "",
  })

  const [proofFiles, setProofFiles] = useState<File[]>([])
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch contract details
    fetch(`/api/procurements/public/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
           setContract({
             id: data.id,
             projectId: data.projectId,
             item: data.item,
             project: `Project ${data.projectId}`, // ideally fetch project title too but ID is enough for logic
             quantity: data.quantity,
             unit: data.unit,
             price: "Check Quote", // we don't have quote price here easily unless we fetch quotes
             deliveryLocation: data.deliveryLocation,
             deliveryToken: `TOKEN-${data.id.slice(0,8)}`
           })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      // Only 1 proof file allowed by backend currently for simplicity in this turn
      if (newFiles.length > 0) {
        setProofFiles([newFiles[0]]) 
      }
    }
  }

  const removeFile = (index: number) => {
    setProofFiles([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract) return
    
    // Prepare FormData
    const fd = new FormData()
    fd.append("projectId", contract.projectId)
    // We need amount. Let's ask user to confirm amount or fetch it.
    // For now, I'll add an Amount field to the form since we don't have the quote price handy.
    fd.append("amount", formData.amount) 
    fd.append("bankName", formData.bankName)
    fd.append("branch", formData.branch)
    fd.append("accountType", formData.accountType)
    fd.append("accountNumber", formData.accountNumber)
    if (proofFiles.length > 0) {
      fd.append("proof", proofFiles[0])
    }
    
    // Add delivery details to metadata or notes? Backend doesn't support generic metadata in PaymentRequest yet.
    // We will append to bank branch or something? No, that's bad.
    // We will ignore driver details for the PaymentRequest but maybe send them in a separate API call later?
    // For now, the user wants to "Request Payment".
    
    const token = localStorage.getItem("token") || ""
    try {
      const res = await fetch("/api/vendor/payments/requests", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // Content-Type auto-set for FormData
        body: fd
      })
      if (res.ok) {
        router.push("/vendor/portal?tab=delivered")
      } else {
        const err = await res.json()
        alert("Failed: " + (err.error || "Unknown error"))
      }
    } catch (e) {
      alert("Network error")
    }
  }

  if (loading) return <div className="p-8 text-center">Loading contract details...</div>
  if (!contract) return <div className="p-8 text-center">Contract not found</div>

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/vendor/portal">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Request Payment</h1>
            <p className="text-sm text-muted-foreground">{contract.item}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Contract Summary */}
        <Card className="bg-card/60 border-border/50 mb-8">
          <CardHeader>
            <CardTitle>{contract.item}</CardTitle>
            <CardDescription>{contract.project}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-semibold">
                  {contract.quantity} {contract.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Location</p>
                <p className="font-semibold text-sm">{contract.deliveryLocation}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Token</p>
                <p className="font-mono text-xs">{contract.deliveryToken}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Information */}
           <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <Label htmlFor="amount">Invoice Amount (NGN) *</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="e.g. 500000"
                    onChange={handleChange}
                    required
                  />
               </div>
            </CardContent>
           </Card>

          {/* Delivery Information */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Actual Delivery Date *</Label>
                  <Input
                    id="deliveryDate"
                    name="actualDeliveryDate"
                    type="date"
                    value={formData.actualDeliveryDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driverName">Driver Name *</Label>
                  <Input
                    id="driverName"
                    name="driverName"
                    placeholder="Full name of delivery driver"
                    value={formData.driverName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleNumber">Vehicle Number / License Plate *</Label>
                <Input
                  id="vehicleNumber"
                  name="vehicleNumber"
                  placeholder="e.g., ABC-1234"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="deliveryNotes"
                  placeholder="Any special notes about the delivery..."
                  value={formData.deliveryNotes}
                  onChange={handleChange}
                  className="min-h-20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
              <CardDescription>Where should we send the payment?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    name="bankName"
                    placeholder="e.g. GTBank"
                    value={formData.bankName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch (Optional)</Label>
                  <Input
                    id="branch"
                    name="branch"
                    placeholder="e.g. Lagos Main"
                    value={formData.branch}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <select
                    id="accountType"
                    name="accountType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.accountType}
                    onChange={handleChange}
                  >
                    <option value="current">Current</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    name="accountNumber"
                    placeholder="0123456789"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proof of Delivery */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Proof of Delivery</CardTitle>
              <CardDescription>Upload delivery receipts, invoices, or photos (Required)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="proof-files"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label htmlFor="proof-files" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload proof document</p>
                  <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 1 file)</p>
                </label>
              </div>

              {proofFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Uploaded File:</p>
                  <div className="space-y-2">
                    {proofFiles.map((file, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                        <span className="text-sm truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-muted-foreground hover:text-foreground text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-4">
            <Link href="/vendor/portal" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={proofFiles.length === 0}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Request Payment
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
