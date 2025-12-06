import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"
import { emailService } from "@/lib/email-service"
import { issueVerificationToken } from "@/lib/auth/reset"
import { findUserByEmail, createUser, createRoleProfile, sanitizeUser } from "@/lib/file-db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, company } = body

    // Input validation
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Name, email, password, and role are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Validate role
    const validRoles = ["manager", "vendor", "contractor"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const hasDb = Boolean(process.env.DATABASE_URL_PGBOUNCER || process.env.DATABASE_URL)
    if (hasDb) {
      try {
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 })
        const passwordHash = await hashPassword(password)
        const now = new Date()
        const recordDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
        const recordTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
        const user = await prisma.user.create({ data: { name, email, role, company, passwordHash, recordDate, recordTime } })
        if (role === "manager") {
          await prisma.manager.create({ data: { userId: user.id, company: company || null, recordDate, recordTime } })
        } else if (role === "contractor") {
          await prisma.contractor.create({ data: { userId: user.id, recordDate, recordTime } })
        } else if (role === "vendor") {
          await prisma.vendor.create({ data: { userId: user.id, company: company || null, recordDate, recordTime } })
        }
        try {
          const { token } = await issueVerificationToken(user.id)
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${new URL(request.url).origin}`
          const verifyUrl = `${baseUrl}/verify?token=${encodeURIComponent(token)}`
          const ok = await emailService.sendVerificationEmail(user.email, user.name, verifyUrl)
          if (!ok) {
            console.warn("Verification email not sent (email service not ready)")
          }
        } catch (e) {
          console.error("Failed to issue verification token or send email:", e)
        }
        return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role, company: user.company, isVerified: (user as any).isVerified ?? false })
      } catch {
        // Fallback to file DB when Prisma is unreachable
        const existing = await findUserByEmail(email)
        if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 })
        const passwordHash = await hashPassword(password)
        const created = await createUser({ name, email, role, company, passwordHash })
        await createRoleProfile(created)
        const user = sanitizeUser(created)
        return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role, company: (user as any).company, isVerified: (user as any).isVerified ?? false })
      }
    } else {
      const existing = await findUserByEmail(email)
      if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 })
      const passwordHash = await hashPassword(password)
      const created = await createUser({ name, email, role, company, passwordHash })
      await createRoleProfile(created)
      const user = sanitizeUser(created)
      return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role, company: (user as any).company, isVerified: (user as any).isVerified ?? false })
    }
  } catch (error) {
    const msg = (error as any)?.message ? String((error as any).message) : "Internal server error"
    console.error("Sign-up error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
