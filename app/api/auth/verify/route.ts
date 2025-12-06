import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateVerificationToken, consumeVerificationToken } from "@/lib/auth/reset"

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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const token = String(url.searchParams.get("token") || "")
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 })

    const val = await validateVerificationToken(token)
    if (!val.valid || !val.userId) {
      console.warn("Verification attempt failed:", val.reason)
      return NextResponse.json({ error: val.reason || "Invalid token" }, { status: 400 })
    }

    const updated = await prisma.user.update({ where: { id: val.userId }, data: { isVerified: true } })
    await consumeVerificationToken(token)
    const now = new Date()
    return NextResponse.json({ ok: true, userId: updated.id, recordDate: fmtDate(now), recordTime: fmtTime(now) })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to verify") }, { status: 500 })
  }
}
