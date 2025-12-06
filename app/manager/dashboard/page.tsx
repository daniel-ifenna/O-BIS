"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Eye, Send, Check, Home, LogOut, AlertTriangle, MessageSquare } from "lucide-react"
import { CreateProjectModal } from "@/components/create-project-modal"
import { useProjects } from "@/lib/project-context"
import { useBids } from "@/lib/bid-context"
import { useAuth } from "@/lib/auth-context"
import { useComplaints } from "@/lib/complaint-context"
import { toast } from "@/hooks/use-toast"
import { formatNaira } from "@/lib/currency"

 

function ManagerDashboardContent() {
  const { projects, addProject, setSelectedProjectId, getProject, deleteProject } = useProjects()
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { getComplaintsByManager } = useComplaints()
  const allComplaints = user ? getComplaintsByManager(user.id) : []
  const openComplaints = allComplaints.filter((c) => c.status === "open")
  const pendingComplaints = allComplaints.filter((c) => c.status === "open" || c.status === "investigating")

  const handleProjectCreate = async (newProject: any) => {
    const res = await addProject(newProject)
    if (res?.ok) {
      setIsCreateModalOpen(false)
    }
    return res
  }

  const { bids } = useBids()
  const recentBids = [...bids].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).reverse()
  const [lastSeenBidTs, setLastSeenBidTs] = useState<number>(0)

  useEffect(() => {
    const latest = recentBids[0] ? new Date(recentBids[0].submittedAt).getTime() : 0
    if (latest > 0 && lastSeenBidTs === 0) {
      setLastSeenBidTs(latest)
      return
    }
    if (latest > lastSeenBidTs) {
      const top = recentBids[0]
      if (top) {
        const projTitle = getProject(top.projectId)?.title || `Project ${top.projectId}`
        toast({ title: "New bid submitted", description: `${top.companyName} • ${projTitle}` })
      }
      setLastSeenBidTs(latest)
    }
  }, [recentBids])

  const procurementRequests: any[] = []

  const paymentRequests: any[] = []

  const [recentReports, setRecentReports] = useState<Record<string, any[]>>({})
  const [milestoneSummary, setMilestoneSummary] = useState<Record<string, number>>({})
  useEffect(() => {
    const load = async () => {
      try {
        const reportsByProject: Record<string, any[]> = {}
        const progressByProject: Record<string, number> = {}
        for (const p of projects) {
          const pid = String(p.id)
          try {
            const r = await fetch(`/api/projects/${pid}/daily-reports`)
            if (r.ok) {
              const arr = await r.json()
              reportsByProject[pid] = arr.slice(0, 3)
            }
          } catch {}
          try {
            const m = await fetch(`/api/projects/${pid}/milestones`)
            if (m.ok) {
              const items = await m.json()
              const total = Math.round(items.reduce((sum: number, it: any) => sum + (Number(it.weight || 0) * Number(it.progress || 0)) / 100, 0))
              progressByProject[pid] = total
            }
          } catch {}
        }
        setRecentReports(reportsByProject)
        setMilestoneSummary(progressByProject)
      } catch {}
    }
    void load()
  }, [projects])

  

  const getStatusBadge = (status: string, type = "default") => {
    if (type === "procurement") {
      switch (status) {
        case "pending":
          return (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
              Pending Quotes
            </span>
          )
        case "quoted":
          return (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">Quotes Received</span>
          )
        case "awarded":
          return (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">Vendor Selected</span>
          )
        default:
          return null
      }
    }
    if (type === "payment") {
      return (
        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">Pending Approval</span>
      )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
              title="Go to home"
            >
              <Home className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Manager Portal</h1>
              <p className="text-sm text-muted-foreground">Manage projects and bids</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.company}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
              <Button variant="outline" size="sm" onClick={signOut} className="gap-2 bg-transparent">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {pendingComplaints.length > 0 && (
          <Card className="bg-destructive/10 border-destructive/30 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="font-semibold text-destructive">Contractor Complaints</p>
                    <p className="text-sm text-destructive/80">
                      {openComplaints.length} new complaint(s) requiring your attention
                    </p>
                  </div>
                </div>
                <Link href="/manager/complaints">
                  <Button size="sm" className="bg-destructive hover:bg-destructive/90">
                    Review Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="bids">Recent Bids</TabsTrigger>
            <TabsTrigger value="reports">Recent Daily Reports</TabsTrigger>
            <TabsTrigger value="milestones">Milestone Summary</TabsTrigger>
            <TabsTrigger value="procurement">Procurement Requests</TabsTrigger>
            <TabsTrigger value="payments">Payment Approvals</TabsTrigger>
            <TabsTrigger value="complaints">Complaints ({allComplaints.length})</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <div className="grid gap-4">
              {(projects.filter((p: any) => !p.contractorId) as any[]).map((project) => (
                <Card
                  key={project.id}
                  className="bg-card/60 border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedProjectId(project.id)
                  }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle>{project.title}</CardTitle>
                        <CardDescription>{project.location}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{formatNaira(Number(project.budget || 0))}</p>
                        <p className="text-xs text-muted-foreground">{bids.filter((b) => String(b.projectId) === String(project.id)).length} bids received</p>
                        <p className="text-xs font-semibold text-accent mt-1">Overall Progress: {milestoneSummary[String(project.id)] ?? 0}%</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Bids Received</p>
                          <p className="font-semibold">{bids.filter((b) => String(b.projectId) === String(project.id)).length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Created</p>
                          <p className="font-semibold text-sm">{project.createdAt}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/manager/project/${project.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/manager/project/${project.id}`)}>
                          <Send className="w-4 h-4 mr-1" />
                          Manage
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log("Dashboard Delete clicked", project.id)
                            const ok = typeof window !== "undefined" ? window.confirm("Permanently delete this project?") : true
                            if (!ok) return
                            deleteProject(project.id)
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bids Tab */}
          <TabsContent value="bids" className="space-y-4">
            {recentBids.length > 0 ? (
              recentBids.map((bid) => (
                <Card key={bid.id} className="bg-card/60 border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-semibold">{bid.companyName}</p>
                        <p className="text-sm text-muted-foreground">
                          {getProject(bid.projectId)?.title || `Project ${bid.projectId}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(bid.submittedAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="text-lg font-bold text-accent">{formatNaira(bid.amount)}</p>
                        <p className={`text-xs font-semibold ${bid.status === "New" ? "text-accent" : "text-muted-foreground"}`}>
                          {bid.status}
                        </p>
                      </div>
                      <Link href={`/manager/project/${bid.projectId}`}>
                        <Button variant="outline" size="sm">
                          <Check className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </Link>
                    </div>
  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No recent bids</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Procurement Tab */}
          <TabsContent value="procurement" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold">Active Procurement Requests</h3>
                <p className="text-sm text-muted-foreground">Review and approve vendor quotes</p>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>

            {procurementRequests.length > 0 ? (
              procurementRequests.map((req) => (
                <Card key={req.id} className="bg-card/60 border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{req.item}</p>
                        <p className="text-sm text-muted-foreground">{req.project}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Quantity: {req.quantity} {req.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(req.status, "procurement")}
                        <p className="text-sm mt-2 font-semibold">{req.quotes} quotes</p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2 pt-4 border-t border-border">
                      <Link href={`/manager/procurement/${req.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Eye className="w-4 h-4 mr-1" />
                          Review Quotes
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Send className="w-4 h-4 mr-1" />
                        Approve Vendor
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No active procurement requests</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card className="bg-card/60 border-border/50 mb-4">
              <CardContent className="pt-6">
                <div className="flex justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div>
                    <p className="font-semibold">Escrow Balance</p>
                    <ManagerBalance />
                  </div>
                  <Link href="/manager/payments">
                    <Button variant="outline">View All</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {paymentRequests.length > 0 ? (
              paymentRequests.map((payment) => (
                <Card key={payment.id} className="bg-card/60 border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold">{payment.requester}</p>
                        <p className="text-sm text-muted-foreground">{payment.project}</p>
                        <p className="text-xs text-muted-foreground mt-1">Milestone: {payment.milestone}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(payment.status, "payment")}
                        <p className="text-lg font-bold text-primary mt-2">{formatNaira(payment.amount)}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2 pt-4 border-t border-border">
                      <Link href={`/manager/payments/${payment.id}/review`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Check className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No pending payment requests</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Recent Daily Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            {projects.length > 0 ? (
              projects.map((project) => (
                <Card key={project.id} className="bg-card/60 border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{project.title}</p>
                        <p className="text-xs text-muted-foreground">Last 3 reports</p>
                      </div>
                      <Link href={`/manager/project/${project.id}/overview`}>
                        <Button variant="outline" size="sm">View Overview</Button>
                      </Link>
                    </div>
                    <div className="mt-3 space-y-2">
                      {(recentReports[String(project.id)] || []).length > 0 ? (
                        (recentReports[String(project.id)] || []).map((r, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span>{r.date} {r.time} • {r.workDescription}</span>
                            <span className="text-primary font-semibold">{r.workPercentage}%</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No reports</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No projects</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Milestone Summary Tab */}
          <TabsContent value="milestones" className="space-y-4">
            {projects.length > 0 ? (
              projects.map((project) => (
                <Card key={project.id} className="bg-card/60 border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{project.title}</p>
                        <p className="text-xs text-muted-foreground">Weighted progress</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{milestoneSummary[String(project.id)] ?? 0}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No projects</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Complaints Tab */}
          <TabsContent value="complaints" className="space-y-4">
            {allComplaints.length > 0 ? (
              <div className="grid gap-4">
                {allComplaints.map((complaint) => (
                  <Card key={complaint.id} className="bg-card/60 border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{complaint.subject}</h3>
                          <p className="text-sm text-muted-foreground">From: {complaint.contractorName}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Category: {complaint.category.replace("-", " ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded block mb-2 ${
                              complaint.status === "open"
                                ? "bg-red-100 text-red-800"
                                : complaint.status === "resolved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {complaint.status}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded block ${
                              complaint.severity === "critical"
                                ? "bg-destructive/20 text-destructive"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {complaint.severity}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{complaint.description}</p>
                      <Link href={`/manager/complaints/${complaint.id}`}>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Review & Respond
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No complaints filed by contractors</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleProjectCreate}
      />
    </div>
  )
}

function ManagerBalance() {
  const { user } = useAuth()
  const [bal, setBal] = useState<number | null>(null)
  useEffect(() => {
    const run = async () => {
      if (!user?.id) return
      const token = (typeof window !== "undefined" && (localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("managerToken") || "")) || ""
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`/api/wallet/${user.id}`, { headers })
      if (res.ok) {
        const data = await res.json()
        setBal(Number(data.balance || 0))
      }
    }
    void run()
  }, [user?.id])
  return (
    <div>
      <p className="text-2xl font-bold text-primary">{bal == null ? "Loading..." : formatNaira(bal)}</p>
      <p className="text-xs text-muted-foreground mt-1 mb-3">This is a virtual wallet. Deposits are now supported via API simulation.</p>
      <Link href="/manager/wallet/deposit">
        <Button size="sm" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
          <Plus className="w-3 h-3 mr-1" />
          Deposit Funds
        </Button>
      </Link>
    </div>
  )
}

import { ProtectedRoute } from "@/lib/protected-route"

export default function ManagerDashboard() {
  return (
    <ProtectedRoute requiredRole="manager">
      <ManagerDashboardContent />
    </ProtectedRoute>
  )
}
