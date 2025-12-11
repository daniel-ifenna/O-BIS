import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/jwt"
import { prisma } from "@/lib/db"
import { getInternalTransferRequests, updateInternalTransferRequest, getAdminControls, setAdminControls } from "@/lib/file-db"

export const dynamic = "force-dynamic"

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization") || ""
  const m = /^Bearer\s+(.+)$/i.exec(auth)
  if (!m) return false
  const payload = verifyToken(m[1])
  return payload && (payload.role === "admin" || payload.role === "ADMIN")
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  try {
    const pending = await getInternalTransferRequests()
    const logsRaw = await prisma.escrowWalletTransaction.findMany({ include: { user: { select: { name: true, email: true, role: true } }, project: { select: { title: true } } }, orderBy: { date: "desc" }, take: 200 })
    const logs = logsRaw.map((t: any) => ({ id: t.id, user: t.user?.name, email: t.user?.email, role: t.user?.role, type: t.type, feeType: t.feeType, amount: t.amount, date: t.date, description: t.description, project: t.project?.title || "-" }))
    const controls = await getAdminControls()
    return NextResponse.json({ controls, pending, logs })
  } catch {
    return NextResponse.json({ error: "Failed to load transfers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const url = new URL(request.url)
  const action = url.searchParams.get("action") || ""
  try {
    if (action === "freeze") {
      const body = await request.json().catch(() => ({}))
      const next = await setAdminControls({ freezeInternalTransfers: Boolean(body.freeze), suspiciousAmountThreshold: Number(body.threshold || 0) || undefined })
      return NextResponse.json({ ok: true, controls: next })
    }
    if (action === "approve" || action === "decline") {
      const body = await request.json().catch(() => ({}))
      const id = String(body.id || "")
      const reqItem = (await getInternalTransferRequests()).find((r) => r.id === id)
      if (!reqItem) return NextResponse.json({ error: "Not found" }, { status: 404 })
      if (action === "decline") {
        const updated = await updateInternalTransferRequest(id, { status: "declined", approvedAt: new Date().toISOString() })
        return NextResponse.json({ ok: true, request: updated })
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
      await (prisma as any).$transaction([
        prisma.escrowWalletTransaction.create({ data: { userId: reqItem.fromUserId, projectId: reqItem.projectId || null, type: "withdrawn" as any, amount: String(reqItem.amount) as any, description: reqItem.description, paymentRequestId: reqItem.paymentRequestId || null, recordDate, recordTime } }),
        prisma.escrowWalletTransaction.create({ data: { userId: reqItem.fromUserId, projectId: reqItem.projectId || null, type: "withdrawn" as any, amount: String(FEE) as any, description: "Internal Transfer Fee", paymentRequestId: reqItem.paymentRequestId || null, recordDate, recordTime } }),
        prisma.escrowWalletTransaction.create({ data: { userId: reqItem.toUserId, projectId: reqItem.projectId || null, type: "received" as any, amount: String(reqItem.amount) as any, description: reqItem.description, paymentRequestId: reqItem.paymentRequestId || null, recordDate, recordTime } }),
      ])
      const updated = await updateInternalTransferRequest(id, { status: "approved", approvedAt: new Date().toISOString() })
      return NextResponse.json({ ok: true, request: updated })
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to update transfers") }, { status: 500 })
  }
}
