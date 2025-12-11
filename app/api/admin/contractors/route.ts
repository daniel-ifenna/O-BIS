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
  const q = (url.searchParams.get("q") || "").trim()
  try {
    const users = await prisma.user.findMany({ where: { role: "contractor", OR: q ? [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] : undefined }, select: { id: true, name: true, email: true, company: true } })
    const contractorProfiles = await (prisma as any).contractor.findMany({ where: { userId: { in: users.map(u => u.id) } } })
    const projects = await prisma.project.findMany({ where: { contractorId: { in: contractorProfiles.map((c: any) => c.id) } }, select: { id: true, title: true, status: true, budget: true, managerId: true, contractorId: true } })
    const managers = await (prisma as any).manager.findMany({ where: { id: { in: projects.map(p => p.managerId).filter(Boolean) } }, include: { user: true } })
    const bids = await prisma.bid.findMany({ where: { contractorId: { in: contractorProfiles.map((c: any) => c.id) } }, select: { id: true, projectId: true, contractorId: true, status: true, uploads: true } })
    const daily = await (prisma as any).dailyReport.findMany({ where: { contractorId: { in: contractorProfiles.map((c: any) => c.id) } } })
    const files = await (prisma as any).fileStorageRecord.findMany({ where: { bidId: { in: bids.map(b => b.id) } } })
    const managerById: Record<string, any> = {}
    for (const m of managers) managerById[String(m.id)] = m
    const activeProjects = projects.filter(p => p.status === "Awarded" || p.status === "In Progress")
    const byContractor: Record<string, any> = {}
    for (const u of users) {
      const c = contractorProfiles.find((x: any) => x.userId === u.id)
      const cId = c?.id
      const myProjects = projects.filter(p => String(p.contractorId) === String(cId))
      const myActive = activeProjects.filter(p => String(p.contractorId) === String(cId))
      const myBids = bids.filter(b => String(b.contractorId) === String(cId))
      const myFiles = files.filter((f: any) => myBids.some(b => b.id === f.bidId))
      const myDaily = daily.filter((r: any) => String(r.contractorId) === String(cId))
      const avgProgress = (() => {
        try { const arr = myDaily.map((r: any) => Number(r.workPercentage || 0)); return arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : 0 } catch { return 0 }
      })()
      const compliance = myBids.some(b => Array.isArray((b as any).uploads?.tax) && (b as any).uploads.tax.length > 0) ? "compliant" : "missing-tax"
      const contracts = myProjects.map(p => ({ id: p.id, title: p.title, status: p.status, budget: p.budget, manager: managerById[String(p.managerId)]?.user?.name || "" }))
      byContractor[String(u.id)] = { id: u.id, name: u.name, email: u.email, company: u.company, documents: myFiles.length, bidsSubmitted: myBids.length, contractsAwarded: myProjects.length, activeJobs: myActive.length, avgProgress, compliance, contracts }
    }
    return NextResponse.json(Object.values(byContractor))
  } catch (e) {
    return NextResponse.json({ error: "Failed to load contractors" }, { status: 500 })
  }
}

