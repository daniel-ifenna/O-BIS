import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import nodemailer from "nodemailer"
import { adminDepositEmail } from "@/lib/utils/email-templates"

function mailer() {
  const host = process.env.SMTP_HOST || ""
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER || ""
  const pass = process.env.SMTP_PASS || ""
  const from = process.env.SMTP_FROM || ""
  if (!host || !user || !pass || !from) throw new Error("Missing SMTP configuration")
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
}

export async function POST(request: Request) {
  try {
    const adminKey = request.headers.get("x-admin-key") || ""
    if (!adminKey || adminKey !== (process.env.ADMIN_API_KEY || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const userId = String(body.userId || "")
    const amount = Number(String(body.amount || 0))
    const description = String(body.description || "Admin deposit to manager escrow")
    const projectId = body.projectId ? String(body.projectId) : null
    if (!userId || !amount || amount <= 0) return NextResponse.json({ error: "userId and positive amount required" }, { status: 400 })

    const now = new Date()
    const y = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    const h = String(now.getHours()).padStart(2, "0")
    const min = String(now.getMinutes()).padStart(2, "0")
    const recordDate = `${y}-${mm}-${d}`
    const recordTime = `${h}:${min}`

    const tx = await prisma.escrowWalletTransaction.create({
      data: { userId, projectId, type: "received" as any, amount: String(amount) as any, description, recordDate, recordTime },
    })

    try {
      const transport = mailer()
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (user?.email) {
        const ref = [projectId ? `Project ${projectId}` : "", description ? `Note: ${description}` : ""].filter(Boolean).join(" • ")
        const email = adminDepositEmail({ managerName: user.name || "Manager", amount, reference: ref, ctaLink: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/manager/dashboard` })
        await transport.sendMail({ from: process.env.SMTP_FROM, to: user.email, subject: email.subject, html: email.html, text: email.text })
      }
    } catch {}

    return NextResponse.json({ ok: true, transactionId: tx.id })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to deposit") }, { status: 500 })
  }
}
