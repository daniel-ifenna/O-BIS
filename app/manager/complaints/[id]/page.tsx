"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Send, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { useComplaints } from "@/lib/complaint-context"

export default function ManagerComplaintDetailPage() {
  const params = useParams()
  const { getComplaint, updateComplaintStatus, resolveComplaint, addActivity } = useComplaints()
  const complaint = getComplaint(params.id as string)

  const [isAddingNote, setIsAddingNote] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [isResolving, setIsResolving] = useState(false)
  const [resolutionText, setResolutionText] = useState("")

  if (!complaint) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-card/60 border-border/50">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Complaint not found</p>
            <Link href="/manager/complaints">
              <Button className="bg-primary hover:bg-primary/90">Back to Complaints</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAcknowledge = () => {
    updateComplaintStatus(complaint.id, "acknowledged")
  }

  const handleAddNote = () => {
    if (noteText.trim()) {
      addActivity(complaint.id, {
        complaintId: complaint.id,
        action: "updated",
        notes: noteText,
        timestamp: new Date().toISOString(),
        managerId: "manager-1",
      })
      setNoteText("")
      setIsAddingNote(false)
    }
  }

  const handleResolve = () => {
    if (resolutionText.trim()) {
      resolveComplaint(complaint.id, resolutionText)
      setResolutionText("")
      setIsResolving(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-6 h-6 text-destructive" />
      case "high":
        return <AlertTriangle className="w-6 h-6 text-orange-600" />
      default:
        return <Clock className="w-6 h-6 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "destructive"
      case "acknowledged":
        return "secondary"
      case "investigating":
        return "secondary"
      case "resolved":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/manager/complaints">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{complaint.subject}</h1>
            <p className="text-sm text-muted-foreground">ID: {complaint.id}</p>
          </div>
          <div className="flex gap-2">
            {complaint.status === "open" && (
              <Button onClick={handleAcknowledge} className="bg-primary hover:bg-primary/90">
                <CheckCircle className="w-4 h-4 mr-2" />
                Acknowledge
              </Button>
            )}
            {complaint.status !== "resolved" && complaint.status !== "closed" && (
              <Button onClick={() => setIsResolving(true)} className="bg-green-600 hover:bg-green-700">
                Mark as Resolved
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
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
                    <p className="text-xs text-muted-foreground">From Contractor</p>
                    <p className="font-semibold">{complaint.contractorName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="font-semibold capitalize">{complaint.category.replace("-", " ")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Severity</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getSeverityIcon(complaint.severity)}
                      <p className="font-semibold capitalize">{complaint.severity}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Filed Date</p>
                    <p className="font-semibold">{new Date(complaint.filedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resolution */}
            {complaint.resolution && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Resolution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-900 mb-3">{complaint.resolution}</p>
                  <p className="text-sm text-green-700">
                    Resolved on {complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleDateString() : "N/A"}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Add Note Section */}
            {!isResolving &&
              complaint.status !== "resolved" &&
              complaint.status !== "closed" &&
              (isAddingNote ? (
                <Card className="bg-card/60 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-base">Add Investigation Note</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="note">Investigation Note</Label>
                      <Textarea
                        id="note"
                        placeholder="Document your investigation progress, findings, or next steps..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="min-h-24"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddingNote(false)}
                        className="flex-1 bg-transparent"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddNote}
                        className="flex-1 bg-primary hover:bg-primary/90"
                        disabled={!noteText.trim()}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Button onClick={() => setIsAddingNote(true)} className="w-full bg-primary hover:bg-primary/90">
                  <Send className="w-4 h-4 mr-2" />
                  Add Investigation Note
                </Button>
              ))}

            {/* Resolve Section */}
            {isResolving && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-900">Resolve Complaint</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resolution">Resolution</Label>
                    <Textarea
                      id="resolution"
                      placeholder="Provide a detailed resolution to this complaint..."
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      className="min-h-32"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsResolving(false)}
                      className="flex-1 bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleResolve}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={!resolutionText.trim()}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Resolved
                    </Button>
                  </div>
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
                            {new Date(activity.timestamp).toLocaleString()}
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
                <CardTitle className="text-sm">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Badge variant={getStatusColor(complaint.status)} className="capitalize w-full justify-center py-2">
                  {complaint.status}
                </Badge>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Filed</p>
                    <p className="font-semibold">{new Date(complaint.filedAt).toLocaleDateString()}</p>
                  </div>
                  {complaint.acknowledgedAt && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">Acknowledged</p>
                      <p className="font-semibold">{new Date(complaint.acknowledgedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                  {complaint.resolvedAt && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">Resolved</p>
                      <p className="font-semibold">{new Date(complaint.resolvedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions Guide */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Review the complaint details</li>
                  <li>Acknowledge receipt to contractor</li>
                  <li>Investigate the issue</li>
                  <li>Add investigation notes</li>
                  <li>Provide resolution</li>
                  <li>Contractor receives notification</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
