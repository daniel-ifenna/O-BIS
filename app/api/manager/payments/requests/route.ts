import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth/jwt"
import { maskAccountNumber } from "@/lib/security/bank"

export async function GET(request: Request) {
  try {
    const auth = request.headers.get("authorization") || ""
    const m = /^Bearer\s+(.+)$/i.exec(auth)
    if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = verifyToken(m[1])
    if (!payload || payload.role !== "manager") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const url = new URL(request.url)
    const status = url.searchParams.get("status") as any
    const where = status ? { status } : {}
    const items = await prisma.paymentRequest.findMany({ where, orderBy: { requestedAt: "desc" }, include: { user: true } })
    const normalized = items.map((r: any) => ({
      id: r.id,
      projectId: r.projectId || "",
      requesterRole: r.userType as any,
      requesterId: r.userId,
      requesterName: (r as any).user?.name || "",
      amount: String(r.amount),
      type: r.proofUrl ? "Delivery Confirmation" : "Milestone Completion",
      proofUrl: r.proofUrl || "",
      status: r.status === "APPROVED" ? "Approved" : r.status === "REJECTED" ? "Declined" : r.status === "PENDING" ? "Pending" : String(r.status),
      requestedAt: r.requestedAt?.toISOString?.() || (r.requestedAt as any) || "",
      reviewedAt: r.reviewedAt?.toISOString?.() || undefined,
      reviewedBy: r.reviewedBy || undefined,
      notes: r.rejectionReason || undefined,
      recordDate: r.recordDate || undefined,
      recordTime: r.recordTime || undefined,
      accountMasked: maskAccountNumber(r.accountNumberEnc),
    }))
    return NextResponse.json(normalized)
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to load requests") }, { status: 500 })
  }
}
