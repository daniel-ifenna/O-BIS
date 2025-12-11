import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth/jwt"

export const dynamic = "force-dynamic"

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization") || ""
  const m = /^Bearer\s+(.+)$/i.exec(auth)
  if (!m) return false
  const payload = verifyToken(m[1])
  return payload && payload.role === "admin"
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || ""
  const role = searchParams.get("role") || ""

  try {
    const where: any = {}
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ]
    }
    if (role) {
      where.role = role
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        manager: {
          select: { subscriptionPlan: true }
        },
        vendor: {
          select: { company: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    })

    const normalized = users.map(u => ({
      ...u,
      subscriptionPlan: u.manager?.subscriptionPlan || null,
      company: u.vendor?.company || u.manager?.company || null
    }))

    return NextResponse.json(normalized)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 })
  }
}
