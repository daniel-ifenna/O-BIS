"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Send, User, Calendar, MapPin, Package } from "lucide-react"
import { useProcurements } from "@/lib/procurement-context"

export default function ProcurementDetailPage() {
  const params = useParams()
  const { getProcurement, addQuote, getQuotes } = useProcurements()
  const procurement = getProcurement(params.id as string)

  const [isQuoting, setIsQuoting] = useState(false)
  const [formData, setFormData] = useState({
    vendorName: "",
    vendorEmail: "",
    pricePerUnit: "",
    totalPrice: "",
    deliveryDays: "",
    deliveryDate: "",
    notes: "",
  })
  const [proposalFile, setProposalFile] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const calculateTotal = () => {
    const price = Number.parseFloat(formData.pricePerUnit) || 0
    const total = price * (procurement?.quantity || 0)
    return total.toLocaleString()
  }

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault()
    const submit = async () => {
      if (!procurement) return

      let proposalUrl: string | undefined
      if (proposalFile) {
        const fd = new FormData()
        fd.append("file", proposalFile)
        try {
          const res = await fetch("/api/uploads/quotation", { method: "POST", body: fd })
          if (res.ok) {
            const data = await res.json()
            proposalUrl = data.url
          }
        } catch {}
      }

      const newQuote = {
        id: `quote-${Date.now()}`,
        procurementRequestId: procurement.id,
        vendorId: `vendor-${Date.now()}`,
        vendorName: formData.vendorName,
        vendorEmail: formData.vendorEmail,
        pricePerUnit: formData.pricePerUnit,
        totalPrice: formData.totalPrice || calculateTotal(),
        deliveryDays: Number.parseInt(formData.deliveryDays),
        deliveryDate: formData.deliveryDate,
        submittedAt: new Date().toISOString(),
        status: "pending" as const,
        notes: formData.notes,
        proposalUrl,
      }
      await addQuote(procurement.id, newQuote)

      setFormData({
        vendorName: "",
        vendorEmail: "",
        pricePerUnit: "",
        totalPrice: "",
        deliveryDays: "",
        deliveryDate: "",
        notes: "",
      })
      setProposalFile(null)
      setIsQuoting(false)
    }
    void submit()
  }

  if (!procurement) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-card/60 border-border/50">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Procurement request not found</p>
            <Link href="/public-procurement">
              <Button className="bg-accent hover:bg-accent/90">Back to Opportunities</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const quotes = getQuotes(procurement.id)
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
  const [filterStart, setFilterStart] = useState<string>("")
  const [filterEnd, setFilterEnd] = useState<string>("")
  const inRange = (rd?: string) => {
    if (!rd) return true
    if (filterStart && rd < filterStart) return false
    if (filterEnd && rd > filterEnd) return false
    return true
  }
  const cmp = (a: any, b: any) => {
    const da = a?.recordDate || ""
    const db = b?.recordDate || ""
    if (sortOrder === "desc") return db.localeCompare(da)
    return da.localeCompare(db)
  }
  const sortedQuotes = quotes.filter((q) => inRange(q.recordDate)).sort(cmp)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/public-procurement">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{procurement.item}</h1>
            <p className="text-sm text-muted-foreground">Request ID: {procurement.id}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Details */}
            <Card className="bg-card/60 border-border/50">
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Item</Label>
                    <p className="font-semibold">{procurement.item}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Quantity</Label>
                    <p className="font-semibold">
                      {procurement.quantity} {procurement.unit}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Specification</Label>
                  <p className="text-foreground">{procurement.specification}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Delivery Location</p>
                      <p className="font-semibold">{procurement.deliveryLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Requested By</p>
                      <p className="font-semibold">{procurement.requestedDate}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quote Form */}
            {isQuoting ? (
              <Card className="bg-card/60 border-border/50">
                <CardHeader>
                  <CardTitle>Submit Your Quote</CardTitle>
                  <CardDescription>Provide your pricing and delivery terms</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitQuote} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vendorName">Your Company Name *</Label>
                        <Input
                          id="vendorName"
                          name="vendorName"
                          placeholder="Your company name"
                          value={formData.vendorName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vendorEmail">Email Address *</Label>
                        <Input
                          id="vendorEmail"
                          name="vendorEmail"
                          type="email"
                          placeholder="your@company.com"
                          value={formData.vendorEmail}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="proposalFile">Upload Quotation (PDF/DOC)</Label>
                      <Input
                        id="proposalFile"
                        name="proposalFile"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setProposalFile(e.target.files?.[0] || null)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Attach your detailed quotation document. Accepted formats: PDF, DOC, DOCX.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pricePerUnit">Price Per Unit *</Label>
                        <Input
                          id="pricePerUnit"
                          name="pricePerUnit"
                          placeholder="e.g., 45000"
                          value={formData.pricePerUnit}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalPrice">Total Price (Auto-calculated)</Label>
                        <Input
                          id="totalPrice"
                          name="totalPrice"
                          placeholder={calculateTotal()}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deliveryDays">Delivery Days *</Label>
                        <Input
                          id="deliveryDays"
                          name="deliveryDays"
                          type="number"
                          placeholder="e.g., 3"
                          value={formData.deliveryDays}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deliveryDate">Delivery Date *</Label>
                        <Input
                          id="deliveryDate"
                          name="deliveryDate"
                          type="date"
                          value={formData.deliveryDate}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        placeholder="Any additional information about your quote"
                        value={formData.notes}
                        onChange={handleChange}
                        className="min-h-24"
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => setIsQuoting(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90">
                        <Send className="w-4 h-4 mr-2" />
                        Submit Quote
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Button onClick={() => setIsQuoting(true)} className="w-full bg-accent hover:bg-accent/90 h-12 text-base">
                <Send className="w-4 h-4 mr-2" />
                Submit Your Quote
              </Button>
            )}

            {/* Existing Quotes */}
            {quotes.length > 0 && (
              <Card className="bg-card/60 border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Quotes Submitted ({sortedQuotes.length})</CardTitle>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground">Sort</label>
                      <select className="border rounded px-2 py-1 bg-background" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}>
                        <option value="desc">Newest</option>
                        <option value="asc">Oldest</option>
                      </select>
                      <input type="date" className="border rounded px-2 py-1 bg-background" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} />
                      <input type="date" className="border rounded px-2 py-1 bg-background" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sortedQuotes.map((quote) => (
                    <div key={quote.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{quote.vendorName}</p>
                          <p className="text-sm text-muted-foreground">{quote.vendorEmail}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          {quote.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border/50">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Price</p>
                          <p className="font-semibold text-accent">{quote.totalPrice}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Delivery</p>
                          <p className="font-semibold">{quote.deliveryDays} days</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">By Date</p>
                          <p className="font-semibold">{quote.deliveryDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Submitted</p>
                          <p className="font-semibold">{`${quote.recordDate ?? ""}${quote.recordDate ? " " : ""}${quote.recordTime ?? ""}` || quote.submittedAt}</p>
                        </div>
                      </div>
                      {quote.notes && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-1">Notes</p>
                          <p className="text-sm">{quote.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="bg-card/60 border-border/50">
              <CardHeader>
                <CardTitle className="text-sm">Request Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="font-semibold capitalize text-accent">{procurement.status}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Posted</p>
                  <p className="font-semibold">{procurement.createdAt}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Quotes</p>
                  <p className="font-semibold">{quotes.length}</p>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-accent/5 border-accent/20">
              <CardHeader>
                <CardTitle className="text-sm">About This Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <Package className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Verified Buyer</p>
                    <p className="text-xs text-muted-foreground">Project from trusted manager</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <User className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Professional Process</p>
                    <p className="text-xs text-muted-foreground">Competitive bidding system</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
