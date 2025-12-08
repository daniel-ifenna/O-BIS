import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyPassword } from "@/lib/auth/password"
import { signToken } from "@/lib/auth/jwt"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    const limit = rateLimit(ip, { limit: 5, windowMs: 60 * 1000 }) // 5 attempts per minute
    if (!limit.success) {
      return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 })
    }

    const body = await request.json()
    const { email, password } = body

    // Input validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    // Check role specific logic if role is provided in body?
    // Actually the client sends role but we should trust the DB role.
    // Admin Check: if user is trying to login as admin but role is not admin?
    // The client hook `login` passes `expectedRole`. We should verify that here?
    // Or simpler: just return the user's actual role and let the client redirect.
    // But for admin security, we might want to strictly check if they are logging into admin portal.
    // For now, standard login is fine.

    const token = signToken({ sub: user.id, role: user.role as any })
    return NextResponse.json({ token, id: user.id, name: user.name, email: user.email, role: user.role, company: user.company, isVerified: (user as any).isVerified ?? false })
  } catch (error) {
    console.error("Sign-in error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
