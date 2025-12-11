import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth/jwt"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization") || ""
    const m = /^Bearer\s+(.+)$/i.exec(auth)
    const payload = m ? verifyToken(m[1]) : null
    if (!payload) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    let where: any = {}
    if (payload.role === "admin" || payload.role === "ADMIN") {
      // no additional filter
    } else if (payload.role === "manager" || payload.role === "MANAGER") {
      try {
        const mgr = await (prisma as any).manager.findUnique({ where: { userId: payload.sub } })
        if (mgr?.id) {
          const projects = await prisma.project.findMany({ where: { managerId: mgr.id }, select: { id: true } })
          where.projectId = { in: projects.map((p) => p.id) }
        } else {
          where.projectId = { in: [] }
        }
      } catch {
        where.projectId = { in: [] }
      }
    } else if (payload.role === "contractor" || payload.role === "CONTRACTOR") {
      try {
        const c = await (prisma as any).contractor.findUnique({ where: { userId: payload.sub } })
        where.contractorId = c?.id || "__none__"
      } catch {
        where.contractorId = "__none__"
      }
    } else {
      where = { id: "__none__" }
    }

    const items = await (prisma as any).bid.findMany({ where: Object.keys(where).length ? where : undefined, orderBy: { submittedAt: "desc" } })
    return NextResponse.json(items)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load bids" }, { status: 500 })
  }
}
