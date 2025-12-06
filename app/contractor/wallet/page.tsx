"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, ArrowUp, ArrowDown } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

function getToken() {
  if (typeof window === "undefined") return ""
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("contractorToken") ||
    localStorage.getItem("managerToken") ||
    ""
  )
}

function formatCurrency(n: number) {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n)
  } catch {
    return `₦${n.toFixed(2)}`
  }
}

export default function ContractorWallet() {
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [pending, setPending] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  
  useEffect(() => {
    const run = async () => {
      if (!user?.id) return
      const token = getToken()
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
      const sumRes = await fetch(`/api/wallet/${user.id}`, { headers })
      if (sumRes.ok) {
        const data = await sumRes.json()
        setBalance(Number(data.balance || 0))
        setPending(Number(data.pending || 0))
      }
      const txRes = await fetch(`/api/wallet/${user.id}/transactions`, { headers })
      if (txRes.ok) {
        const items = await txRes.json()
        setTransactions(Array.isArray(items) ? items : [])
      }
    }
    void run()
  }, [user?.id])

  

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Wallet & Payments</h1>
          <p className="text-sm text-muted-foreground">View your wallet balance and request payments</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Wallet Overview */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(balance)}</p>
              <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{formatCurrency(pending)}</p>
              <p className="text-xs text-muted-foreground mt-1">Awaiting manager approval</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{formatCurrency(balance + pending)}</p>
              <p className="text-xs text-muted-foreground mt-1">Across all projects</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">Payment Requests</TabsTrigger>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <Card className="bg-card/60 border-border/50">
              <CardContent className="pt-6 text-center text-muted-foreground">Payment requests sync with manager approvals</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <Card key={tx.id} className="bg-card/60 border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                          {tx.type === "received" ? (
                            <ArrowDown className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowUp className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{tx.description || ""}</p>
                          <p className="text-xs text-muted-foreground mt-1">{tx.recordDate} {tx.recordTime}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${tx.type === "received" ? "text-green-600" : "text-blue-600"}`}>
                          {tx.type === "received" ? "+" : "-"}
                          {formatCurrency(Number(tx.amount || 0))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6 text-center text-muted-foreground">No transactions yet</CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
