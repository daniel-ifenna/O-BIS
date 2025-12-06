import { NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, subject, html } = body || {}
    if (!to || !subject || !html) {
      return NextResponse.json({ error: "to, subject, and html are required" }, { status: 400 })
    }

    const ok = await emailService.sendEmail({ to, subject, html })
    return NextResponse.json({ success: !!ok })
  } catch (e) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
