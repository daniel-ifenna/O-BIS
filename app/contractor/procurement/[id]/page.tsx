"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, CheckCircle, AlertCircle } from "lucide-react"

export default function ProcurementDetail() {
  const { id } = useParams() as { id: string }
  const request = {
    id,
    item: "Concrete Mix C30",
    specification: "30 MPa concrete with standard additives",
    quantity: 100,
    unit: "cubic meters",
    deliveryLocation: "Downtown Site",
    requestedDate: "2025-02-10",
    status: "quoted",
  }

  const quotes = [
    {
      id: 1,
      vendor: "ConcreteSupply Co",
      pricePerUnit: "$120",
      totalPrice: "$12,000",
      deliveryDays: 3,
      submittedAt: "2 days ago",
      status: "pending",
    },
    {
      id: 2,
      vendor: "BuildMaterials Ltd",
      pricePerUnit: "$115",
      totalPrice: "$11,500",
      deliveryDays: 2,
      submittedAt: "1 day ago",
      status: "pending",
    },
    {
      id: 3,
      vendor: "Premium Concrete",
      pricePerUnit: "$130",
      totalPrice: "$13,000",
      deliveryDays: 1,
      submittedAt: "12 hours ago",
      status: "pending",
    },
  ]

  const handleSelectVendor = (vendorId: number) => {
    try {
      // Submit vendor selection to API
      // This would normally submit to backend and trigger manager notification
    } catch (error) {
      console.error("Failed to select vendor:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/contractor/procurement">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{request.item}</h1>
            <p className="text-sm text-muted-foreground">
              {request.quantity} {request.unit}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Request Info */}
        <Card className="bg-card/60 border-border/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Specification</p>
                <p className="font-semibold text-sm">{request.specification}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Location</p>
                <p className="font-semibold">{request.deliveryLocation}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requested By</p>
                <p className="font-semibold">{request.requestedDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-semibold text-primary">Quotes Received</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotes */}
        <div>
          <h2 className="text-xl font-bold mb-4">Vendor Quotes ({quotes.length})</h2>
          <div className="grid gap-4">
            {quotes.map((quote) => (
              <Card key={quote.id} className="bg-card/60 border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{quote.vendor}</h3>
                      <p className="text-xs text-muted-foreground">Submitted {quote.submittedAt}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                      {quote.status === "pending" ? "Pending Review" : "Selected"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-6 pb-6 border-b border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Price Per Unit</p>
                      <p className="text-2xl font-bold text-primary">{quote.pricePerUnit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Price</p>
                      <p className="text-2xl font-bold">{quote.totalPrice}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Delivery Time</p>
                      <p className="text-2xl font-bold">{quote.deliveryDays} days</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => handleSelectVendor(quote.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Select This Vendor
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      View Full Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Help Note */}
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Selecting a vendor:</span> Once you select a vendor, the
              project manager will be notified for final approval. Upon approval, a temporary delivery token will be
              generated for tracking the delivery.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
