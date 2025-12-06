import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth/jwt"
import nodemailer from "nodemailer"
import { withdrawRequestEmail } from "@/lib/utils/transaction-emails"
import { calculateWalletBalance } from "@/lib/server/payment-requests"

function mailer() {
  const host = process.env.SMTP_HOST || ""
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER || ""
  const pass = process.env.SMTP_PASS || ""
  // Use GMAIL_USER if SMTP_FROM is not set
  const from = process.env.SMTP_FROM || process.env.GMAIL_USER || ""
  
  if (!host && !user) {
    // Try Gmail fallback
    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASSWORD
    if (gmailUser && gmailPass) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass }
      })
    }
  }

  if (!host || !user || !pass || !from) throw new Error("Missing SMTP configuration")
  
  return nodemailer.createTransport({ 
    host, 
    port, 
    secure: port === 465, 
    auth: { user, pass },
    // Add timeouts to match main email service
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  })
}

export async function POST(request: Request) {
  try {
    const auth = request.headers.get("authorization") || ""
    const m = /^Bearer\s+(.+)$/i.exec(auth)
    if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = verifyToken(m[1])
    if (!payload) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json().catch(() => ({}))
    const amount = Number(body.amount || 0)
    const bankName = String(body.bankName || "")
    const accountNumber = String(body.accountNumber || "")

    if (amount <= 0 || !bankName || !accountNumber) {
      return NextResponse.json({ error: "Invalid details" }, { status: 400 })
    }

    // Check balance
    const balance = await calculateWalletBalance(payload.sub)
    if (balance < amount) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 })
    }

    const now = new Date()
    const y = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    const h = String(now.getHours()).padStart(2, "0")
    const min = String(now.getMinutes()).padStart(2, "0")
    const recordDate = `${y}-${mm}-${d}`
    const recordTime = `${h}:${min}`

    // 1. Create Payment Record (Pending Payout)
    const payment = await prisma.payment.create({
      data: {
        userId: payload.sub,
        amount: String(amount) as any,
        currency: "NGN",
        status: "PENDING",
        method: "bank_transfer",
        reference: `WTH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        description: `Withdrawal to ${bankName} - ${accountNumber}`,
        metadata: { bankName, accountNumber },
        recordDate,
        recordTime,
      }
    })

    // 2. Debit Wallet (Lock funds)
    await prisma.escrowWalletTransaction.create({
      data: {
        userId: payload.sub,
        type: "withdrawn" as any, // or create a 'locked' type if you prefer
        amount: String(amount) as any,
        description: `Withdrawal Request ${payment.reference}`,
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
        const email = withdrawRequestEmail({ name: user.name || "User", amount, bankName, accountNumber })
        await transport.sendMail({ from: process.env.SMTP_FROM, to: user.email, subject: email.subject, html: email.html, text: email.text })
      }
    } catch (err) {
      console.error("Email failed", err)
    }

    return NextResponse.json({ ok: true, paymentId: payment.id })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Withdrawal failed") }, { status: 500 })
  }
}
