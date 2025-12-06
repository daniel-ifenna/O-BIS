import { NextResponse } from "next/server"
export const runtime = "nodejs"
import { emailService } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bid, ownerName, projectTitle, loginUrl, loginEmail, tempPassword, isPasswordSetup } = body || {}
    if (!bid || !bid.email || !projectTitle) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const pdf = await emailService.generateContractAwardPDF(bid, ownerName || "", projectTitle)
    const ok = await emailService.sendContractAwardEmail({
      to: bid.email,
      companyName: bid.companyName,
      projectName: projectTitle,
      estimatedBudget: Number(String(bid.amount).replace(/[^0-9.]/g, "")) || 0,
      estimatedDuration: Number(bid.duration) || 0,
      contractPdfBuffer: pdf || undefined,
      loginUrl: loginUrl || "/auth/sign-in",
      loginEmail,
      tempPassword,
      isPasswordSetup: !!isPasswordSetup,
    })
    if (!ok) {
      const html = `<div><p>Dear ${bid.bidderName},</p><p>Your bid has been accepted for ${projectTitle}.</p></div>`
      await emailService.sendEmail({ to: bid.email, subject: `Contract Award - ${projectTitle}`, html })
    }
    return NextResponse.json({ success: true, attached: Boolean(pdf) })
  } catch (e) {
    return NextResponse.json({ error: "Failed to send contract award" }, { status: 500 })
  }
}
