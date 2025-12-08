"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatNaira } from "@/lib/currency"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminFinancialsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState("month")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("auth_token")
        const res = await fetch(`/api/admin/financials?range=${range}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          setData(await res.json())
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [range])

  if (loading || !data) {
    return <div className="p-8">Loading financials...</div>
  }

  const chartData = [
    { name: "Publishing", value: data.summary.publishingFees },
    { name: "Bidding", value: data.summary.biddingFees },
    { name: "Quotes", value: data.summary.quoteFees },
    { name: "Transfers", value: data.summary.internalTransferFees },
    { name: "Subs", value: data.summary.subscriptionFees },
  ]

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Analytics</h1>
          <p className="text-muted-foreground">Revenue streams and transaction monitoring</p>
        </div>
        <Tabs value={range} onValueChange={setRange}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatNaira(data.summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Platform earnings</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transacted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(data.summary.totalTransacted)}</div>
            <p className="text-xs text-muted-foreground">Volume processed</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transfer Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(data.summary.internalTransferFees)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Subscription Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(data.summary.subscriptionFees)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(val) => `₦${val}`} />
                <Tooltip 
                  formatter={(value) => formatNaira(Number(value))}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.transactions.slice(0, 5).map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.recordDate}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell className="capitalize">{t.type}</TableCell>
                    <TableCell className={`text-right font-medium ${t.type === 'received' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'received' ? '+' : '-'}{formatNaira(t.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
