import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, company } = body
    if (!name || !email || !password) return NextResponse.json({ error: "Name, email, password required" }, { status: 400 })
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    const passwordHash = await hashPassword(password)
    const now = new Date()
    const recordDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
    const recordTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    const user = await prisma.user.create({ data: { name, email, role: "contractor", company, passwordHash, recordDate, recordTime } })
    await prisma.contractor.create({ data: { userId: user.id, recordDate, recordTime } })
    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role, company: user.company })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
