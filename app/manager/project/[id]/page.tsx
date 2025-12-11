"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useProjects } from "@/lib/project-context"
import { ProtectedRoute } from "@/lib/protected-route"
import { useBids } from "@/lib/bid-context"
import { formatNaira } from "@/lib/currency"
import { toast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"

function ProjectDetailContent() {
  const { id } = useParams() as { id: string }
  const { getProject, isLoaded, closeBidding, deleteProject, setProjectStatus } = useProjects()
  const project = getProject(id)
  const { getBidsByProject, shortlistBid, awardBid, updateBidStatus, getEventsByProject, logBidAction, updateBid } = useBids()
  const [remoteBids, setRemoteBids] = useState<any[]>([])
  const [ownerName, setOwnerName] = useState("")
  const [timeZone, setTimeZone] = useState("UTC")
  const [meetingDate, setMeetingDate] = useState("")
  const [meetingTime, setMeetingTime] = useState("")
  const [attendeesText, setAttendeesText] = useState("")
  const [meetUrl, setMeetUrl] = useState("")
  const [meetingTitle, setMeetingTitle] = useState("")
  const [inviteMessage, setInviteMessage] = useState("")
  const [inviteHistory, setInviteHistory] = useState<Record<string, any[]>>({})
  const [actionMessage, setActionMessage] = useState("")

  

  useEffect(() => {
    const fetchRemoteBids = async () => {
      try {
        const res = await fetch(`/api/projects/${id}/bids`)
        if (res.ok) {
          const server = await res.json()
          const local = getBidsByProject(id)
          const merged = server.map((sb: any) => {
            const lb = local.find((b) => b.id === sb.id)
            const uploads = sb.uploads && Object.values(sb.uploads).some((arr: any) => Array.isArray(arr) && arr.length > 0)
              ? sb.uploads
              : (lb as any)?.uploads || sb.uploads
            const subcontractors = Array.isArray((sb as any).subcontractors) ? (sb as any).subcontractors : (lb as any)?.subcontractors || []
            const message = sb.message ?? (lb as any)?.message ?? null
            const phone = sb.phone ?? (lb as any)?.phone ?? null
            const address = sb.address ?? (lb as any)?.address ?? null
            return { ...sb, uploads, subcontractors, message, phone, address }
          })
          setRemoteBids(merged)
        }
      } catch {}
    }
    ;(async () => { await fetchRemoteBids() })()
    ;(window as any).__refreshProjectBids = fetchRemoteBids
  }, [id])

  useEffect(() => {
    const t = project?.title || ""
    setMeetingTitle(t ? `Bid Review Meeting for ${t}` : "Bid Review Meeting")
  }, [project])

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const list = (remoteBids && remoteBids.length > 0) ? remoteBids : getBidsByProject(id)
        const reviewed = list.filter((b: any) => b.status === "Reviewed")
        const entries = await Promise.all(
          reviewed.map(async (b: any) => {
            try {
              const r = await fetch(`/api/bids/${b.id}/invite-meeting`, { headers: { Authorization: `Bearer ${getAuthToken()}` } })
              if (r.ok) {
                const arr = await r.json()
                return { bidId: b.id, arr }
              }
            } catch {}
            return { bidId: b.id, arr: [] }
          }),
        )
        const map: Record<string, any[]> = {}
        for (const e of entries) map[e.bidId] = e.arr
        setInviteHistory(map)
      } catch {}
    }
    void loadHistory()
  }, [remoteBids, id])

  const getAuthToken = () => {
    if (typeof window === "undefined") return ""
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("managerToken") ||
      ""
    )
  }

  const MEETING_LINK_REGEX = /^(https:\/\/)(meet\.google\.com|teams\.microsoft\.com|zoom\.us)\/.+/i
  const normalizeMeetInput = (input: string) => {
    const trimmed = String(input || "").trim()
    if (!trimmed) return ""
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    const code = trimmed.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9\-]/g, "")
    if (code.length >= 3) return `https://meet.google.com/${code}`
    return trimmed
  }
  const isValidMeetLink = (url: string) => MEETING_LINK_REGEX.test(url)

  const sendInvite = async (bidId: string) => {
    setActionMessage("")
    try {
      if (!meetUrl) {
        setActionMessage("Google Meet link is required")
        return
      }
      if (meetUrl && !isValidMeetLink(meetUrl)) {
        setActionMessage("Invalid Google Meet link format")
        return
      }
      const payload = {
        meetingTitle: meetingTitle || `Bid Review Meeting for ${project?.title || "Project"}`,
        date: meetingDate,
        time: meetingTime,
        googleMeetLink: normalizeMeetInput(meetUrl),
        message: inviteMessage || undefined,
        attendees: attendeesText.split(",").map((s) => s.trim()).filter(Boolean),
      }
      const res = await fetch(`/api/bids/${bidId}/invite-meeting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const data = await res.json()
        setActionMessage(`Invitation sent to ${Array.isArray(data.results) ? data.results.length : 1} recipient(s)`)         
        logBidAction(bidId, "invited")
        try {
          const r = await fetch(`/api/bids/${bidId}/invite-meeting`, { headers: { Authorization: `Bearer ${getAuthToken()}` } })
          if (r.ok) {
            const arr = await r.json()
            setInviteHistory((prev) => ({ ...prev, [bidId]: arr }))
          }
        } catch {}
      } else {
        const err = await res.json().catch(() => ({}))
        setActionMessage(err?.error || "Failed to send invitation")
      }
    } catch {
      setActionMessage("Network error")
    }
  }

  const sendInviteAllShortlisted = async () => {
    setActionMessage("")
    try {
      const list = (remoteBids && remoteBids.length > 0) ? remoteBids : getBidsByProject(id)
      const reviewed = list.filter((b: any) => b.status === "Reviewed")
      if (reviewed.length === 0) {
        setActionMessage("No shortlisted bids to invite")
        return
      }
      if (!meetUrl) {
        setActionMessage("Google Meet link is required")
        return
      }
      if (!isValidMeetLink(meetUrl)) {
        setActionMessage("Invalid Google Meet link format")
        return
      }
      const firstBidId = reviewed[0].id
      const payload = {
        meetingTitle: meetingTitle || `Bid Review Meeting for ${project?.title || "Project"}`,
        date: meetingDate,
        time: meetingTime,
        googleMeetLink: normalizeMeetInput(meetUrl),
        message: inviteMessage || undefined,
        attendees: attendeesText.split(",").map((s) => s.trim()).filter(Boolean),
        includeAllShortlisted: true,
      }
      const res = await fetch(`/api/bids/${firstBidId}/invite-meeting`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAuthToken()}` },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const data = await res.json()
        const successes = Array.isArray(data.results) ? data.results.filter((r: any) => r.ok).length : 0
        const duplicates = Array.isArray(data.results) ? data.results.filter((r: any) => r.skippedDuplicate).length : 0
        setActionMessage(`Invited ${successes} shortlisted bidder(s)${duplicates ? `; ${duplicates} duplicate(s) skipped` : ""}`)
        for (const b of reviewed) {
          try {
            const r = await fetch(`/api/bids/${b.id}/invite-meeting`, { headers: { Authorization: `Bearer ${getAuthToken()}` } })
            if (r.ok) {
              const arr = await r.json()
              setInviteHistory((prev) => ({ ...prev, [b.id]: arr }))
            }
          } catch {}
        }
      } else {
        const err = await res.json().catch(() => ({}))
        setActionMessage(err?.error || "Failed to send invitations")
      }
    } catch {
      setActionMessage("Network error")
    }
  }

  const sendAwardEmail = async (bidId: string) => {
    setActionMessage("")
    try {
      const res = await fetch(`/api/bids/${bidId}/award`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ ownerName: ownerName || "Manager" }),
      })
      if (res.ok) {
        const data = await res.json()
        const sent = Boolean(data?.contractSent)
        const at = String(data?.contractSentAt || "")
        updateBid(bidId, { status: "Awarded", contractSent: sent, contractSentAt: at } as any)
        setProjectStatus(id, "Awarded")
        closeBidding(id)
        setActionMessage("Contract awarded. Move to Overview to track progress.")
        toast({ title: "Contract awarded", description: "Move to Overview to track progress" })
        if (!sent) {
          const msg = String(data?.emailError || "Email delivery failed")
          setActionMessage(msg)
          
          if (data.fallbackCredentials) {
            // CRITICAL: Display credentials to manager if email failed for new user
            toast({ 
              title: "Email Failed - ACTION REQUIRED", 
              description: "Could not email credentials. Please copy them now.", 
              variant: "destructive",
              duration: 30000 
            })
            alert(`IMPORTANT: The email with login credentials failed to send.\n\nPlease securely share these with the contractor:\n\nEmail: ${data.fallbackCredentials.email}\nPassword: ${data.fallbackCredentials.password}`)
          } else {
            toast({ title: "Email failed", description: msg, variant: "destructive" })
          }
        } else {
          toast({ title: "Bidding closed", description: "New submissions are blocked" })
        }
      } else {
        const err = await res.json().catch(() => ({}))
        setActionMessage(err?.error || "Failed to send award email")
        toast({ title: "Failed to award", description: String(err?.error || "Error"), variant: "destructive" })
      }
    } catch {
      setActionMessage("Network error")
      toast({ title: "Network error", description: "Unable to send award", variant: "destructive" })
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-card/60 border-border/50">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading project...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-card/60 border-border/50">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Project not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const bids = getBidsByProject(id)
  const bidsCount = (remoteBids && remoteBids.length > 0) ? remoteBids.length : (project as any)?.bids || bids.length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "New":
        return <AlertCircle className="w-4 h-4 text-accent" />
      case "Reviewed":
        return <Clock className="w-4 h-4 text-primary" />
      case "Accepted":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "Awarded":
        return <CheckCircle className="w-4 h-4 text-green-700" />
      case "Rejected":
        return <AlertCircle className="w-4 h-4 text-destructive" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/manager/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
            <p className="text-sm text-muted-foreground">{project.location}</p>
          </div>
          <Link href={`/manager/project/${id}/overview`}>
            <Button variant="outline" size="sm">
              View Overview
            </Button>
          </Link>
          <Link href={`/manager/payments`}>
            <Button variant="outline" size="sm" className="ml-2">Payment Requests</Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              console.log("Close Bidding clicked", project.id)
              closeBidding(project.id)
              try { toast({ title: "Bidding closed", description: project.title }) } catch {}
            }}
            className="ml-2"
          >
            Close Bidding
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="ml-2"
            onClick={() => {
              console.log("Delete Project clicked", project.id)
              const ok = typeof window !== "undefined" ? window.confirm("Permanently delete this project?") : true
              if (!ok) return
              deleteProject(project.id)
              toast({ title: "Project deleted", description: project.title })
            }}
          >
            Delete Project
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Card className="bg-card/60 border-border/50">
          <CardHeader>
            <CardTitle>Invitation & Award Actions</CardTitle>
            <CardDescription>Configure meeting and email details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <input className="border rounded px-3 py-2" placeholder="Owner name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="Time zone" value={timeZone} onChange={(e) => setTimeZone(e.target.value)} />
              <input className="border rounded px-3 py-2" type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
              <input className="border rounded px-3 py-2" type="time" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="Attendees (comma-separated emails)" value={attendeesText} onChange={(e) => setAttendeesText(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="Meeting link" value={meetUrl} onChange={(e) => setMeetUrl(e.target.value)} />
              <input className="border rounded px-3 py-2 md:col-span-3" placeholder="Meeting title" value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} />
              <input className="border rounded px-3 py-2 md:col-span-3" placeholder="Message to bidders (optional)" value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)} />
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" title="Invite all shortlisted bidders" disabled={(getBidsByProject(id).filter((b: any) => b.status === "Reviewed").length === 0)} onClick={sendInviteAllShortlisted}>Invite All Shortlisted</Button>
            </div>
            {actionMessage && <p className="mt-3 text-sm">{actionMessage}</p>}
          </CardContent>
        </Card>
        {/* Project Info */}
        <Card className="bg-card/60 border-border/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-2xl font-bold text-primary">{formatNaira(project.budget)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-semibold">{project.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bids Received</p>
                <p className="text-2xl font-bold">{bidsCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-semibold">{project.createdAt}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bids Tabs */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader>
            <CardTitle>Project Documents</CardTitle>
            <CardDescription>Uploaded by the manager for this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">Invitation to Bid (ITB)</p>
                <p className="font-semibold truncate">{(project as any).documents?.itb || (project as any).itbName || "Not uploaded"}</p>
                <div className="mt-2">
                  {(project as any).documents?.itbUrl ? (
                    <a
                      href={(project as any).documents?.itbUrl}
                      download={(project as any).documents?.itb || undefined}
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">No file</span>
                  )}
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">Project Specifications</p>
                <p className="font-semibold truncate">{(project as any).documents?.specs || (project as any).specsName || "Not uploaded"}</p>
                <div className="mt-2">
                  {(project as any).documents?.specsUrl ? (
                    <a
                      href={(project as any).documents?.specsUrl}
                      download={(project as any).documents?.specs || undefined}
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">No file</span>
                  )}
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">Bill of Quantities (BoQ)</p>
                <p className="font-semibold truncate">{(project as any).documents?.boq || (project as any).boqName || "Not uploaded"}</p>
                <div className="mt-2">
                  {(project as any).documents?.boqUrl ? (
                    <a
                      href={(project as any).documents?.boqUrl}
                      download={(project as any).documents?.boq || undefined}
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">No file</span>
                  )}
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">Financial Specifications</p>
                <p className="font-semibold truncate">{(project as any).documents?.financial || "Not uploaded"}</p>
                <div className="mt-2">
                  {(project as any).documents?.financialUrl ? (
                    <a
                      href={(project as any).documents?.financialUrl}
                      download={(project as any).documents?.financial || undefined}
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">No file</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Bids</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {(remoteBids && remoteBids.length > 0 ? remoteBids : bids).map((bid) => (
              <Card key={bid.id} className="bg-card/60 border-border/50">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 flex-1">
                      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                        {getStatusIcon(bid.status)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{bid.companyName}</p>
                        <div className="flex gap-6 mt-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Amount</p>
                            <p className="font-semibold">{formatNaira(bid.amount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="font-semibold">{bid.duration}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Submitted</p>
                            <p className="font-semibold text-sm">{new Date(bid.submittedAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-semibold">
                            {`Status: ${bid.status} • ${(() => {
                              const t = (bid as any).reviewedAt || bid.submittedAt || ""
                              if (t) return new Date(t).toLocaleString()
                              const rd = (bid as any).recordDate || ""
                              const rt = (bid as any).recordTime || ""
                              return `${rd} ${rt}`.trim()
                            })()}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {bid.status === "New" && (
                        <>
                          <Button variant="outline" title="Shortlist" onClick={() => shortlistBid(id, bid.id)}>
                            Shortlist
                          </Button>
                          <Button variant="destructive" title="Reject" onClick={() => updateBidStatus(bid.id, "Rejected", "manager-1").then(() => toast({ title: "Bid rejected", description: bid.companyName }))}>
                            Reject
                          </Button>
                        </>
                      )}
                      {bid.status === "Reviewed" && (
                        <>
                          <Button variant="outline" title="Invite Meeting" onClick={() => sendInvite(bid.id)}>
                            Invite Meeting
                          </Button>
                          <Button variant="secondary" title="Accept" onClick={() => updateBidStatus(bid.id, "Accepted", "manager-1").then(() => toast({ title: "Bid accepted", description: bid.companyName }))}>
                            Accept
                          </Button>
                        </>
                      )}
                      {bid.status === "Accepted" ? (
                        <Button title="Award" onClick={() => sendAwardEmail(bid.id)}>Award</Button>
                      ) : bid.status === "Awarded" ? (
                        <div className="flex items-center gap-2">
                          <Button disabled title="Awarded">Awarded</Button>
                          <Link href={`/manager/project/${id}/overview`} className="text-sm text-primary underline">Move to Overview to track progress</Link>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {bid.uploads && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                      {["proposal","profile","specs","tax","bond","additional"].map((k) => (
                        <div key={k} className="border rounded p-2">
                          <p className="text-xs text-muted-foreground capitalize">{k}</p>
                          {Array.isArray((bid as any).uploads?.[k]) && (bid as any).uploads[k].length > 0 ? (
                            <div className="space-y-1">
                              {(bid as any).uploads[k].slice(0,3).map((url: string, i: number) => (
                                <a href={url} target="_blank" rel="noopener" key={i} className="text-xs text-primary hover:underline truncate inline-block max-w-[180px]">
                                  Document {i+1}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No files</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="border rounded p-3 bg-card/40">
                      <p className="text-xs text-muted-foreground">Contact</p>
                      <div className="text-sm space-y-1">
                        <p><span className="text-muted-foreground">Name:</span> <span className="font-medium">{bid.bidderName}</span></p>
                        <p><span className="text-muted-foreground">Email:</span> <a href={`mailto:${bid.email}`} className="text-primary hover:underline">{bid.email}</a></p>
                        <p><span className="text-muted-foreground">Phone:</span> <span>{bid.phone || "—"}</span></p>
                        <p><span className="text-muted-foreground">Address:</span> <span className="break-all">{bid.address || "—"}</span></p>
                      </div>
                    </div>
                    {bid.message && (
                      <div className="border rounded p-3 bg-card/40 col-span-2">
                        <p className="text-xs text-muted-foreground">Contractor Message</p>
                        <p className="text-sm whitespace-pre-line">{bid.message}</p>
                      </div>
                    )}
                  </div>
                  {Array.isArray((bid as any).subcontractors) && (bid as any).subcontractors.length > 0 && (
                    <div className="mt-4 border rounded p-3 bg-card/40">
                      <p className="text-xs text-muted-foreground">Subcontractors</p>
                      <div className="mt-2 space-y-1">
                        {(bid as any).subcontractors.map((s: any, i: number) => (
                          <div key={i} className="text-sm">
                            <p><span className="text-muted-foreground">Name:</span> <span className="font-medium">{s.name}</span></p>
                            {s.email && <p><span className="text-muted-foreground">Email:</span> <a href={`mailto:${s.email}`} className="text-primary hover:underline">{s.email}</a></p>}
                            {s.phone && <p><span className="text-muted-foreground">Phone:</span> <span>{s.phone}</span></p>}
                            {s.address && <p><span className="text-muted-foreground">Address:</span> <span className="break-all">{s.address}</span></p>}
                            {s.company && <p><span className="text-muted-foreground">Company:</span> <span>{s.company}</span></p>}
                            {s.scope && <p><span className="text-muted-foreground">Scope:</span> <span>{s.scope}</span></p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {bid.proposalText && (
                    <div className="mt-4 border rounded p-3 bg-card/40">
                      <p className="text-xs text-muted-foreground">Proposal</p>
                      <p className="text-sm whitespace-pre-line">{bid.proposalText}</p>
                    </div>
                  )}
                  {Array.isArray(inviteHistory[bid.id]) && inviteHistory[bid.id].length > 0 && (
                    <div className="mt-4 border rounded p-3 bg-card/40">
                      <p className="text-xs text-muted-foreground">Meeting Invites</p>
                      <div className="mt-2 space-y-1">
                        {inviteHistory[bid.id].map((h, i) => (
                          <div key={i} className="text-sm flex justify-between">
                            <span>{h.meetingTitle} • {h.date} {h.time}</span>
                            <a href={h.googleMeetLink} target="_blank" rel="noopener" className="text-primary hover:underline">Join</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="new">
            <Card className="bg-card/60 border-border/50">
              <CardContent className="pt-6">
                {(remoteBids && remoteBids.length > 0 ? remoteBids : bids).filter((b) => b.status === "New").length > 0 ? (
                  (remoteBids && remoteBids.length > 0 ? remoteBids : bids)
                    .filter((b) => b.status === "New")
                    .map((b) => (
                      <div key={b.id} className="flex justify-between items-center pb-3 mb-3 border-b border-border">
                        <div className="flex gap-6">
                          <span className="font-semibold">{b.companyName}</span>
                          <span>{formatNaira(b.amount)}</span>
                          <span>{b.duration} days</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" title="Shortlist this bid" disabled={b.status !== "New"} onClick={() => shortlistBid(id, b.id).then(async () => { try { const fn = (window as any).__refreshProjectBids; if (typeof fn === "function") await fn() } catch {} })}>Shortlist</Button>
                          <Button
                            variant="destructive"
                            title="Reject this bid"
                            onClick={async () => {
                              const r = await updateBidStatus(b.id, "Rejected", "manager-1")
                              if (r.ok) {
                                toast({ title: "Bid rejected", description: b.companyName })
                              } else {
                                toast({ title: "Unable to reject", description: r.error || "" })
                              }
                              try { const fn = (window as any).__refreshProjectBids; if (typeof fn === "function") await fn() } catch {}
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-center text-muted-foreground">No new bids</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shortlisted">
            <Card className="bg-card/60 border-border/50">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    title="Invite all shortlisted bidders"
                    disabled={(((remoteBids && remoteBids.length > 0 ? remoteBids : bids).filter((b: any) => b.status === "Reviewed").length === 0))}
                    onClick={sendInviteAllShortlisted}
                  >
                    Invite All Shortlisted
                  </Button>
                </div>
                {(remoteBids && remoteBids.length > 0 ? remoteBids : bids).filter((b) => b.status === "Reviewed").length > 0 ? (
                  (remoteBids && remoteBids.length > 0 ? remoteBids : bids)
                    .filter((b) => b.status === "Reviewed")
                    .map((b) => (
                      <div key={b.id} className="flex justify-between items-center pb-3 mb-3 border-b border-border">
                        <div className="flex gap-6">
                          <span className="font-semibold">{b.companyName}</span>
                          <span>{formatNaira(b.amount)}</span>
                          <span>{b.duration} days</span>
                          <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-semibold">
                            {`Status: ${b.status} • ${(() => {
                              const t = (b as any).reviewedAt || (b as any).submittedAt || ""
                              if (t) return new Date(t).toLocaleString()
                              const rd = (b as any).recordDate || ""
                              const rt = (b as any).recordTime || ""
                              return `${rd} ${rt}`.trim()
                            })()}`}
                          </span>
                        </div>
                        <div className="flex gap-2">
                  <Button
                    variant="outline"
                    title="Invite shortlisted bidder to meeting"
                    disabled={(() => {
                      const alreadyInvited = getEventsByProject(id).some((e) => e.bidId === b.id && e.action === "invited")
                      return alreadyInvited
                    })()}
                    onClick={() => sendInvite(b.id)}
                  >
                    Invite Meeting
                  </Button>
                  <Button
                    variant="secondary"
                    title="Accept this bid"
                    disabled={b.status !== "Reviewed"}
                    onClick={async () => {
                      const r = await updateBidStatus(b.id, "Accepted", "manager-1")
                      if (r.ok) {
                        toast({ title: "Bid accepted", description: b.companyName })
                      } else {
                        toast({ title: "Unable to accept", description: r.error || "" })
                      }
                      try { const fn = (window as any).__refreshProjectBids; if (typeof fn === "function") await fn() } catch {}
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    title="Award contract to bidder"
                    disabled={!(b.status === "Accepted" || b.status === "Reviewed")}
                    onClick={async () => {
                      await sendAwardEmail(b.id)
                      logBidAction(b.id, "awarded")
                      try { const fn = (window as any).__refreshProjectBids; if (typeof fn === "function") await fn() } catch {}
                    }}
                  >
                    Award Contract
                  </Button>
                  <Button
                    variant="destructive"
                    title="Reject this bid"
                    onClick={async () => {
                      const r = await updateBidStatus(b.id, "Rejected", "manager-1")
                      if (r.ok) {
                        toast({ title: "Bid rejected", description: b.companyName })
                      } else {
                        toast({ title: "Unable to reject", description: r.error || "" })
                      }
                      try { const fn = (window as any).__refreshProjectBids; if (typeof fn === "function") await fn() } catch {}
                    }}
                  >
                    Reject
                  </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-center text-muted-foreground">Shortlisted bids appear here</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accepted">
            <Card className="bg-card/60 border-border/50">
              <CardContent className="pt-6">
                {(remoteBids && remoteBids.length > 0 ? remoteBids : bids).filter((b) => b.status === "Accepted").length > 0 ? (
                  (remoteBids && remoteBids.length > 0 ? remoteBids : bids)
                    .filter((b) => b.status === "Accepted")
                    .map((b) => (
                      <div key={b.id} className="flex justify-between items-center pb-3 mb-3 border-b border-border">
                        <div className="flex gap-6">
                          <span className="font-semibold">{b.companyName}</span>
                          <span>{formatNaira(b.amount)}</span>
                          <span>{b.duration} days</span>
                          <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-semibold">
                            {`Status: ${b.status} • ${(() => {
                              const t = (b as any).reviewedAt || (b as any).submittedAt || ""
                              if (t) return new Date(t).toLocaleString()
                              const rd = (b as any).recordDate || ""
                              const rt = (b as any).recordTime || ""
                              return `${rd} ${rt}`.trim()
                            })()}`}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-green-700 font-semibold">Accepted</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-center text-muted-foreground">No accepted bids yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card className="bg-card/60 border-border/50">
              <CardContent className="pt-6">
                {bids.filter((b) => b.status === "Rejected").length > 0 ? (
                  bids
                    .filter((b) => b.status === "Rejected")
                    .map((b) => (
                      <div key={b.id} className="flex justify-between items-center pb-3 mb-3 border-b border-border opacity-60">
                        <div className="flex gap-6">
                          <span className="font-semibold">{b.companyName}</span>
                          <span>{formatNaira(b.amount)}</span>
                          <span>{b.duration} days</span>
                          <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-semibold">
                            {`Status: ${b.status} • ${(() => {
                              const t = (b as any).reviewedAt || (b as any).submittedAt || ""
                              if (t) return new Date(t).toLocaleString()
                              const rd = (b as any).recordDate || ""
                              const rt = (b as any).recordTime || ""
                              return `${rd} ${rt}`.trim()
                            })()}`}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-destructive font-semibold">Rejected</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-center text-muted-foreground">No rejected bids</p>
                )}
            </CardContent>
          </Card>
          </TabsContent>

          {/* Activity Log */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle>Bid Activity</CardTitle>
              <CardDescription>Audit trail of bid actions</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {getEventsByProject(id).length > 0 ? (
                <div className="space-y-3">
                  {getEventsByProject(id).map((e) => (
                    <div key={e.id} className="flex justify-between items-center pb-2 border-b border-border/50">
                      <div className="flex gap-4">
                        <span className="font-medium capitalize">{e.action}</span>
                        <span className="text-sm text-muted-foreground">Bid ID: {e.bidId}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{new Date(e.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No activity yet</p>
              )}
            </CardContent>
          </Card>
        </Tabs>
      </main>
    </div>
  )
}

export default function ProjectDetail() {
  return (
    <ProtectedRoute requiredRole="manager">
      <ProjectDetailContent />
    </ProtectedRoute>
  )
}
