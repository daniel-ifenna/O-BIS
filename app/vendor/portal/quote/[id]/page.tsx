"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Upload, X } from "lucide-react"
import { useProcurements } from "@/lib/procurement-context"

export default function SubmitQuote({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { getProcurement, addQuote } = useProcurements()
  const request = getProcurement(params.id)

  const [formData, setFormData] = useState({
    vendorName: "",
    email: "",
    pricePerUnit: "",
    totalPrice: "",
    deliveryDays: "",
    terms: "",
  })

  const [quoteFile, setQuoteFile] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "pricePerUnit" && formData.totalPrice === "" && request) {
      const total = (Number.parseFloat(value) * request.quantity).toFixed(2)
      setFormData((prev) => ({
        ...prev,
        totalPrice: total,
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setQuoteFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setQuoteFile(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!request) return
    addQuote(request.id, {
      id: `quote-${Date.now()}`,
      procurementRequestId: request.id,
      vendorId: `v-${Date.now()}`,
      vendorName: formData.vendorName,
      vendorEmail: formData.email,
      pricePerUnit: formData.pricePerUnit,
      totalPrice: formData.totalPrice || (Number.parseFloat(formData.pricePerUnit) * request.quantity).toFixed(2),
      deliveryDays: Number.parseInt(formData.deliveryDays),
      deliveryDate: new Date().toISOString().slice(0, 10),
      submittedAt: new Date().toISOString(),
      status: "pending",
      notes: formData.terms,
    })
    router.push(`/public-procurement/${request.id}`)
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
            <h1 className="text-2xl font-bold text-foreground">Submit Quotation</h1>
            <p className="text-sm text-muted-foreground">{request?.item}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Request Summary */}
        <Card className="bg-card/60 border-border/50 mb-8">
            <CardHeader>
              <CardTitle>{request?.item}</CardTitle>
              <CardDescription>{request?.projectId}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-semibold">
                  {request?.quantity} {request?.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Specification</p>
                <p className="font-semibold text-sm">{request?.specification}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold text-sm">{request?.deliveryLocation}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posted</p>
                <p className="font-semibold text-sm">{request?.createdAt}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vendor Information */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendorName">Vendor Name *</Label>
                  <Input
                    id="vendorName"
                    name="vendorName"
                    placeholder="Your vendor name"
                    value={formData.vendorName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="vendor@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Pricing & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerUnit">Price Per Unit *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">$</span>
                    <Input
                      id="pricePerUnit"
                      name="pricePerUnit"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.pricePerUnit}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalPrice">Total Price (Auto-calculated)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">$</span>
                    <Input
                      id="totalPrice"
                      name="totalPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.totalPrice}
                      onChange={handleChange}
                      className="bg-muted"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryDays">Delivery Time (Days) *</Label>
                  <Input
                    id="deliveryDays"
                    name="deliveryDays"
                    type="number"
                    placeholder="3"
                    value={formData.deliveryDays}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="terms">Payment & Delivery Terms (Optional)</Label>
                <Textarea
                  id="terms"
                  name="terms"
                  placeholder="e.g., 50% upfront, 50% on delivery. Delivery by March 15, 2025."
                  value={formData.terms}
                  onChange={handleChange}
                  className="min-h-20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quotation Document */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Quotation Document</CardTitle>
              <CardDescription>Upload your detailed quotation (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quoteFile ? (
                <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <span className="text-sm font-medium truncate">{quoteFile.name}</span>
                  <button type="button" onClick={removeFile} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="quote-file"
                    accept=".pdf,.doc,.docx"
                  />
                  <label htmlFor="quote-file" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload</p>
                    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX</p>
                  </label>
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
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              Submit Quotation
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
