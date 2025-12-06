"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Download, Share2 } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart, Line, Scatter, ScatterChart, ReferenceLine } from "recharts"
import { useProjects } from "@/lib/project-context"
import { formatNaira } from "@/lib/currency"
import { toast } from "@/hooks/use-toast"

export default function ProjectOverview() {
  const { id: projectId } = useParams() as { id: string }
  const { getProject, setProjectStatus } = useProjects()
  const [reports, setReports] = useState<any[]>([])
  const [milestones, setMilestones] = useState<Array<{ id: string; name: string; weight: number; progress: number; status: string }>>([])
  const [loaded, setLoaded] = useState(false)
  const [refresh, setRefresh] = useState(0)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/daily-reports`)
        if (res.ok) setReports(await res.json())
      } catch {}
      try {
        const res = await fetch(`/api/projects/${projectId}/milestones`)
        if (res.ok) {
          const items = await res.json()
          setMilestones(items.map((m: any) => ({ id: m.id, name: m.name, weight: Number(m.weight) || 0, progress: Number(m.progress) || 0, status: m.status || "Pending" })))
        }
      } catch {}
      setLoaded(true)
    }
    void load()
  }, [projectId])

  const project = getProject(projectId)
  
  const created = project?.createdAt ? new Date(project.createdAt) : null
  const daysElapsed = created ? Math.max(0, Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24))) : 0
  const plannedDays = project?.acceptedBidDays ? Number(project.acceptedBidDays) : (project?.bidDays ? Number(project.bidDays) : 0)
  const summaryBudget = project?.budget ? formatNaira(project.budget) : formatNaira(0)
  const projectSummary = {
    name: project?.title || "",
    location: project?.location || "",
    budget: summaryBudget,
    contractorBudget: summaryBudget,
    daysElapsed,
    plannedDays,
    status: project?.status || "",
  }

  const totalProgress = milestones.reduce((sum, m) => sum + (m.weight * m.progress) / 100, 0)

  // Dynamic Schedule Variance (Planned vs Actual)
  const start = created || new Date()
  const toDate = (v: any) => {
    const d = new Date(v as any)
    return isNaN(d.getTime()) ? null : d
  }
  const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 24 * 60 * 60 * 1000)
  const diffDays = (a: Date, b: Date) => Math.max(0, Math.floor((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000))) + 1

  const validMilestones = milestones
    .map((m) => ({ ...m, s: toDate((m as any).startDate), e: toDate((m as any).endDate) }))
    .filter((m) => m.weight > 0 && m.s && m.e && (m.e as Date).getTime() >= (m.s as Date).getTime())

  const minStart = validMilestones.length ? validMilestones.reduce((min, m) => ((m.s as Date) < min ? (m.s as Date) : min), validMilestones[0].s as Date) : start
  const maxEnd = validMilestones.length ? validMilestones.reduce((max, m) => ((m.e as Date) > max ? (m.e as Date) : max), validMilestones[0].e as Date) : addDays(start, Math.max(0, (plannedDays || 56) - 1))
  const totalDays = Math.max(1, diffDays(minStart, maxEnd))
  const plannedWeeks = Math.max(1, Math.ceil(totalDays / 7))

  const weightSum = validMilestones.reduce((sum, m) => sum + (Number(m.weight) || 0), 0) || 100
  const normalized = validMilestones.map((m) => ({ ...m, nWeight: (Number(m.weight) || 0) * (100 / weightSum) }))

  const dailyPlanned: number[] = Array.from({ length: totalDays }, () => 0)
  normalized.forEach((m) => {
    const s = m.s as Date
    const e = m.e as Date
    const dur = Math.max(1, diffDays(s, e))
    const inc = m.nWeight / dur
    for (let i = 0; i < totalDays; i++) {
      const d = addDays(minStart, i)
      if (d.getTime() >= s.getTime() && d.getTime() <= e.getTime()) dailyPlanned[i] += inc
    }
  })
  for (let i = 1; i < dailyPlanned.length; i++) dailyPlanned[i] = Math.min(100, dailyPlanned[i] + dailyPlanned[i - 1])

  const byWeek: Record<number, number> = {}
  ;(reports || [])
    .map((r) => ({ date: new Date(r.date || start), progress: Number(r.workPercentage || 0) }))
    .forEach((r) => {
      const idx = Math.max(0, Math.floor((r.date.getTime() - (minStart as Date).getTime()) / (1000 * 60 * 60 * 24 * 7)))
      byWeek[idx] = Math.max(byWeek[idx] || 0, r.progress)
    })
  const scheduleData = Array.from({ length: plannedWeeks }).map((_, i) => {
    const dayIdx = Math.min(totalDays - 1, (i + 1) * 7 - 1)
    const planned = Math.min(100, Math.round(dailyPlanned[dayIdx] || dailyPlanned[dailyPlanned.length - 1] || 0))
    const actualPoint = byWeek[i] ?? (i > 0 ? byWeek[i - 1] ?? 0 : 0)
    const actual = Math.min(100, Math.round(actualPoint))
    return { week: `W${i + 1}`, planned, actual }
  })

  const dayScheduleData = Array.from({ length: plannedWeeks }).map((_, i) => {
    const pd = Math.max(0, Math.min(Math.max(0, plannedDays || 0), (i + 1) * 7))
    const ad = Math.max(0, Math.min(daysElapsed, (i + 1) * 7))
    return { week: `W${i + 1}`, plannedDays: pd, actualDays: ad }
  })

  const latest = scheduleData.length > 0 ? scheduleData[scheduleData.length - 1] : { planned: 0, actual: 0 }
  const spi = daysElapsed > 0 ? Math.min(1, Math.max(0, Math.min(daysElapsed, Math.max(0, plannedDays || 0)) / daysElapsed)) : 0
  const delayPct = Math.max(0, (daysElapsed > 0 ? ((daysElapsed - Math.min(daysElapsed, Math.max(0, plannedDays || 0))) / Math.max(1, Math.min(daysElapsed, Math.max(0, plannedDays || 0)))) * 100 : 0))
  const rag: "Green" | "Amber" | "Red" = spi >= 1 ? "Green" : spi >= 0.95 ? "Amber" : "Red"

  const plannedEndDate = created ? new Date(created.getTime() + Math.max(0, (plannedDays || 0)) * 24 * 60 * 60 * 1000) : null
  const remainingDays = Math.max(0, Math.max(0, plannedDays || 0) - daysElapsed)
  const plannedDaysElapsed = Math.min(daysElapsed, Math.max(0, plannedDays || 0))
  const averageVariance = daysElapsed > 0 ? (daysElapsed - plannedDaysElapsed) / daysElapsed : 0
  const readHistory = (): Array<{ timestamp: number; daysElapsed: number; plannedDays: number; actualDays: number; sv: number; rag: string }> => {
    try {
      const key = `sv_history_${projectId}`
      const arr = JSON.parse((typeof window !== "undefined" && localStorage.getItem(key)) || "[]")
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
  const useRegression = Math.abs(m) > 0.01
  const plannedTotal = Math.max(0, plannedDays || 0)
  const predSVAtEnd = useRegression ? m * plannedTotal + b : 0
  const adjustedDuration = Math.max(1, plannedTotal - predSVAtEnd)
  const predictedCompletionDayReg = adjustedDuration
  const predictedRemainingDays = Math.max(0, Math.round(predictedCompletionDayReg - daysElapsed))
  const predictedCompletionDate = new Date(Date.now() + predictedRemainingDays * 24 * 60 * 60 * 1000)
  const ragDays: "Green" | "Amber" | "Red" = (() => {
    if (!created || plannedDays <= 0) return rag
    const plannedEnd = plannedEndDate as Date
    const deltaDays = Math.max(0, Math.floor((predictedCompletionDate.getTime() - plannedEnd.getTime()) / (24 * 60 * 60 * 1000)))
    const pct = plannedDays > 0 ? (deltaDays / plannedDays) * 100 : 0
    if (pct === 0) return "Green"
    return pct <= 5 ? "Amber" : "Red"
  })()

  const seedHistory = () => {
    try {
      const key = `sv_history_${projectId}`
      const total = Math.max(28, plannedTotal || 28)
      const step = 7
      const entries: Array<{ timestamp: number; daysElapsed: number; plannedDays: number; actualDays: number; sv: number; rag: string }> = []
      for (let i = 0; i <= total; i += step) {
        const d = i
        const plannedToDate = Math.min(total, d)
        let actual = d
        if (d > total * 0.25 && d <= total * 0.6) actual = Math.max(0, Math.round(d - d * 0.05))
        if (d > total * 0.6) actual = Math.max(0, Math.round(d + d * 0.12))
        const sv = plannedToDate - actual
        const ragStr = sv >= 0 ? "green" : (sv >= -0.05 * plannedToDate ? "amber" : "red")
        entries.push({ timestamp: Date.now() - (total - d) * 24 * 60 * 60 * 1000, daysElapsed: d, plannedDays: total, actualDays: actual, sv, rag: ragStr })
      }
      if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(entries))
      setRefresh((v) => v + 1)
      toast({ title: "Seeded SV history", description: "Test data generated for visualization" })
    } catch {}
  }

  const clearHistory = () => {
    try {
      const key = `sv_history_${projectId}`
      if (typeof window !== "undefined") localStorage.removeItem(key)
      setRefresh((v) => v + 1)
      toast({ title: "SV history cleared", description: "Local history removed" })
    } catch {}
  }

  const histSorted = hist.slice().sort((a, b) => a.daysElapsed - b.daysElapsed)
  const getActualAt = (x: number) => {
    let val = 0
    for (let i = 0; i < histSorted.length; i++) {
      const h = histSorted[i]
      if (h.daysElapsed <= x) val = h.actualDays
      else break
    }
    return val
  }
  const getSvAt = (x: number) => {
    let val = 0
    for (let i = 0; i < histSorted.length; i++) {
      const h = histSorted[i]
      if (h.daysElapsed <= x) val = h.sv
      else break
    }
    return val
  }
  const step = 7
  const trendData = Array.from({ length: Math.max(1, Math.ceil(Math.max(1, plannedTotal) / step) + 1) }).map((_, i) => {
    const x = Math.min(plannedTotal, i * step)
    const planned = Math.min(plannedTotal, x)
    const regressionSv = m * x + b
    const actual = Math.min(plannedTotal, Math.max(0, planned - getSvAt(x)))
    const regression = Math.min(plannedTotal, Math.max(0, planned - regressionSv))
    return { x, planned, regression, actual }
  })

  const ScatterTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    const p = payload[0]
    const y = p?.value
    const x = p?.payload?.x
    const ragVal = p?.payload?.rag
    const svVal = typeof p?.payload?.sv === "number" ? p?.payload?.sv : null
    return (
      <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, padding: 8 }}>
        <div style={{ fontWeight: 600 }}>Days Elapsed: {x}</div>
        <div>SV: {y}</div>
        {svVal != null && <div>SV (stored): {svVal}</div>}
        {ragVal && <div>RAG: {String(ragVal).toUpperCase()}</div>}
      </div>
    )
  }

  const TrendTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    const planned = (payload.find((p: any) => p.dataKey === "planned")?.value ?? 0) as number
    const actual = (payload.find((p: any) => p.dataKey === "actual")?.value ?? 0) as number
    const spiVal = actual > 0 ? planned / actual : 0
    const delayVal = planned > 0 ? ((planned - actual) / planned) * 100 : 0
    return (
      <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, padding: 8 }}>
        <div>Planned: {Math.round(planned)} days</div>
        <div>Actual: {Math.round(actual)} days</div>
        <div>SPI: {spiVal.toFixed(2)}</div>
        <div>Delay: {delayVal.toFixed(1)}%</div>
      </div>
    )
  }

  useEffect(() => {
    try {
      const key = `sv_history_${projectId}`
      const svNow = Math.max(0, Math.min(plannedDaysElapsed, daysElapsed)) - daysElapsed
      const ragNow = svNow >= 0 ? "green" : (svNow >= -0.05 * Math.max(1, plannedDaysElapsed) ? "amber" : "red")
      const entry = { timestamp: Date.now(), daysElapsed, plannedDays: Math.max(0, plannedDays || 0), actualDays: daysElapsed, sv: svNow, rag: ragNow }
      const prev = JSON.parse((typeof window !== "undefined" && localStorage.getItem(key)) || "[]")
      const next = [entry, ...Array.isArray(prev) ? prev : []].slice(0, 200)
      if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(next))
    } catch {}
    if (rag === "Amber") {
      toast({ title: "Schedule alert", description: `Slight delay detected (${delayPct}%). Monitor closely.` })
    } else if (rag === "Red") {
      toast({ title: "Schedule risk", description: `Significant delay (${delayPct}%). Immediate action required.` })
    }
  }, [projectId, latest.planned, latest.actual, delayPct, rag])

  useEffect(() => {
    if (Math.round(totalProgress) >= 100) setProjectStatus(projectId, "Completed")
  }, [totalProgress, projectId, setProjectStatus])

  // Activity Log
  const activityLog = [
    {
      id: 1,
      date: "2025-01-20",
      milestone: "Excavation & Foundation",
      description: "Completed foundation excavation. All safety inspections passed.",
      reporter: "BuildCorp Inc - Crew A",
      photos: 2,
    },
    {
      id: 2,
      date: "2025-01-19",
      milestone: "Excavation & Foundation",
      description: "Concrete foundation pour completed. Weather conditions favorable.",
      reporter: "BuildCorp Inc - Crew A",
      photos: 3,
    },
    {
      id: 3,
      date: "2025-01-18",
      milestone: "Excavation & Foundation",
      description: "Steel reinforcement installation in progress. 75% complete.",
      reporter: "BuildCorp Inc - Crew B",
      photos: 1,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/manager/project/${projectId}`}>
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Project Overview</h1>
              <p className="text-sm text-muted-foreground">{projectSummary.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = `/api/reports/project-overview/${projectId}/pdf`
                fetch(url)
                  .then(async (res) => {
                    if (!res.ok) return
                    const blob = await res.blob()
                    const link = document.createElement("a")
                    link.href = URL.createObjectURL(blob)
                    link.download = `Project_Overview_${(projectSummary.name || "Project").replace(/[^a-z0-9_-]+/gi, "_")}.pdf`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  })
                  .catch(() => {})
              }}
            >
              <Download className="w-4 h-4 mr-1" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                try {
                  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
                  const title = `Project Overview – ${projectSummary.name || "Project"}`
                  if ((navigator as any).share) {
                    ;(navigator as any).share({ title, url: shareUrl })
                  } else if ((navigator as any).clipboard && shareUrl) {
                    ;(navigator as any).clipboard.writeText(shareUrl)
                    toast({ title: "Link copied", description: "Project overview link copied to clipboard" })
                  }
                } catch {}
              }}
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Overall Progress - Prominent Display */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 mb-8">
          <CardContent className="pt-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Overall Project Progress</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-primary">{Math.round(totalProgress)}%</span>
                  <span className="text-sm text-muted-foreground">Complete</span>
                </div>
              </div>
              <div>
                <Progress value={totalProgress} className="h-4 mb-4" />
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Days Elapsed</p>
                    <p className="font-semibold">
                      {projectSummary.daysElapsed}/{projectSummary.plannedDays}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Budget</p>
                    <p className="font-semibold">{projectSummary.budget}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-semibold text-accent">{projectSummary.status}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm mt-4">
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
                    <p className="font-semibold">{ragDays}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">SPI</p>
                    <p className="font-semibold">{spi.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="milestones" className="space-y-6">
          <TabsList>
            <TabsTrigger value="milestones">Milestone Tracker</TabsTrigger>
            <TabsTrigger value="variance">Schedule Variance</TabsTrigger>
            <TabsTrigger value="activities">Activity Log</TabsTrigger>
          </TabsList>

          {/* Milestones Tab */}
          <TabsContent value="milestones">
            <Card className="bg-card/60 border-border/50">
              <CardHeader>
                <CardTitle>Weighted Milestone Tracker</CardTitle>
                <CardDescription>Weight % | Actual Progress % | Weighted Contribution | Status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="pb-4 border-b border-border last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-semibold">{milestone.name}</p>
                          <div className="flex gap-6 mt-1 text-sm text-muted-foreground">
                            <span>Weight: {milestone.weight}%</span>
                            <span>Progress: {milestone.progress}%</span>
                            <span className="font-semibold text-primary">
                              Contribution: {((milestone.weight * milestone.progress) / 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              milestone.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : milestone.status === "In Progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {milestone.status}
                          </span>
                        </div>
                      </div>
                      <Progress value={milestone.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Variance Tab */}
          <TabsContent value="variance">
            <Card className="bg-card/60 border-border/50">
              <CardHeader>
                <CardTitle>Schedule Variance: Planned vs Actual Progress</CardTitle>
                <CardDescription>Comparison of planned vs actual cumulative progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                {process.env.NODE_ENV !== "production" && (
                  <div className="flex justify-end gap-2 mb-4">
                    <Button variant="outline" size="sm" onClick={seedHistory}>Seed SV History</Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        try {
                          const key = `sv_history_${projectId}`
                          const total = Math.max(28, plannedTotal || 28)
                          const stepLocal = 7
                          const entries: Array<{ timestamp: number; daysElapsed: number; plannedDays: number; actualDays: number; sv: number; rag: string }> = []
                          for (let i = 0; i <= total; i += stepLocal) {
                            const d = i
                            const plannedToDate = Math.min(total, d)
                            const actualDaysTaken = Math.round(d + (d > total * 0.3 ? d * 0.08 : 0) + (d > total * 0.7 ? d * 0.12 : 0))
                            const svVal = plannedToDate - actualDaysTaken
                            const ragStrLocal = svVal >= 0 ? "green" : (svVal >= -0.05 * plannedToDate ? "amber" : "red")
                            entries.push({ timestamp: Date.now() - (total - d) * 24 * 60 * 60 * 1000, daysElapsed: d, plannedDays: total, actualDays: actualDaysTaken, sv: svVal, rag: ragStrLocal })
                          }
                          const prev = JSON.parse((typeof window !== "undefined" && localStorage.getItem(key)) || "[]")
                          const next = [...entries, ...Array.isArray(prev) ? prev : []].slice(0, 300)
                          if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(next))
                          setRefresh((v) => v + 1)
                          toast({ title: "Seeded validity SV history", description: "Delayed trend generated for verification" })
                        } catch {}
                      }}
                    >
                      Seed Validity Test
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearHistory}>Clear SV History</Button>
                  </div>
                )}
                
                <div className="w-full h-64 mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" dataKey="x" domain={[0, plannedTotal]} />
                      <YAxis type="number" domain={[0, plannedTotal]} />
                      <Tooltip content={<TrendTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="planned" stroke="hsl(var(--primary))" strokeWidth={2} name="Planned" dot={{ r: 2 }} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="regression" stroke="hsl(var(--accent))" strokeWidth={2} name="Regression" dot={{ r: 2 }} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual" dot={{ r: 2 }} activeDot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full h-64 mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" dataKey="x" name="Days Elapsed" />
                      <YAxis type="number" dataKey="y" name="SV (planned - actual)" />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<ScatterTooltip />} />
                      <Legend />
                      <Scatter name="Green" data={hist.filter((h) => h.rag === "green").map((h) => ({ x: h.daysElapsed, y: h.sv, sv: h.sv, rag: h.rag }))} fill="#16a34a" />
                      <Scatter name="Amber" data={hist.filter((h) => h.rag === "amber").map((h) => ({ x: h.daysElapsed, y: h.sv, sv: h.sv, rag: h.rag }))} fill="#f59e0b" />
                      <Scatter name="Red" data={hist.filter((h) => h.rag === "red").map((h) => ({ x: h.daysElapsed, y: h.sv, sv: h.sv, rag: h.rag }))} fill="#dc2626" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                
                <div className={`mt-4 p-4 rounded-lg ${rag === "Green" ? "bg-green-100 text-green-800" : rag === "Amber" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                  <p className="text-sm">
                    Status: {rag} • Delay: {delayPct.toFixed(1)}% • SPI: {spi.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activities">
            <Card className="bg-card/60 border-border/50">
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Chronological posts with descriptions, milestones, and visual proof</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {loaded && reports.length === 0 ? (
                    <p className="text-center text-muted-foreground">No daily activities yet</p>
                  ) : (
                    reports.map((r) => (
                      <div key={r.id} className="pb-6 border-b border-border last:border-0">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-lg">Progress: {r.workPercentage}%</p>
                            <p className="text-sm text-muted-foreground">{r.date} {r.time}</p>
                          </div>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {Array.isArray(r.attachments) ? r.attachments.length : 0} photos
                          </span>
                        </div>
                        <p className="text-foreground mb-3">{r.workDescription}</p>
                        <p className="text-xs text-muted-foreground mb-3">Reported by: <span className="font-semibold text-foreground">{r.crew}</span></p>
                        {Array.isArray(r.attachments) && r.attachments.length > 0 && (
                          <div className="flex gap-2">
                            {r.attachments.map((name: string, i: number) => (
                              <div key={i} className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground hover:bg-primary/10 cursor-pointer transition-colors">
                                {name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
