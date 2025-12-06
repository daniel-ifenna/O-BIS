"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Plus, MessageSquare } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useComplaints } from "@/lib/complaint-context"

export default function ContractorComplaintsPage() {
  const { user } = useAuth()
  const { getComplaintsByContractor } = useComplaints()

  const complaints = user ? getComplaintsByContractor(user.id) : []

  const getSeverityColor = (severity: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800"
      case "acknowledged":
        return "bg-yellow-100 text-yellow-800"
      case "investigating":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
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
                Complaints & Issues
              </h1>
              <p className="text-sm text-muted-foreground">Report project issues directly to the manager</p>
            </div>
            <Link href="/contractor/complaints/create">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                File New Complaint
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {complaints.length > 0 ? (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All ({complaints.length})</TabsTrigger>
              <TabsTrigger value="open">Open ({complaints.filter((c) => c.status === "open").length})</TabsTrigger>
              <TabsTrigger value="resolved">
                Resolved ({complaints.filter((c) => c.status === "resolved").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {complaints.map((complaint) => (
                <Link key={complaint.id} href={`/contractor/complaints/${complaint.id}`}>
                  <Card className="bg-card/60 border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{complaint.subject}</h3>
                            <Badge variant={getSeverityColor(complaint.severity)} className="capitalize">
                              {complaint.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{complaint.description}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)} mb-2`}
                          >
                            {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-6 text-sm text-muted-foreground pt-3 border-t border-border">
                        <div>
                          <p className="text-xs">Category</p>
                          <p className="font-semibold text-foreground capitalize">
                            {complaint.category.replace("-", " ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs">Filed</p>
                          <p className="font-semibold text-foreground">
                            {new Date(complaint.filedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs">Updates</p>
                          <p className="font-semibold text-foreground">{complaint.activities.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </TabsContent>

            <TabsContent value="open" className="space-y-4">
              {complaints
                .filter((c) => c.status === "open")
                .map((complaint) => (
                  <Link key={complaint.id} href={`/contractor/complaints/${complaint.id}`}>
                    <Card className="bg-card/60 border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{complaint.subject}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{complaint.description}</p>
                        <div className="text-sm text-muted-foreground">
                          Filed on {new Date(complaint.filedAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              {complaints
                .filter((c) => c.status === "resolved")
                .map((complaint) => (
                  <Link key={complaint.id} href={`/contractor/complaints/${complaint.id}`}>
                    <Card className="bg-card/60 border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{complaint.subject}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Resolved on{" "}
                          {complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleDateString() : "N/A"}
                        </p>
                        {complaint.resolution && (
                          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
                            <strong>Resolution:</strong> {complaint.resolution}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="bg-card/60 border-border/50">
            <CardContent className="pt-12 pb-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">No complaints filed yet</p>
              <Link href="/contractor/complaints/create">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  File Your First Complaint
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
