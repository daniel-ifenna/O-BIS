"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, ChevronLeft, Calendar } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { downloadFile, generateDailyReportsExcel, generateTransactionExcel, formatFileName } from "@/lib/export-utils"

export default function ContractorReportsPage() {
  const { user } = useAuth()

  const dailyReports: any[] = []

  const transactions: any[] = []

  const handleDownloadDailyReports = () => {
    const blob = generateDailyReportsExcel(dailyReports, "Office Building Renovation")
    downloadFile(blob, formatFileName("Daily_Reports_Office_Building"))
  }

  const handleDownloadTransactions = () => {
    const blob = generateTransactionExcel(transactions, "Office Building Renovation")
    downloadFile(blob, formatFileName("Transactions_Office_Building"))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/contractor/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Reports & Exports
            </h1>
            <p className="text-sm text-muted-foreground">Download project reports and financial data</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList>
            <TabsTrigger value="daily">Daily Reports</TabsTrigger>
            <TabsTrigger value="financial">Financial Summary</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {/* Daily Reports Tab */}
          <TabsContent value="daily" className="space-y-6">
            <Card className="bg-card/60 border-border/50">
              <CardHeader>
                <CardTitle>Daily Reports</CardTitle>
                <CardDescription>Download all daily work reports for your projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold mb-1">Office Building Renovation</h3>
                      <p className="text-sm text-muted-foreground">
                        {dailyReports.length > 0 ? "Reports available" : "No reports available"}
                      </p>
                    </div>
                    {dailyReports.length > 0 ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Ready</span>
                    ) : (
                      <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold">Empty</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Period</p>
                      <p className="font-semibold">Jan 1 - Jan 22, 2025</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Format</p>
                      <p className="font-semibold">Excel (.csv)</p>
                    </div>
                  </div>
                  <Button onClick={handleDownloadDailyReports} disabled={dailyReports.length === 0} className="w-full bg-primary hover:bg-primary/90">
                    <Download className="w-4 h-4 mr-2" />
                    Download Daily Reports
                  </Button>
                </div>

                <Card className="bg-card/60 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-base">Report Contents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Date and time of report
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Crew information and personnel count
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Work description and progress percentage
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Safety incidents and QA issues logged
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Summary Tab */}
          <TabsContent value="financial" className="space-y-6">
            <Card className="bg-card/60 border-border/50">
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Complete financial overview with budget analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold mb-1">Office Building Renovation</h3>
                      <p className="text-sm text-muted-foreground">Complete financial analysis</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      Multi-Sheet
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-background/50 p-3 rounded">
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="font-semibold text-lg">₦250M</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded">
                      <p className="text-xs text-muted-foreground">Spent</p>
                      <p className="font-semibold text-lg">₦162.5M</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded">
                      <p className="text-xs text-muted-foreground">Remaining</p>
                      <p className="font-semibold text-lg text-green-600">₦87.5M</p>
                    </div>
                  </div>

                  <Button onClick={handleDownloadTransactions} className="w-full bg-accent hover:bg-accent/90">
                    <Download className="w-4 h-4 mr-2" />
                    Download Financial Summary
                  </Button>
                </div>

                <Card className="bg-card/60 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-base">Includes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        Summary sheet with key metrics
                      </li>
                      <li className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        Budget vs actual spending analysis
                      </li>
                      <li className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        Contingency usage tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        Monthly breakdown
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-card/60 border-border/50">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All financial transactions and payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-background/50 border border-border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold mb-1">All Transactions</h3>
                      <p className="text-sm text-muted-foreground">
                        {transactions.length > 0 ? "Transactions available" : "No transactions available"}
                      </p>
                    </div>
                    {transactions.length > 0 ? (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">Complete</span>
                    ) : (
                      <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold">Empty</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Inbound</p>
                      <p className="font-semibold text-green-600">₦120,000,000</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Outbound</p>
                      <p className="font-semibold text-red-600">₦42,500,000</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleDownloadTransactions}
                    disabled={transactions.length === 0}
                    className="w-full bg-background hover:bg-background/80 border border-border"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Transactions
                  </Button>
                </div>

                <Card className="bg-card/60 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-base">Transaction Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                          Received
                        </span>
                        <span>Payments received from manager</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          Requested
                        </span>
                        <span>Payment requests submitted</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                          Pending
                        </span>
                        <span>Awaiting approval or processing</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20 mt-8">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">About Report Downloads</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• All reports are generated in Excel format (.csv) for easy viewing and analysis</li>
              <li>• Reports include all data up to the current date and time</li>
              <li>• File names include generation date for easy organization</li>
              <li>• All sensitive data is encrypted and secure</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
