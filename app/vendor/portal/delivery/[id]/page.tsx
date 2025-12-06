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
  })

  const [proofFiles, setProofFiles] = useState<File[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      if (proofFiles.length + newFiles.length <= 5) {
        setProofFiles((prev) => [...prev, ...newFiles])
      } else {
        alert("Maximum 5 proof documents allowed")
      }
    }
  }

  const removeFile = (index: number) => {
    setProofFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Mark delivery:", { formData, proofFiles })
    router.push("/vendor/portal?tab=delivered")
  }

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
            <h1 className="text-2xl font-bold text-foreground">Confirm Delivery</h1>
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
                <p className="text-sm text-muted-foreground">Contract Value</p>
                <p className="font-semibold text-primary">{contract.price}</p>
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
                  multiple
                />
                <label htmlFor="proof-files" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload proof documents</p>
                  <p className="text-xs text-muted-foreground">PDF, JPG, PNG, DOC (up to 5 files)</p>
                </label>
              </div>

              {proofFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Uploaded Files ({proofFiles.length}/5):</p>
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

          {/* Important Notice */}
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Confirm Delivery Details</p>
                  <p className="text-sm text-muted-foreground">
                    Once submitted, the project manager will review your delivery proof and confirm payment. Please
                    ensure all information is accurate.
                  </p>
                </div>
              </div>
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
              Confirm Delivery
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
