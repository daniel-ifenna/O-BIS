import { NextResponse } from "next/server"
import { consumeResetToken, validateResetToken } from "@/lib/auth/reset"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"

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
    const token = String(body?.token || "")
    const newPassword = String(body?.newPassword || "")
    if (!token || !newPassword) return NextResponse.json({ error: "token and newPassword are required" }, { status: 400 })

    const val = await validateResetToken(token)
    if (!val.valid || !val.userId) return NextResponse.json({ error: val.reason || "Invalid token" }, { status: 400 })

    const hash = await hashPassword(newPassword)
    const updated = await prisma.user.update({ where: { id: val.userId }, data: { passwordHash: hash } })
    await consumeResetToken(token)

    const now = new Date()
    return NextResponse.json({ ok: true, userId: updated?.id, recordDate: fmtDate(now), recordTime: fmtTime(now) })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to reset password") }, { status: 500 })
  }
}
