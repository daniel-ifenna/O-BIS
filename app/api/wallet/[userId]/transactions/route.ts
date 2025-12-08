import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"
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

    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") || "0")
    const limit = Number(url.searchParams.get("limit") || "50")
    const skip = page > 0 ? (page - 1) * limit : 0
    const take = limit

    const items = await prisma.escrowWalletTransaction.findMany({ 
      where: { userId }, 
      orderBy: { date: "desc" },
      skip: page > 0 ? skip : undefined,
      take: page > 0 ? take : undefined,
    })
    return NextResponse.json(items)
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to load transactions") }, { status: 500 })
  }
}
