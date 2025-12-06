"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ChevronRight, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useComplaints } from "@/lib/complaint-context"

export default function ManagerComplaintsPage() {
  const { user } = useAuth()
  const { getComplaintsByManager } = useComplaints()

  const complaints = user ? getComplaintsByManager(user.id) : []
  const openComplaints = complaints.filter((c) => c.status === "open")
  const acknowledgedComplaints = complaints.filter((c) => c.status === "acknowledged" || c.status === "investigating")
  const resolvedComplaints = complaints.filter((c) => c.status === "resolved" || c.status === "closed")

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-destructive" />
      case "high":
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "secondary"
      case "medium":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-destructive" />
                Complaint Management
              </h1>
              <p className="text-sm text-muted-foreground">Review and resolve contractor complaints</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/60 border-border/50">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground mb-1">Total Complaints</p>
              <p className="text-3xl font-bold text-foreground">{complaints.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="pt-6">
              <p className="text-xs text-destructive mb-1">Open</p>
              <p className="text-3xl font-bold text-destructive">{openComplaints.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-100/30 border-yellow-200/50">
            <CardContent className="pt-6">
              <p className="text-xs text-yellow-800 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-yellow-700">{acknowledgedComplaints.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-100/30 border-green-200/50">
            <CardContent className="pt-6">
              <p className="text-xs text-green-800 mb-1">Resolved</p>
              <p className="text-3xl font-bold text-green-700">{resolvedComplaints.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="open" className="space-y-6">
          <TabsList>
            <TabsTrigger value="open">Open ({openComplaints.length})</TabsTrigger>
            <TabsTrigger value="progress">In Progress ({acknowledgedComplaints.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolvedComplaints.length})</TabsTrigger>
            <TabsTrigger value="all">All ({complaints.length})</TabsTrigger>
          </TabsList>

          {/* Open Complaints */}
          <TabsContent value="open" className="space-y-4">
            {openComplaints.length > 0 ? (
              <div className="grid gap-4">
                {openComplaints.map((complaint) => (
                  <Card
                    key={complaint.id}
                    className="bg-card/60 border-destructive/30 hover:border-destructive/50 transition-colors"
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3 flex-1">
                          {getSeverityIcon(complaint.severity)}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-foreground">{complaint.subject}</h3>
                            <p className="text-sm text-muted-foreground">
                              From: <strong>{complaint.contractorName}</strong>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Filed {new Date(complaint.filedAt).toLocaleDateString()} • {complaint.activities.length}{" "}
                              updates
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={getSeverityBadge(complaint.severity)} className="capitalize mb-2">
                            {complaint.severity}
                          </Badge>
                          <p className="text-xs text-muted-foreground">{complaint.category.replace("-", " ")}</p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{complaint.description}</p>

                      <Link href={`/manager/complaints/${complaint.id}`} className="inline-block">
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          Review & Acknowledge
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-12 pb-12 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600 opacity-50" />
                  <p className="text-muted-foreground mb-2">No open complaints</p>
                  <p className="text-sm text-muted-foreground">All complaints have been acknowledged</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* In Progress */}
          <TabsContent value="progress" className="space-y-4">
            {acknowledgedComplaints.length > 0 ? (
              <div className="grid gap-4">
                {acknowledgedComplaints.map((complaint) => (
                  <Card
                    key={complaint.id}
                    className="bg-card/60 border-yellow-200/50 hover:border-yellow-300/50 transition-colors"
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3 flex-1">
                          <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-foreground">{complaint.subject}</h3>
                            <p className="text-sm text-muted-foreground">
                              From: <strong>{complaint.contractorName}</strong>
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                              Status: <strong>{complaint.status}</strong> • Last updated{" "}
                              {complaint.activities.length > 0
                                ? new Date(
                                    complaint.activities[complaint.activities.length - 1].timestamp,
                                  ).toLocaleDateString()
                                : "recently"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Link href={`/manager/complaints/${complaint.id}`} className="inline-block">
                        <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                          Continue Investigating
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-12 pb-12 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No complaints in progress</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Resolved */}
          <TabsContent value="resolved" className="space-y-4">
            {resolvedComplaints.length > 0 ? (
              <div className="grid gap-4">
                {resolvedComplaints.map((complaint) => (
                  <Card key={complaint.id} className="bg-green-50/30 border-green-200/50">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{complaint.subject}</h3>
                          <p className="text-sm text-muted-foreground">From: {complaint.contractorName}</p>
                          <p className="text-xs text-green-700 mt-1">
                            Resolved{" "}
                            {complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleDateString() : "recently"}
                          </p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      </div>
                      {complaint.resolution && (
                        <div className="bg-green-100/50 border border-green-200 rounded p-3 text-sm text-green-900 mb-4">
                          <strong>Resolution:</strong> {complaint.resolution}
                        </div>
                      )}
                      <Link href={`/manager/complaints/${complaint.id}`} className="inline-block">
                        <Button size="sm" variant="outline" className="bg-transparent">
                          View Details
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-12 pb-12 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No resolved complaints</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* All Complaints */}
          <TabsContent value="all" className="space-y-4">
            {complaints.length > 0 ? (
              <div className="grid gap-4">
                {complaints.map((complaint) => (
                  <Card
                    key={complaint.id}
                    className="bg-card/60 border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{complaint.subject}</h3>
                            <Badge variant={getSeverityBadge(complaint.severity)} className="capitalize text-xs">
                              {complaint.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {complaint.contractorName} • {complaint.category.replace("-", " ")}
                          </p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Filed: {new Date(complaint.filedAt).toLocaleDateString()}</span>
                            <span>Status: {complaint.status}</span>
                            <span>Updates: {complaint.activities.length}</span>
                          </div>
                        </div>
                        <Link href={`/manager/complaints/${complaint.id}`}>
                          <Button size="sm" variant="outline" className="bg-transparent">
                            Open
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-12 pb-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No complaints yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
