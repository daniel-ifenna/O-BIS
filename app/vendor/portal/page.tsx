"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SendIcon, CheckCircle, Truck, AlertCircle, Home } from "lucide-react"
import { useProcurements } from "@/lib/procurement-context"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"

function VendorPortalContent() {
  const router = useRouter()
  const { procurements, getQuotes } = useProcurements()
  const { user } = useAuth()
  const [balance, setBalance] = useState<number | null>(null)
  useEffect(() => {
    const run = async () => {
      if (!user?.id) return
      const token = (typeof window !== "undefined" && (localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("vendorToken") || "")) || ""
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`/api/wallet/${user.id}`, { headers })
      if (res.ok) {
        const data = await res.json()
        setBalance(Number(data.balance || 0))
      } else {
        setBalance(0)
      }
    }
    run().catch(() => setBalance(0))
  }, [user?.id])

  const openRequests = procurements.filter((p) => p.isPublic && p.status === "open")
  const quotes = procurements.flatMap((p) => getQuotes(p.id))
  const awarded = procurements.filter((p) => p.status === "awarded" && p.selectedQuoteId)
  const completedDeliveries: any[] = []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">Open</span>
      case "quoted":
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">Already Quoted</span>
      case "awarded":
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">Awarded</span>
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">Pending Review</span>
        )
      case "pending-delivery":
        return (
          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
            Pending Delivery
          </span>
        )
      case "delivered":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">Delivered</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
              title="Go to home"
            >
              <Home className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Vendor Portal</h1>
              <p className="text-sm text-muted-foreground">View procurement requests and manage quotes</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {user?.id && (
          <div className="mb-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Escrow Wallet</p>
                <p className="text-2xl font-bold text-primary">{balance == null ? "Loading..." : new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(balance)}</p>
                <p className="text-xs text-muted-foreground mt-1">This is a virtual wallet. Real payouts not available until financial API integration.</p>
              </CardContent>
            </Card>
          </div>
        )}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">Available Requests</TabsTrigger>
            <TabsTrigger value="myquotes">My Quotes</TabsTrigger>
            <TabsTrigger value="awarded">Active Contracts</TabsTrigger>
            <TabsTrigger value="delivered">Completed</TabsTrigger>
          </TabsList>

          {/* Available Requests */}
          <TabsContent value="requests" className="space-y-4">
            {openRequests.length > 0 ? (
              openRequests.map((req) => (
                <Card key={req.id} className="bg-card/60 border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{req.item}</h3>
                        <p className="text-sm text-muted-foreground">{req.specification}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Project {req.projectId} • {req.deliveryLocation}
                          </p>
                        </div>
                        {getStatusBadge(req.status)}
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Quantity</p>
                          <p className="font-semibold">
                            {req.quantity} {req.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Posted</p>
                          <p className="font-semibold text-sm">{req.createdAt}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p className="font-semibold">Open</p>
                        </div>
                      </div>

                      <Link href={`/vendor/portal/quote/${req.id}`}>
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          <SendIcon className="w-4 h-4 mr-2" />
                          Submit Quote
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6 text-center text-muted-foreground">No open requests available</CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Quotes */}
          <TabsContent value="myquotes" className="space-y-4">
            {quotes.length > 0 ? (
              quotes.map((quote) => (
                <Card key={quote.id} className="bg-card/60 border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">Quote #{quote.id}</h3>
                        <p className="text-sm text-muted-foreground">Submitted {quote.submittedAt}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{quote.totalPrice}</p>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">{quote.status}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6 text-center text-muted-foreground">No quotes submitted yet</CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Awarded Contracts */}
          <TabsContent value="awarded" className="space-y-4">
            {awarded.length > 0 ? (
              awarded.map((contract) => (
                <Card key={contract.id} className="bg-card/60 border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{contract.item}</h3>
                        <p className="text-sm text-muted-foreground">Request {contract.id}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {contract.quantity} {contract.unit} • {contract.deliveryLocation}
                        </p>
                      </div>
                      {getStatusBadge(contract.status + "-delivery")}
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4 pb-4 border-b border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Contract Value</p>
                        <p className="font-semibold">N/A</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Expected Delivery</p>
                        <p className="font-semibold text-sm">{contract.requestedDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Delivery Token</p>
                        <p className="font-mono text-xs">TOKEN-{contract.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="font-semibold">Ready</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/vendor/portal/delivery/${contract.id}`} className="flex-1">
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          <Truck className="w-4 h-4 mr-2" />
                          Mark Delivered
                        </Button>
                      </Link>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">No active contracts</p>
                    <p className="text-xs text-muted-foreground">
                      Awarded quotes will appear here with delivery details
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Delivered */}
          <TabsContent value="delivered" className="space-y-4">
            {completedDeliveries.length > 0 ? (
              completedDeliveries.map((delivery) => (
                <Card key={delivery.id} className="bg-card/60 border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-lg">{delivery.item}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{delivery.project}</p>
                        <p className="text-xs text-muted-foreground mt-1">Delivered {delivery.deliveredAt}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{delivery.price}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {delivery.quantity} {delivery.unit}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6 text-center text-muted-foreground">No completed deliveries</CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

import { ProtectedRoute } from "@/lib/protected-route"

export default function VendorPortal() {
  return (
    <ProtectedRoute requiredRole="vendor">
      <VendorPortalContent />
    </ProtectedRoute>
  )
}
