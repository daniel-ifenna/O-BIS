import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { issueVerificationToken } from "@/lib/auth/reset"
import { emailService } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body?.email || "").trim().toLowerCase()
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ ok: true })
    if ((user as any).isVerified) return NextResponse.json({ ok: true })

    let last: any = null
    try {
      last = await (prisma as any).emailVerificationToken.findFirst({ where: { userId: user.id, used: false }, orderBy: { issuedAt: "desc" } })
    } catch {}
    if (!last) {
      try {
        const rows: any = await prisma.$queryRaw`SELECT "issuedAt" FROM "EmailVerificationToken" WHERE "userId"=${user.id} AND "used"=false ORDER BY "issuedAt" DESC LIMIT 1`
        if (Array.isArray(rows) && rows[0]) last = { issuedAt: rows[0].issuedAt }
      } catch {}
    }
    const nowMs = Date.now()
    const fiveMinMs = 5 * 60 * 1000
    if (last && new Date(last.issuedAt).getTime() > nowMs - fiveMinMs) {
      return NextResponse.json({ error: "Please wait before resending" }, { status: 429 })
    }

    const { token } = await issueVerificationToken(user.id)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${new URL(request.url).origin}`
    const verifyUrl = `${baseUrl}/verify?token=${encodeURIComponent(token)}`
    await emailService.sendVerificationEmail(user.email, user.name, verifyUrl)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to resend verification") }, { status: 500 })
  }
}
