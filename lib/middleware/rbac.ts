import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/jwt"

export function requireRole(role: "manager" | "contractor") {
  return async function (request: NextRequest) {
    const auth = request.headers.get("authorization") || ""
    const m = /^Bearer\s+(.+)$/i.exec(auth)
    if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = verifyToken(m[1])
    if (!payload || payload.role !== role) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return null
  }
}

