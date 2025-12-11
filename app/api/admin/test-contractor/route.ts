import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/jwt"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"

export const dynamic = "force-dynamic"

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization") || ""
  const m = /^Bearer\s+(.+)$/i.exec(auth)
  if (!m) return false
  const payload = verifyToken(m[1])
  return payload && (payload.role === "admin" || payload.role === "ADMIN")
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  try {
    const body = await request.json().catch(() => ({}))
    const baseEmail = String(body.email || "test.contractor")
    const email = `${baseEmail}+${Date.now()}@example.com`
    const tempPassword = Math.random().toString(36).slice(2, 10) + "!A"
    const passwordHash = await hashPassword(tempPassword)
    const now = new Date()
    const y = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    const h = String(now.getHours()).padStart(2, "0")
    const min = String(now.getMinutes()).padStart(2, "0")
    const recordDate = `${y}-${mm}-${d}`
    const recordTime = `${h}:${min}`

    const user = await prisma.user.create({ data: { name: "Test Contractor", email, role: "contractor" as any, passwordHash, recordDate, recordTime } })
    const contractor = await (prisma as any).contractor.create({ data: { userId: user.id, recordDate, recordTime } })

    const project = await prisma.project.create({ data: { title: "Sample Awarded Project", location: "Test City", budget: "5000000" as any, status: "Awarded" as any, managerId: null, contractorId: contractor.id, recordDate, recordTime } })
    await prisma.milestone.create({ data: { projectId: project.id, name: "Mobilization", startDate: recordDate, endDate: recordDate, weight: 10, progress: 10, recordDate, recordTime } as any })
    await prisma.milestone.create({ data: { projectId: project.id, name: "Foundation", startDate: recordDate, endDate: recordDate, weight: 30, progress: 0, recordDate, recordTime } as any })
    await prisma.milestone.create({ data: { projectId: project.id, name: "Structure", startDate: recordDate, endDate: recordDate, weight: 60, progress: 0, recordDate, recordTime } as any })

    return NextResponse.json({ ok: true, email, tempPassword, userId: user.id, contractorId: contractor.id, projectId: project.id })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to create test contractor") }, { status: 500 })
  }
}

