import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyPassword } from "@/lib/auth/password"
import { signToken } from "@/lib/auth/jwt"
import { findUserByEmail } from "@/lib/file-db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body
    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    let user: any = null
    try {
      user = await prisma.user.findUnique({ where: { email } })
    } catch {}
    if (!user) {
      try { user = await findUserByEmail(email) } catch {}
    }
    if (!user || user.role !== "manager") return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    const ok = await verifyPassword(password, user.passwordHash)
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    const token = signToken({ sub: user.id, role: "manager" })
    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
