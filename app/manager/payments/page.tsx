"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, XCircle, ArrowDown } from "lucide-react"
import { usePayments } from "@/lib/payment-context"
import { useProjects } from "@/lib/project-context"

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
  const [filterStart, setFilterStart] = useState<string>("")
  const [filterEnd, setFilterEnd] = useState<string>("")
  const { getPendingRequests, getHistory, refresh } = usePayments()
  useEffect(() => {
    void refresh()
  }, [])
  const { getProject } = useProjects()

  const walletInfo = {
    balance: "₦0",
    pending: "₦0",
    paid: "₦0",
  }

  const pendingRequestsRaw = getPendingRequests()
  const historyRaw = getHistory()

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

  const pendingRequests = useMemo(() => pendingRequestsRaw.filter((p) => inRange(p.recordDate)).sort(cmp), [pendingRequestsRaw, sortOrder, filterStart, filterEnd])
  const history = useMemo(() => historyRaw.filter((p) => inRange(p.recordDate)).sort(cmp), [historyRaw, sortOrder, filterStart, filterEnd])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground"> Wallet Balance & Payments</h1>
          <p className="text-sm text-muted-foreground">Manage funds, approve payments, and track transactions</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Sort</label>
            <select className="border rounded px-2 py-1 bg-background" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}>
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">From</label>
            <input type="date" className="border rounded px-2 py-1 bg-background" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">To</label>
            <input type="date" className="border rounded px-2 py-1 bg-background" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} />
          </div>
        </div>
        {/* Wallet Overview */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{walletInfo.balance}</p>
              <p className="text-xs text-muted-foreground mt-1">Total amount Paid</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{walletInfo.pending}</p>
              <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid Out</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{walletInfo.paid}</p>
              <p className="text-xs text-muted-foreground mt-1">Total released</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Requests</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
          </TabsList>

          {/* Pending Requests */}
          <TabsContent value="pending" className="space-y-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((req) => (
                <Card key={req.id} className="bg-card/60 border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{req.requesterName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getProject(req.projectId)?.title || req.projectName || req.projectId}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {req.type} • {`${req.recordDate ?? ""}${req.recordDate ? " " : ""}${req.recordTime ?? ""}` || req.requestedAt}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-accent">{req.amount}</p>
                        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold mt-1">
                          Pending Review
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border">
                      <a href={req.proofUrl} target="_blank" rel="noreferrer" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Eye className="w-4 h-4 mr-2" />
                          View Proof
                        </Button>
                      </a>
                      <Link href={`/manager/payments/${req.id}/review`} className="flex-1">
                        <Button onClick={() => refresh()} size="sm" className="w-full bg-primary hover:bg-primary/90">
                          Review & Approve
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No pending payment requests
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payment History */}
          <TabsContent value="history" className="space-y-4">
            {history.length > 0 ? (
              history.map((payment) => (
                <Card key={payment.id} className="bg-card/60 border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                          {payment.status === "Approved" || payment.status === "Paid" ? (
                            <ArrowDown className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{payment.requesterName}</p>
                          <p className="text-sm text-muted-foreground">
                            {getProject(payment.projectId)?.title || payment.projectName || payment.projectId}
                          </p>
                          <div className="flex gap-4 mt-2">
                            <span className="text-xs text-muted-foreground">{payment.type}</span>
                            <span className="text-xs text-muted-foreground">{`${payment.recordDate ?? ""}${payment.recordDate ? " " : ""}${payment.recordTime ?? ""}` || payment.requestedAt}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{payment.amount}</p>
                        {payment.status === "Approved" || payment.status === "Paid" ? (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold mt-1">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 bg-destructive/10 text-destructive rounded text-xs font-semibold mt-1">
                            Declined
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6 text-center text-muted-foreground">No payment history</CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Disputes */}
          <TabsContent value="disputes">
            <Card className="bg-card/60 border-border/50">
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No active disputes</p>
                <p className="text-xs mt-2">Disputed payments will appear here for resolution</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
