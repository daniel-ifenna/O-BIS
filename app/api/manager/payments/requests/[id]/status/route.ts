import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth/jwt"
import nodemailer from "nodemailer"
import { paymentApprovedEmail, paymentRejectedEmail, walletDebitedEmail } from "@/lib/utils/email-templates"

function mailer() {
  const host = process.env.SMTP_HOST || ""
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER || ""
  const pass = process.env.SMTP_PASS || ""
  const from = process.env.SMTP_FROM || ""
  if (!host || !user || !pass || !from) throw new Error("Missing SMTP configuration")
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = request.headers.get("authorization") || ""
    const m = /^Bearer\s+(.+)$/i.exec(auth)
    if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = verifyToken(m[1])
    if (!payload || payload.role !== "manager") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const status = body.status as "APPROVED" | "REJECTED"
    const reason = body.reason as string | undefined
    if (!status || (status !== "APPROVED" && status !== "REJECTED")) return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    const item = await prisma.paymentRequest.findUnique({ where: { id } })
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (status === "APPROVED") {
      const now = new Date()
      const y = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, "0")
      const d = String(now.getDate()).padStart(2, "0")
      const h = String(now.getHours()).padStart(2, "0")
      const min = String(now.getMinutes()).padStart(2, "0")
      const recordDate = `${y}-${mm}-${d}`
      const recordTime = `${h}:${min}`
      await (prisma as any).$transaction([
        prisma.paymentRequest.update({ where: { id }, data: { status, reviewedAt: new Date(), reviewedBy: payload.sub, rejectionReason: null, recordDate, recordTime } }),
        prisma.escrowWalletTransaction.create({
          data: {
            userId: payload.sub,
            projectId: item.projectId || null,
            type: "withdrawn" as any,
            amount: String(item.amount) as any,
            description: `Manager debit for approval of request ${id}`,
            paymentRequestId: id,
            recordDate,
            recordTime,
          },
        }),
        prisma.escrowWalletTransaction.create({
          data: {
            userId: item.userId,
            projectId: item.projectId || null,
            type: "received" as any,
            amount: String(item.amount) as any,
            description: `Payment approved for request ${id}`,
            paymentRequestId: id,
            recordDate,
            recordTime,
          },
        }),
      ])
    } else {
      await prisma.paymentRequest.update({ where: { id }, data: { status, reviewedAt: new Date(), reviewedBy: payload.sub, rejectionReason: status === "REJECTED" ? reason : null } })
    }
    try {
      const transport = mailer()
      const user = await prisma.user.findUnique({ where: { id: item.userId } })
      if (user?.email) {
        const managerName = (await prisma.user.findUnique({ where: { id: payload.sub } }))?.name || "Manager"
        let projectRef: string | undefined = undefined
        if (item.projectId) {
          try { const p = await prisma.project.findUnique({ where: { id: item.projectId } }); projectRef = p?.title ? `Project ${p.title}` : `Project ${item.projectId}` } catch {}
        }
        const role = (user as any).role || "contractor"
        const cta = role === "vendor" ? `${process.env.NEXT_PUBLIC_BASE_URL || ""}/vendor/portal` : `${process.env.NEXT_PUBLIC_BASE_URL || ""}/contractor/wallet`
        const reference = projectRef
        const email = status === "APPROVED"
          ? paymentApprovedEmail({ recipientName: user.name || "", amount: item.amount as any, managerName, reference, ctaLink: cta })
          : paymentRejectedEmail({ recipientName: user.name || "", amount: item.amount as any, managerName, reason: reason || "N/A", reference })
        await transport.sendMail({ from: process.env.SMTP_FROM, to: user.email, subject: email.subject, html: email.html, text: email.text })
      }
      const manager = await prisma.user.findUnique({ where: { id: payload.sub } })
      if (manager?.email && status === "APPROVED") {
        const reference = item.projectId ? `Project ${item.projectId}` : undefined
        const email = walletDebitedEmail({ recipientName: manager.name || "Manager", amount: item.amount as any, managerName: manager.name || "Manager", reason: `Approved request ${id}`, reference })
        await transport.sendMail({ from: process.env.SMTP_FROM, to: manager.email, subject: email.subject, html: email.html, text: email.text })
      }
    } catch {}
    const next = await prisma.paymentRequest.findUnique({ where: { id } })
    return NextResponse.json({ ok: true, status: next?.status, recordDate: next?.recordDate, recordTime: next?.recordTime })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to update status") }, { status: 500 })
  }
}
