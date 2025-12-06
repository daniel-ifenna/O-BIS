"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Send, Eye, AlertTriangle } from "lucide-react"

export default function ProcurementRequests() {
  const requests = [
    {
      id: 1,
      item: "Steel Beams (Grade A)",
      specification: "H-beam 500x200x12mm",
      quantity: 50,
      unit: "pieces",
      deliveryLocation: "Downtown Site",
      requestedDate: "2025-02-15",
      status: "pending",
      quotes: 0,
      createdAt: "2025-01-20",
    },
    {
      id: 2,
      item: "Concrete Mix C30",
      specification: "30 MPa concrete",
      quantity: 100,
      unit: "cubic meters",
      deliveryLocation: "Downtown Site",
      requestedDate: "2025-02-10",
      status: "quoted",
      quotes: 3,
      createdAt: "2025-01-18",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">Pending Quotes</span>
        )
      case "quoted":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">Quotes Received</span>
        )
      case "awarded":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">Vendor Selected</span>
        )
      case "delivered":
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold">Delivered</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Preview Mode Banner */}
      <div className="bg-accent/10 border-b border-accent/30 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-accent">
          <AlertTriangle className="w-4 h-4" />
          <span>Preview Mode: Sign in to access full procurement features</span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Procurement Requests</h1>
            <p className="text-sm text-muted-foreground">Manage project procurement and vendor quotes</p>
          </div>
          <Link href="/contractor/procurement/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="quoted">Quoted</TabsTrigger>
            <TabsTrigger value="awarded">Awarded</TabsTrigger>
            <TabsTrigger value="procurement">Procurement</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {requests.map((req) => (
              <Card key={req.id} className="bg-card/60 border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{req.item}</h3>
                      <p className="text-sm text-muted-foreground">{req.specification}</p>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Quantity</p>
                      <p className="font-semibold">
                        {req.quantity} {req.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Delivery Location</p>
                      <p className="font-semibold text-sm">{req.deliveryLocation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Requested By</p>
                      <p className="font-semibold text-sm">{req.requestedDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Quotes</p>
                      <p className="font-semibold">{req.quotes}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Link href={`/contractor/procurement/${req.id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Quotes
                      </Button>
                    </Link>
                    {req.status === "pending" && (
                      <Button variant="outline" size="sm">
                        <Send className="w-4 h-4 mr-2" />
                        Invite Vendors
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pending">
            <div className="space-y-4">
              {requests
                .filter((r) => r.status === "pending")
                .map((req) => (
                  <Card key={req.id} className="bg-card/60 border-border/50">
                    <CardContent className="pt-6">
                      <p className="font-semibold">{req.item}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {req.quantity} {req.unit}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="quoted">
            <div className="space-y-4">
              {requests.filter((r) => r.status === "quoted").length > 0 ? (
                requests
                  .filter((r) => r.status === "quoted")
                  .map((req) => (
                    <Card key={req.id} className="bg-card/60 border-border/50">
                      <CardContent className="pt-6">
                        <p className="font-semibold">{req.item}</p>
                        <p className="text-sm text-muted-foreground mt-1">{req.quotes} quotes received</p>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <Card className="bg-card/60 border-border/50">
                  <CardContent className="pt-6 text-center text-muted-foreground">No quoted requests</CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="awarded">
            <Card className="bg-card/60 border-border/50">
              <CardContent className="pt-6 text-center text-muted-foreground">No awarded requests</CardContent>
            </Card>
          </TabsContent>

          {/* Procurement Tab */}
          <TabsContent value="procurement">
            {requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((req) => (
                  <Card key={req.id} className="bg-card/60 border-border/50 hover:border-primary/30 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{req.item}</h3>
                          <p className="text-sm text-muted-foreground">{req.specification}</p>
                        </div>
                        {getStatusBadge(req.status)}
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Quantity</p>
                          <p className="font-semibold">
                            {req.quantity} {req.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Delivery Location</p>
                          <p className="font-semibold text-sm">{req.deliveryLocation}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Requested By</p>
                          <p className="font-semibold text-sm">{req.requestedDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Quotes</p>
                          <p className="font-semibold">{req.quotes}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-border">
                        <Link href={`/contractor/procurement/${req.id}`} className="flex-1">
                          <Button variant="outline" className="w-full bg-transparent" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Quotes
                          </Button>
                        </Link>
                        {req.status === "pending" && (
                          <Button variant="outline" size="sm">
                            <Send className="w-4 h-4 mr-2" />
                            Invite Vendors
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">No active procurement requests</p>
                  <Link href="/contractor/procurement/create">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Request
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
