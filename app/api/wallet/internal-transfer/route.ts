import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth/jwt"
import nodemailer from "nodemailer"
import { internalTransferEmail, walletDebitedEmail } from "@/lib/utils/email-templates"

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
    if (!payload || payload.role !== "manager") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json().catch(() => ({}))
    const fromUserId = String(body.fromUserId || "")
    const toUserId = String(body.toUserId || "")
    const amount = Number(String(body.amount || 0))
    const description = String(body.description || "Internal wallet transfer")
    const projectId = body.projectId ? String(body.projectId) : null
    const paymentRequestId = body.paymentRequestId ? String(body.paymentRequestId) : null
    if (!fromUserId || !toUserId || !amount || amount <= 0) {
      return NextResponse.json({ error: "fromUserId, toUserId and positive amount required" }, { status: 400 })
    }

    const now = new Date()
    const y = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    const h = String(now.getHours()).padStart(2, "0")
    const min = String(now.getMinutes()).padStart(2, "0")
    const recordDate = `${y}-${mm}-${d}`
    const recordTime = `${h}:${min}`

    const FEE = 55

    // Check balance first (optional but good)
    const { calculateWalletBalance } = await import("@/lib/server/payment-requests")
    const balance = await calculateWalletBalance(fromUserId)
    if (balance < amount + FEE) {
       return NextResponse.json({ error: "Insufficient balance for transfer + fee" }, { status: 400 })
    }

    const [debit, fee, credit] = await (prisma as any).$transaction([
      prisma.escrowWalletTransaction.create({
        data: {
          userId: fromUserId,
          projectId,
          type: "withdrawn" as any,
          amount: String(amount) as any,
          description,
          paymentRequestId,
          recordDate,
          recordTime,
        },
      }),
      prisma.escrowWalletTransaction.create({
        data: {
          userId: fromUserId,
          projectId,
          type: "withdrawn" as any,
          amount: String(FEE) as any,
          description: "Internal Transfer Fee",
          paymentRequestId,
          recordDate,
          recordTime,
        },
      }),
      prisma.escrowWalletTransaction.create({
        data: {
          userId: toUserId,
          projectId,
          type: "received" as any,
          amount: String(amount) as any,
          description,
          paymentRequestId,
          recordDate,
          recordTime,
        },
      }),
    ])

    try {
      const transport = mailer()
      const [fromUser, toUser] = await Promise.all([
        prisma.user.findUnique({ where: { id: fromUserId } }),
        prisma.user.findUnique({ where: { id: toUserId } }),
      ])
      if (fromUser?.email) {
        const ref = [projectId ? `Project ${projectId}` : "", paymentRequestId ? `PaymentRequest ${paymentRequestId}` : ""].filter(Boolean).join(" • ")
        const email = walletDebitedEmail({ recipientName: fromUser.name || "Manager", amount, managerName: fromUser?.name || "Manager", reason: description, reference: ref })
        await transport.sendMail({ from: process.env.SMTP_FROM, to: fromUser.email, subject: email.subject, html: email.html, text: email.text })
      }
      if (toUser?.email) {
        const ref = [projectId ? `Project ${projectId}` : "", paymentRequestId ? `PaymentRequest ${paymentRequestId}` : ""].filter(Boolean).join(" • ")
        const role = (toUser as any).role || "contractor"
        const cta = role === "vendor" ? `${process.env.NEXT_PUBLIC_BASE_URL || ""}/vendor/portal` : `${process.env.NEXT_PUBLIC_BASE_URL || ""}/contractor/wallet`
        const email = internalTransferEmail({ recipientName: toUser.name || "Recipient", amount, managerName: fromUser?.name || "Manager", reference: ref, ctaLink: cta })
        await transport.sendMail({ from: process.env.SMTP_FROM, to: toUser.email, subject: email.subject, html: email.html, text: email.text })
      }
    } catch {}

    return NextResponse.json({ ok: true, debitId: debit.id, creditId: credit.id })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed internal transfer") }, { status: 500 })
  }
}
