import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { calculateWalletBalance } from "@/lib/server/payment-requests"
import { verifyToken } from "@/lib/auth/jwt"

function isAuthorized(payload: any, userId: string): boolean {
  if (!payload) return false
  if (payload.sub === userId) return true
  if (payload.role === "manager") return true
  return false
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const auth = request.headers.get("authorization") || ""
    const m = /^Bearer\s+(.+)$/i.exec(auth)
    if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = verifyToken(m[1])
    const { userId } = await params
    if (!isAuthorized(payload, userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const [balance, pendingAgg] = await Promise.all([
      calculateWalletBalance(userId),
      prisma.paymentRequest.aggregate({ where: { userId, status: "PENDING" as any }, _sum: { amount: true } }),
    ])
    const pending = Number(pendingAgg._sum.amount || 0)
    return NextResponse.json({ userId, balance, pending })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to load wallet summary") }, { status: 500 })
  }
}
