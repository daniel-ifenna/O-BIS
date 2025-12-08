import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth/jwt"
import { getCache, setCache } from "@/lib/cache"

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization") || ""
    const m = /^Bearer\s+(.+)$/i.exec(auth)
    if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = verifyToken(m[1])
    if (!payload || payload.role !== "manager") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const managerUserId = payload.sub
    const cacheKey = `manager_dashboard_summary_${managerUserId}`
    const cached = getCache(cacheKey)
    if (cached) return NextResponse.json(cached)

    // Find manager record
    const manager = await prisma.manager.findUnique({ where: { userId: managerUserId } })
    if (!manager) return NextResponse.json({ reports: {}, milestones: {} })

    const projects = await prisma.project.findMany({
      where: { managerId: manager.id },
      select: { id: true }
    })
    
    const projectIds = projects.map(p => p.id)

    // Fetch reports summary (latest 3 per project)
    // Prisma doesn't support "limit per group" easily in one query without raw SQL.
    // We'll fetch last 50 reports total and group them in JS for now, or just fetch for each (but strictly limited).
    // Better: Fetch all recent reports for these projects in one go.
    const recentReports = await prisma.dailyReport.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { createdAt: "desc" },
      take: 20 // Global recent reports
    })

    // Fetch milestones for progress calculation
    const milestones = await prisma.milestone.findMany({
      where: { projectId: { in: projectIds } },
      select: { projectId: true, weight: true, progress: true }
    })

    // Aggregate
    const reportsByProject: Record<string, any[]> = {}
    const progressByProject: Record<string, number> = {}

    // Init progress
    projectIds.forEach(id => progressByProject[id] = 0)

    // Process Milestones
    const milestonesMap: Record<string, any[]> = {}
    milestones.forEach(m => {
      if (!milestonesMap[m.projectId]) milestonesMap[m.projectId] = []
      milestonesMap[m.projectId].push(m)
    })

    Object.keys(milestonesMap).forEach(pid => {
      const items = milestonesMap[pid]
      const total = Math.round(items.reduce((sum: number, it: any) => sum + (Number(it.weight || 0) * Number(it.progress || 0)) / 100, 0))
      progressByProject[pid] = total
    })

    // Process Reports (just mapping global recent ones, or we can do a better job)
    // The frontend expects reportsByProject[pid] = array of reports.
    // Let's populate it from the recent 20.
    recentReports.forEach(r => {
      if (!reportsByProject[r.projectId]) reportsByProject[r.projectId] = []
      if (reportsByProject[r.projectId].length < 3) {
        reportsByProject[r.projectId].push(r)
      }
    })

    const result = { reports: reportsByProject, milestones: progressByProject }
    setCache(cacheKey, result, 30) // Cache for 30s
    return NextResponse.json(result)

  } catch (e: any) {
    return NextResponse.json({ error: "Failed to load summary" }, { status: 500 })
  }
}
