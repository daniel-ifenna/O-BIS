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

  const url = new URL(request.url)
  const role = url.searchParams.get("role") || undefined
  const query = url.searchParams.get("q") || ""

  try {
    const users = await prisma.user.findMany({
      where: {
        role: role as any,
        OR: query ? [
          { name: { contains: query } },
          { email: { contains: query } }
        ] : undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        createdAt: true,
        // We can't select 'isVerified' directly if it's not on User model in schema, 
        // but assuming it's related or we just return basic info.
        // If isVerified is on Contractor/Vendor/Manager profile, we need to join.
        // For simplicity, just return User fields.
      },
      orderBy: { createdAt: "desc" },
      take: 100
    })

    return NextResponse.json(users)
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
