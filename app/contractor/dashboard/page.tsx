"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Plus, CheckCircle, Clock, AlertCircle, Home, AlertTriangle, MessageSquare } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useProjects } from "@/lib/project-context"
import { useComplaints } from "@/lib/complaint-context"
import { ResponsiveContainer, ComposedChart, Line, CartesianGrid, XAxis, YAxis, Legend, Tooltip, ScatterChart, Scatter } from "recharts"
import { toast } from "@/hooks/use-toast"

 

function ContractorDashboardContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { getComplaintsByContractor } = useComplaints()
  const { projects, getProjectsByContractor } = useProjects()

  const complaints = user ? getComplaintsByContractor(user.id) : []
  const openComplaints = complaints.filter((c) => c.status === "open").length
  const acknowledgedComplaints = complaints.filter(
    (c) => c.status === "acknowledged" || c.status === "investigating",
  ).length

  const [assignedProjects, setAssignedProjects] = useState<any[]>([])
  useEffect(() => {
    const load = async () => {
      if (!user?.id) return
      try {
        const token = (typeof window !== "undefined" && (localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("contractorToken") || "")) || ""
        const res = await fetch("/api/contractors/me", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        let contractorId: string | null = null
        if (res.ok) {
          const me = await res.json()
          contractorId = me?.contractorId || null
        }
        const list = contractorId ? getProjectsByContractor(contractorId) : []
        setAssignedProjects(list)
      } catch {
        setAssignedProjects([])
      }
    }
    void load()
  }, [user?.id, projects])

  const [milestones, setMilestones] = useState<Array<{ id: string | number; name: string; weight: number; progress: number; status: string; startDate: string; endDate: string }>>([])
  const [reports, setReports] = useState<any[]>([])
  useEffect(() => {
    const load = async () => {
      const pid = assignedProjects[0]?.id
      if (!pid) return
      try {
        const res = await fetch(`/api/projects/${pid}/milestones`)
        if (res.ok) {
          const items = await res.json()
          setMilestones(
            items.map((m: any) => ({ id: m.id, name: m.name, weight: m.weight, progress: m.progress, status: m.status, startDate: m.startDate, endDate: m.endDate })),
          )
        }
      } catch {}
      try {
        const res = await fetch(`/api/projects/${pid}/daily-reports`)
        if (res.ok) setReports(await res.json())
      } catch {}
    }
    void load()
  }, [assignedProjects])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "In Progress":
        return <Clock className="w-5 h-5 text-primary" />
      case "Pending":
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />
      default:
        return null
    }
  }

  const calculateTotalProgress = () => {
    const totalWeighted = milestones.reduce((sum, m) => sum + (m.weight * m.progress) / 100, 0)
    return Math.round(totalWeighted)
  }

  // Simplified schedule metrics (read-only for contractors)
  const project = assignedProjects[0]
  const created = project?.createdAt ? new Date(project.createdAt) : null
  const daysElapsed = created ? Math.max(0, Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24))) : 0
  const plannedDays = project?.acceptedBidDays ? Number(project.acceptedBidDays) : (project?.bidDays ? Number(project.bidDays) : 0)
  const plannedDaysElapsed = Math.min(daysElapsed, Math.max(0, plannedDays || 0))
  const spi = daysElapsed > 0 ? Math.min(1, Math.max(0, plannedDaysElapsed / daysElapsed)) : 0
  const svDays = plannedDaysElapsed - daysElapsed
  const rag: "Green" | "Amber" | "Red" = spi >= 1 ? "Green" : spi >= 0.95 ? "Amber" : "Red"
  const plannedEndDate = created ? new Date(created.getTime() + Math.max(0, (plannedDays || 0)) * 24 * 60 * 60 * 1000) : null

  // SV history from manager-side (local history) for trend-only prediction
  const readHistory = (): Array<{ timestamp: number; daysElapsed: number; plannedDays: number; actualDays: number; sv: number; rag: string }> => {
    try {
      const key = project ? `sv_history_${project.id}` : ""
      const arr = JSON.parse((typeof window !== "undefined" && key && localStorage.getItem(key)) || "[]")
      const out: Array<{ timestamp: number; daysElapsed: number; plannedDays: number; actualDays: number; sv: number; rag: string }> = []
      if (Array.isArray(arr)) {
        for (const e of arr) {
          const ts = Number(e?.timestamp || Date.parse(e?.ts || "")) || Date.now()
          const dEl = Number(e?.daysElapsed ?? e?.actualDays ?? 0)
          const pEl = Number(e?.plannedDays ?? 0)
          const aEl = Number(e?.actualDays ?? 0)
          const sv = Number(e?.sv ?? (pEl - aEl))
          const ragStr = String(e?.rag || "")
          out.push({ timestamp: ts, daysElapsed: dEl, plannedDays: pEl, actualDays: aEl, sv, rag: ragStr.toLowerCase() })
        }
      }
      return out
    } catch {
      return []
    }
  }
  const hist = readHistory()
  const xs = hist.map((h) => h.daysElapsed)
  const ys = hist.map((h) => h.sv)
  const mean = (arr: number[]) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0)
  const xBar = mean(xs)
  const yBar = mean(ys)
  const num = xs.reduce((s, x, i) => s + (x - xBar) * ((ys[i] ?? 0) - yBar), 0)
  const den = xs.reduce((s, x) => s + (x - xBar) * (x - xBar), 0)
  const m = den !== 0 ? num / den : 0
  const b = yBar - m * xBar
  const plannedTotal = Math.max(0, plannedDays || 0)
  const predSVAtEnd = Math.abs(m) > 0.01 ? m * plannedTotal + b : 0
  const adjustedDuration = Math.max(1, plannedTotal - predSVAtEnd)
  const predictedRemainingDays = Math.max(0, Math.round(adjustedDuration - daysElapsed))
  const predictedCompletionDate = new Date(Date.now() + predictedRemainingDays * 24 * 60 * 60 * 1000)

  // Build simplified line chart data: Planned vs Actual progress by weeks
  const plannedWeeks = Math.max(1, Math.ceil(Math.max(1, plannedTotal) / 7))
  const byWeek: Record<number, number> = {}
  ;(reports || [])
    .map((r) => ({ date: new Date(r.date || created || Date.now()), progress: Number(r.workPercentage || 0) }))
    .forEach((r) => {
      if (!created) return
      const idx = Math.max(0, Math.floor((r.date.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 7)))
      byWeek[idx] = Math.max(byWeek[idx] || 0, r.progress)
    })
  const lineData = Array.from({ length: plannedWeeks }).map((_, i) => {
    const plannedPct = plannedTotal > 0 ? Math.min(100, Math.round(((Math.min((i + 1) * 7, plannedTotal)) / plannedTotal) * 100)) : 0
    const actualPct = Math.min(100, Math.round(byWeek[i] ?? (i > 0 ? byWeek[i - 1] ?? 0 : 0)))
    return { week: `W${i + 1}`, planned: plannedPct, actual: actualPct }
  })

  // Optional SV scatter points (no regression line)
  const svPoints = hist.map((h) => ({ x: h.daysElapsed, y: h.sv, rag: h.rag }))

  // Alerts for Amber/Red only, without technical details
  useEffect(() => {
    const daysBehind = svDays < 0 ? Math.abs(svDays) : 0
    if (daysBehind >= 3) {
      if (rag === "Amber") {
        toast({ title: "Schedule alert", description: "Project delayed by 3+ days. Please align with the manager." })
      } else if (rag === "Red") {
        toast({ title: "Schedule risk", description: "Project delayed by 3+ days. Immediate action needed with the manager." })
      }
    }
  }, [rag, svDays])

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-accent/10 border-b border-accent/30 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-accent">
          <AlertTriangle className="w-4 h-4" />
          <span>Preview Mode: Sign in to access full contractor features</span>
        </div>
      </div>

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
              <h1 className="text-2xl font-bold text-foreground">Contractor Dashboard</h1>
              <p className="text-sm text-muted-foreground">Track projects and milestones</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/contractor/milestones">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Define Milestones
              </Button>
            </Link>
            <Link href="/contractor/daily-report">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Daily Report
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {openComplaints > 0 && (
          <Card className="bg-destructive/10 border-destructive/30 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="font-semibold text-destructive">Active Complaints</p>
                    <p className="text-sm text-destructive/80">{openComplaints} issue(s) awaiting manager response</p>
                  </div>
                </div>
                <Link href="/contractor/complaints">
                  <Button size="sm" className="bg-destructive hover:bg-destructive/90">
                    View Complaints
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overall Progress */}
        {assignedProjects.length > 0 ? (
          <Card className="bg-card/60 border-border/50 mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Overall Project Progress</CardTitle>
                  <CardDescription>{assignedProjects[0].title}</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{calculateTotalProgress()}%</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={calculateTotalProgress()} className="h-3" />
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-semibold">{assignedProjects[0].location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold">{assignedProjects[0].status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bids Received</p>
                  <p className="font-semibold">{assignedProjects[0].bids}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-semibold text-sm">{assignedProjects[0].createdAt}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Planned End</p>
                  <p className="font-semibold">{plannedEndDate ? plannedEndDate.toLocaleDateString() : "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Predicted Completion</p>
                  <p className="font-semibold">{predictedCompletionDate ? predictedCompletionDate.toLocaleDateString() : "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">RAG (Schedule)</p>
                  <p className="font-semibold">{rag}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Days Behind</p>
                  <p className="font-semibold">{svDays < 0 ? Math.abs(svDays) : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card/60 border-border/50 mb-8">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No assigned projects</p>
            </CardContent>
          </Card>
        )}

        {/* Milestones */}
        <Tabs defaultValue="milestones" className="space-y-6">
          <TabsList>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="reports">Recent Reports</TabsTrigger>
            <TabsTrigger value="procurement">Procurement</TabsTrigger>
            <TabsTrigger value="complaints">Complaints ({complaints.length})</TabsTrigger>
          </TabsList>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-4">
            {milestones.length > 0 ? (
              <div className="grid gap-4">
                {milestones.map((milestone) => (
                  <Card key={milestone.id} className="bg-card/60 border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <div className="flex items-center justify-center">{getStatusIcon(milestone.status)}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">{milestone.name}</p>
                              <p className="text-xs text-muted-foreground">{milestone.startDate} — {milestone.endDate}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">{milestone.weight}% of project</p>
                              <p className="text-xl font-bold text-primary">{milestone.progress}%</p>
                            </div>
                          </div>
                          <Progress value={milestone.progress} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No milestones defined</p>
                  <div className="mt-4">
                    <Link href="/contractor/milestones">
                      <Button variant="outline">Define Milestones</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <Card className="bg-card/60 border-border/50">
              <CardHeader>
                <CardTitle>Planned vs Actual Progress</CardTitle>
                <CardDescription>Simplified timeline of planned work vs actual progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="week" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="planned" stroke="hsl(var(--primary))" strokeWidth={2} name="Planned" dot={{ r: 2 }} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual" dot={{ r: 2 }} activeDot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                {svPoints.length > 0 && (
                  <div className="w-full h-64 mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" dataKey="x" name="Days Elapsed" />
                        <YAxis type="number" dataKey="y" name="SV (planned - actual)" />
                        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                        <Legend />
                        <Scatter name="Green" data={svPoints.filter((p: any) => p.rag === "green")} fill="#16a34a" />
                        <Scatter name="Amber" data={svPoints.filter((p: any) => p.rag === "amber")} fill="#f59e0b" />
                        <Scatter name="Red" data={svPoints.filter((p: any) => p.rag === "red")} fill="#dc2626" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className={`mt-4 p-4 rounded-lg ${rag === "Green" ? "bg-green-100 text-green-800" : rag === "Amber" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                  <p className="text-sm">Status: {rag} • Predicted Completion: {predictedCompletionDate ? predictedCompletionDate.toLocaleDateString() : "—"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className="bg-card/60 border-border/50">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No daily reports yet. Create your first report.</p>
                <div className="mt-4 text-center">
                  <Link href="/contractor/daily-report">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Report
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Procurement Tab */}
          <TabsContent value="procurement">
            <Card className="bg-card/60 border-border/50">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No active procurement requests</p>
                <div className="mt-4 text-center">
                  <Link href="/contractor/procurement/create">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Request Materials
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="complaints" className="space-y-4">
            {complaints.length > 0 ? (
              <div className="grid gap-4">
                {complaints.map((complaint) => (
                  <Card key={complaint.id} className="bg-card/60 border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-foreground">{complaint.subject}</h3>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            complaint.status === "open"
                              ? "bg-red-100 text-red-800"
                              : complaint.status === "resolved"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {complaint.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{complaint.description.substring(0, 100)}...</p>
                      <Link href={`/contractor/complaints/${complaint.id}`}>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No complaints filed</p>
                  <div className="mt-4 text-center">
                    <Link href="/contractor/complaints/create">
                      <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        File Complaint
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function ContractorDashboard() {
  return <ContractorDashboardContent />
}
