import { NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"
import { paymentApprovedEmail, paymentRejectedEmail, internalTransferEmail, adminDepositEmail } from "@/lib/utils/email-templates"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, type, params } = body || {}
    if (!to || !type) return NextResponse.json({ error: "to and type are required" }, { status: 400 })
    let content: { subject: string; html: string; text: string } | null = null
    switch (String(type)) {
      case "approved":
        content = paymentApprovedEmail(params || {})
        break
      case "rejected":
        content = paymentRejectedEmail(params || {})
        break
      case "transfer":
        content = internalTransferEmail(params || {})
        break
      case "admin-deposit":
        content = adminDepositEmail(params || {})
        break
      default:
        return NextResponse.json({ error: "Unknown type" }, { status: 400 })
    }
    const ok = await emailService.sendEmail({ to, subject: content.subject, html: content.html })
    return NextResponse.json({ success: !!ok })
  } catch (e) {
    return NextResponse.json({ error: "Failed to send payment notification" }, { status: 500 })
  }
}
