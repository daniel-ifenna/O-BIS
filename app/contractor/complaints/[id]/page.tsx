"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { useComplaints } from "@/lib/complaint-context"
import { formatDateTime } from "@/lib/utils"

export default function ComplaintDetailPage() {
  const params = useParams()
  const { getComplaint } = useComplaints()
  const complaint = getComplaint(params.id as string)

  if (!complaint) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-card/60 border-border/50">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Complaint not found</p>
            <Link href="/contractor/complaints">
              <Button className="bg-primary hover:bg-primary/90">Back to Complaints</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-5 h-5 text-destructive" />
      case "high":
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === "resolved") {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    }
    return <Clock className="w-5 h-5 text-blue-600" />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/contractor/complaints">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{complaint.subject}</h1>
            <p className="text-sm text-muted-foreground">ID: {complaint.id}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Complaint Details */}
            <Card className="bg-card/60 border-border/50">
              <CardHeader>
                <CardTitle>Complaint Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-foreground whitespace-pre-wrap">{complaint.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="font-semibold capitalize">{complaint.category.replace("-", " ")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Severity</p>
                    <p className="font-semibold capitalize flex items-center gap-2">
                      {getSeverityIcon(complaint.severity)}
                      {complaint.severity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Filed Date</p>
                    <p className="font-semibold">{new Date(complaint.filedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-semibold capitalize flex items-center gap-2">
                      {getStatusIcon(complaint.status)}
                      {complaint.status}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resolution */}
            {complaint.resolution && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-900">Resolution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-900">{complaint.resolution}</p>
                  <p className="text-sm text-green-700 mt-4">
                    Resolved on {complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleDateString() : "N/A"}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Activity Timeline */}
            <Card className="bg-card/60 border-border/50">
              <CardHeader>
                <CardTitle>Activity History ({complaint.activities.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complaint.activities.map((activity, idx) => (
                    <div
                      key={activity.id}
                      className={idx !== complaint.activities.length - 1 ? "pb-4 border-b border-border" : ""}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold capitalize text-foreground">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.notes}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="bg-card/60 border-border/50">
              <CardHeader>
                <CardTitle className="text-sm">Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge
                    variant="outline"
                    className={`
                      ${complaint.status === "open" ? "bg-red-100 text-red-800" : ""}
                      ${complaint.status === "acknowledged" ? "bg-yellow-100 text-yellow-800" : ""}
                      ${complaint.status === "investigating" ? "bg-blue-100 text-blue-800" : ""}
                      ${complaint.status === "resolved" ? "bg-green-100 text-green-800" : ""}
                    `}
                  >
                    {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {complaint.status === "resolved"
                    ? "This complaint has been resolved by the manager."
                    : "Waiting for manager action on this complaint."}
                </p>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm">What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>1. Manager reviews your complaint</p>
                <p>2. Status updates to "Acknowledged"</p>
                <p>3. Investigation begins</p>
                <p>4. Resolution provided</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
