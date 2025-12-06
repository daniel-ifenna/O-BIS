import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"
import { signToken } from "@/lib/auth/jwt"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, company } = body
    if (!name || !email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({ data: { name, email, role: "manager", company, passwordHash } })
    await prisma.manager.create({ data: { userId: user.id, company } })
    const token = signToken({ sub: user.id, role: "manager" })
    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

