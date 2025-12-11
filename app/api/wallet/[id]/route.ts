import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/jwt"
import { prisma } from "@/lib/db"
import { calculateWalletBalance } from "@/lib/server/payment-requests"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = request.headers.get("authorization") || ""
    const m = /^Bearer\s+(.+)$/i.exec(auth)
    const payload = m ? verifyToken(m[1]) : null
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const isSelf = payload.sub === id
    const isAdmin = String(payload.role).toLowerCase() === "admin"
    if (!isSelf && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const balance = await calculateWalletBalance(id)
    const recent = await prisma.escrowWalletTransaction.findMany({ where: { userId: id }, orderBy: { date: "desc" }, take: 10 })
    return NextResponse.json({ balance, recent })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to load wallet") }, { status: 500 })
  }
}

