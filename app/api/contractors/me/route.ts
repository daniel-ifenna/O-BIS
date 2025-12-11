import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/jwt"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization") || ""
    const m = /^Bearer\s+(.+)$/i.exec(auth)
    if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = verifyToken(m[1])
    if (!payload || (payload.role !== "contractor" && payload.role !== "CONTRACTOR")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const userId = payload.sub
    const c = await (prisma as any).contractor.findUnique({ where: { userId } })
    if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ contractorId: c.id })
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

