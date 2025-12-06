import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyPassword } from "@/lib/auth/password"
import { signToken } from "@/lib/auth/jwt"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body
    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.role !== "vendor") return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    const ok = await verifyPassword(password, user.passwordHash)
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    const token = signToken({ sub: user.id, role: "vendor" })
    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, isVerified: (user as any).isVerified ?? false } })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
