import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth/jwt"

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization") || ""
  const m = /^Bearer\s+(.+)$/i.exec(auth)
  if (!m) return false
  const payload = verifyToken(m[1])
  return payload && payload.role === "admin"
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const transactions = await prisma.escrowWalletTransaction.findMany({
      include: {
        user: { select: { name: true, email: true, role: true } },
        project: { select: { title: true } }
      },
      orderBy: { date: "desc" },
      take: 200 // Limit for performance
    })

    const normalized = transactions.map(t => ({
      id: t.id,
      user: t.user.name,
      email: t.user.email,
      role: t.user.role,
      type: t.type,
      feeType: t.feeType,
      amount: t.amount,
      date: t.date,
      description: t.description,
      project: t.project?.title || "-"
    }))

    return NextResponse.json(normalized)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load transactions" }, { status: 500 })
  }
}
