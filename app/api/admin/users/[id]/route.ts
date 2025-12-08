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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  try {
    const body = await request.json()
    const { isActive } = body

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: Boolean(isActive) }
    })

    return NextResponse.json(user)
  } catch (e) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
