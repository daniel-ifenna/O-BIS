"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SendIcon, Home } from "lucide-react"
import { useProcurements } from "@/lib/procurement-context"

export default function PublicProcurementPortal() {
  const { procurements } = useProcurements()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">Open</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-accent/10 rounded-lg transition-colors">
                <Home className="w-5 h-5 text-foreground" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Procurement Portal</h1>
                <p className="text-sm text-muted-foreground">View and bid on construction material requests</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">Available Requests</TabsTrigger>
          </TabsList>

          {/* Available Requests */}
          <TabsContent value="requests" className="space-y-4">
            {procurements.filter((p) => p.isPublic).length > 0 ? (
              procurements
                .filter((p) => p.isPublic)
                .map((req) => (
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

                    <Link href={`/public-procurement/${req.id}`}>
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
        </Tabs>
      </main>
    </div>
  )
}
