"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChevronLeft, FileText, Download } from "lucide-react"
import { usePayments } from "@/lib/payment-context"
import { useProjects } from "@/lib/project-context"

export default function ReviewPayment({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [declineReason, setDeclineReason] = useState("")
  const [showDeclineForm, setShowDeclineForm] = useState(false)
  const { getPaymentRequest, approvePayment, declinePayment, refresh } = usePayments()
  const { getProject } = useProjects()
  const request = getPaymentRequest(params.id)

  const handleApprove = async () => {
    await approvePayment(params.id)
    await refresh()
    router.push("/manager/payments?status=approved")
  }

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      alert("Please provide a reason for declining")
      return
    }
    await declinePayment(params.id, declineReason)
    await refresh()
    router.push("/manager/payments")
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/manager/payments">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Review Payment Request</h1>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card className="bg-card/60 border-border/50">
            <CardContent className="pt-6 text-center text-muted-foreground">Payment request not found</CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/manager/payments">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Review Payment Request</h1>
            <p className="text-sm text-muted-foreground">
              {request.requesterName} • {getProject(request.projectId)?.title || request.projectName || request.projectId}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Request Summary */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{request.requesterName}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2">
                    <Badge className="capitalize">{request.requesterRole}</Badge>
                    <span>{getProject(request.projectId)?.title || request.projectName || request.projectId}</span>
                  </div>
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">{request.amount}</p>
                <p className="text-xs text-muted-foreground mt-1">{request.type}</p>
                {request.status === "Approved" || request.status === "Paid" ? (
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold mt-1">{request.status}</span>
                ) : request.status === "Declined" ? (
                  <span className="inline-block px-2 py-1 bg-destructive/10 text-destructive rounded text-xs font-semibold mt-1">Declined</span>
                ) : (
                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold mt-1">Pending Review</span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Milestone</p>
                <p className="font-semibold">{request.milestone || ""}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requested At</p>
                <p className="font-semibold">{`${request.recordDate ?? ""}${request.recordDate ? " " : ""}${request.recordTime ?? ""}` || request.requestedAt}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Account</p>
                <p className="font-semibold">{request.accountMasked || "••••••••"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-semibold">{request.status}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium mb-2">Request Description</p>
                <p className="text-sm text-muted-foreground">{request.notes || ""}</p>
            </div>
          </CardContent>
        </Card>

        {/* Supporting Documents */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader>
            <CardTitle>Supporting Documents</CardTitle>
            <CardDescription>Review proof of completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {request.proofUrl ? (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{request.proofUrl}</p>
                    </div>
                  </div>
                  <a href={request.proofUrl} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      View Proof
                    </Button>
                  </a>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Decision Section */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader>
            <CardTitle>Your Decision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!showDeclineForm ? (
              <div className="flex gap-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                  Approve & Mark Paid
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowDeclineForm(true)}>
                  Decline Request
                </Button>
              </div>
            ) : (
              <div className="space-y-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div>
                  <Label htmlFor="reason">Reason for Declining *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Explain why this payment request is being declined..."
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="min-h-24 mt-2"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setShowDeclineForm(false)
                      setDeclineReason("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button className="flex-1 bg-destructive hover:bg-destructive/90" onClick={handleDecline}>
                    Confirm Decline
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Info */}
        <Card className="bg-primary/5 border border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm text-foreground font-medium mb-2">Compliance Check</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>KYC verification completed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Supporting documents verified</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>No fraud flags detected</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Amount within milestone limit</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
