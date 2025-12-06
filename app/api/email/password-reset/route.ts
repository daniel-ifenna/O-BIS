import { NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, name, url } = body || {}
    if (!to || !name || !url) return NextResponse.json({ error: "to, name, url are required" }, { status: 400 })
    const ok = await emailService.sendPasswordResetEmail(to, name, url)
    return NextResponse.json({ success: !!ok })
  } catch (e) {
    return NextResponse.json({ error: "Failed to send password reset email" }, { status: 500 })
  }
}
