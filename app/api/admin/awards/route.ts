import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/jwt"
import { prisma } from "@/lib/db"
import { getAwardRecords } from "@/lib/file-db"

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
    const records = await getAwardRecords()
    const filtered = projectId ? records.filter(r => String(r.projectId) === String(projectId)) : records
    return NextResponse.json(filtered)
  } catch (e) {
    try {
      const where: any = {}
      if (projectId) where.projectId = projectId
      const items = await (prisma as any).contractAward.findMany({ where, orderBy: { createdAt: "desc" } })
      return NextResponse.json(items)
    } catch {
      return NextResponse.json({ error: "Failed to load awards" }, { status: 500 })
    }
  }
}

