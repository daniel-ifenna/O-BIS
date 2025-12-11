"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, CheckCircle, AlertCircle } from "lucide-react"
import { useProcurements } from "@/lib/procurement-context"
import { useProjects } from "@/lib/project-context"
import { ProtectedRoute } from "@/lib/protected-route"

function ProcurementReviewContent({ params }: { params: { id: string } }) {
  const { getProcurement, getQuotes, selectQuote, awardQuote } = useProcurements()
  const { getProject } = useProjects()
  const procurement = getProcurement(params.id)
  const quotes = procurement ? getQuotes(procurement.id) : []
  const project = procurement ? getProject(procurement.projectId) : undefined

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/manager/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Review Procurement Request</h1>
            <p className="text-sm text-muted-foreground">{procurement?.item}</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {procurement && (
          <Card className="bg-card/60 border-border/50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Item</p>
                  <p className="font-semibold text-sm">{procurement.item}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Project</p>
                  <p className="font-semibold text-sm">{project?.title || procurement.projectId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-semibold">
                    {procurement.quantity} {procurement.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold text-sm">{procurement.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Location</p>
                  <p className="font-semibold text-sm">{procurement.deliveryLocation}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Project Location</p>
                  <p className="font-semibold text-sm">{project?.location || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requested</p>
                  <p className="font-semibold text-sm">{procurement.requestedDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-xl font-bold mb-4">Vendor Quotes ({quotes.length})</h2>
          <div className="grid gap-4">
            {quotes.map((quote) => (
              <Card key={quote.id} className="bg-card/60 border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{quote.vendorName}</h3>
                      <p className="text-xs text-muted-foreground">{quote.vendorEmail}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        {quote.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-6 mb-6 pb-6 border-b border-border">
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
                      <p className="text-2xl font-bold">{quote.deliveryDays}</p>
                      <p className="text-xs text-muted-foreground">days</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Expected Delivery</p>
                      <p className="font-semibold text-sm">{quote.deliveryDate}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={() => awardQuote(params.id, quote.id)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Award
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={() => selectQuote(params.id, quote.id)}>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Shortlist for Interview
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      View Full Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ProcurementReview({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute requiredRole="manager">
      <ProcurementReviewContent params={params} />
    </ProtectedRoute>
  )
}
