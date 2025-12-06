import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth/jwt"
import nodemailer from "nodemailer"
import { depositSuccessEmail } from "@/lib/utils/transaction-emails"

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
    const auth = request.headers.get("authorization") || ""
    const m = /^Bearer\s+(.+)$/i.exec(auth)
    if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = verifyToken(m[1])
    if (!payload || payload.role !== "manager") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json().catch(() => ({}))
    const amount = Number(body.amount || 0)
    const method = String(body.method || "card")
    const currency = String(body.currency || "NGN")

    if (amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 })

    const now = new Date()
    const y = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    const h = String(now.getHours()).padStart(2, "0")
    const min = String(now.getMinutes()).padStart(2, "0")
    const recordDate = `${y}-${mm}-${d}`
    const recordTime = `${h}:${min}`

    // 1. Create Payment Record
    const payment = await prisma.payment.create({
      data: {
        userId: payload.sub,
        amount: String(amount) as any,
        currency,
        status: "COMPLETED", // Simulating instant success
        method: method as any,
        reference: `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        description: "Wallet Deposit",
        recordDate,
        recordTime,
      }
    })

    // 2. Credit Wallet
    await prisma.escrowWalletTransaction.create({
      data: {
        userId: payload.sub,
        type: "deposit" as any,
        amount: String(amount) as any,
        description: `Deposit via ${method}`,
        paymentId: payment.id,
        recordDate,
        recordTime,
      }
    })

    // 3. Send Email
    try {
      const transport = mailer()
      const user = await prisma.user.findUnique({ where: { id: payload.sub } })
      if (user?.email) {
        const email = depositSuccessEmail({ name: user.name || "Manager", amount, reference: payment.reference })
        await transport.sendMail({ from: process.env.SMTP_FROM, to: user.email, subject: email.subject, html: email.html, text: email.text })
      }
    } catch (err) {
      console.error("Email failed", err)
    }

    return NextResponse.json({ ok: true, paymentId: payment.id })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Deposit failed") }, { status: 500 })
  }
}
