"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, ChevronLeft, TrendingDown } from "lucide-react"
import { useProjects } from "@/lib/project-context"
import {
  downloadFile,
  generateDailyReportsExcel,
  generateFinancialSummaryExcel,
  generateTransactionExcel,
  formatFileName,
} from "@/lib/export-utils"
import { formatNaira } from "@/lib/currency"

export default function ManagerReportsPage() {
  const params = useParams()
  const { getProject, isLoaded } = useProjects()
  const project = getProject(params.projectId as string)

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-card/60 border-border/50">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Loading project...</p>
            <Link href="/manager/dashboard">
              <Button className="bg-primary hover:bg-primary/90">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-card/60 border-border/50">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Project not found</p>
            <Link href="/manager/dashboard">
              <Button className="bg-primary hover:bg-primary/90">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const [dailyReports, setDailyReports] = useState<any[]>([])
  useEffect(() => {
    const load = async () => {
      if (!project) return
      try {
        const res = await fetch(`/api/projects/${project.id}/daily-reports`)
        if (res.ok) setDailyReports(await res.json())
      } catch {}
    }
    void load()
  }, [project?.id])

  const financialData = {
    totalBudget: 0,
    totalSpent: 0,
    pendingPayments: 0,
    completedPayments: 0,
    contingencyUsed: 0,
    contingencyPercent: 0,
    transactions: [],
    paymentRequests: [],
  }

  const transactions: any[] = []

  const handleDownloadDailyReports = () => {
    const blob = generateDailyReportsExcel(dailyReports, project.title.toString())
    downloadFile(blob, formatFileName(`Daily_Reports_${project.title}`))
  }

  const handleDownloadFinancial = () => {
    const blob = generateFinancialSummaryExcel(project.title.toString(), financialData)
    downloadFile(blob, formatFileName(`Financial_Summary_${project.title}`))
  }

  const handleDownloadTransactions = () => {
    const blob = generateTransactionExcel(transactions, project.title.toString())
    downloadFile(blob, formatFileName(`Transactions_${project.title}`))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/manager/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Project Reports
            </h1>
            <p className="text-sm text-muted-foreground">{project.title}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList>
            <TabsTrigger value="daily">Daily Reports</TabsTrigger>
            <TabsTrigger value="financial">Financial Analysis</TabsTrigger>
            <TabsTrigger value="transactions">All Transactions</TabsTrigger>
          </TabsList>

          {/* Daily Reports */}
          <TabsContent value="daily" className="space-y-6">
            <Card className="bg-card/60 border-border/50">
              <CardHeader>
                <CardTitle>Contractor Daily Reports</CardTitle>
                <CardDescription>All work reports submitted by contractors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">{project.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {dailyReports.length > 0 ? "Reports available" : "No reports available"}
                      </p>
                    </div>
                    {dailyReports.length > 0 ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        Ready to Download
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold">
                        Empty
                      </span>
                    )}
                  </div>
                  <Button onClick={handleDownloadDailyReports} disabled={dailyReports.length === 0} className="w-full bg-primary hover:bg-primary/90">
                    <Download className="w-4 h-4 mr-2" />
                    Download Daily Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Analysis */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold text-primary">{project.budget ? formatNaira(project.budget) : "—"}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground">Spent</p>
                  <p className="text-2xl font-bold">—</p>
                </CardContent>
              </Card>
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">—</p>
                </CardContent>
              </Card>
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="text-2xl font-bold text-green-600">—</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/60 border-border/50">
              <CardHeader>
                <CardTitle>Financial Summary Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <TrendingDown className="w-8 h-8 text-accent" />
                    <div>
                      <h3 className="font-semibold">Complete Financial Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        Budget comparison, spending trends, and variance analysis
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleDownloadFinancial} className="w-full bg-accent hover:bg-accent/90">
                    <Download className="w-4 h-4 mr-2" />
                    Download Financial Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-card/60 border-border/50">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-background/50 border border-border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">All Transactions</h3>
                      <p className="text-sm text-muted-foreground">
                        {transactions.length > 0 ? "Transactions available" : "No transactions available"}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleDownloadTransactions}
                    disabled={transactions.length === 0}
                    className="w-full bg-background hover:bg-background/80 border border-border"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Transaction History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
