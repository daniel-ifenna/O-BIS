import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { issueResetToken } from "@/lib/auth/reset"
import { EmailService } from "@/lib/email-service"

function fmtDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function fmtTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${h}:${min}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body?.email || "").trim().toLowerCase()
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { email } })
    // Always respond success to avoid account enumeration
    if (!user) return NextResponse.json({ ok: true })

    const { token, recordDate, recordTime } = await issueResetToken(user.id)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${new URL(request.url).origin}`
    const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`

    const es = new EmailService()
    await es.sendPasswordResetEmail(user.email, user.name, resetUrl)

    return NextResponse.json({ ok: true, recordDate, recordTime })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to process request") }, { status: 500 })
  }
}

