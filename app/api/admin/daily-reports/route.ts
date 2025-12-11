import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/jwt"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization") || ""
  const m = /^Bearer\s+(.+)$/i.exec(auth)
  if (!m) return false
  const payload = verifyToken(m[1])
  return payload && (payload.role === "admin" || payload.role === "ADMIN")
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const url = new URL(request.url)
  const projectId = url.searchParams.get("projectId") || undefined
  try {
    const where: any = {}
    if (projectId) where.projectId = projectId
    const items = await (prisma as any).dailyReport.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 })
    const projects = await prisma.project.findMany({ where: { id: { in: Array.from(new Set(items.map((r: any) => r.projectId))) } }, select: { id: true, title: true } })
    const contractors = await (prisma as any).contractor.findMany({ where: { id: { in: Array.from(new Set(items.map((r: any) => r.contractorId))) } }, include: { user: true } })
    const projectTitle: Record<string, string> = {}
    for (const p of projects) projectTitle[String(p.id)] = p.title
    const contractorName: Record<string, string> = {}
    for (const c of contractors) contractorName[String(c.id)] = c.user?.name || "Contractor"
    const normalized = items.map((r: any) => ({ id: r.id, projectId: r.projectId, project: projectTitle[String(r.projectId)] || String(r.projectId), contractorId: r.contractorId, contractor: contractorName[String(r.contractorId)] || String(r.contractorId), date: r.date, time: r.time, workDescription: r.workDescription, workPercentage: r.workPercentage, crew: r.crew, qaIssues: r.qaIssues, safetyIncidents: r.safetyIncidents }))
    return NextResponse.json(normalized)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load daily reports" }, { status: 500 })
  }
}

