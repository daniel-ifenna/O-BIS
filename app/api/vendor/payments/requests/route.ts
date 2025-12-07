import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/jwt"
import { processPaymentRequest } from "@/lib/server/payment-requests"

export async function POST(request: Request) {
  try {
    const auth = request.headers.get("authorization") || ""
    const authMatch = /^Bearer\s+(.+)$/i.exec(auth)
    if (!authMatch) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = verifyToken(authMatch[1])
    if (!payload || payload.role !== "vendor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const created = await processPaymentRequest(request, { sub: payload.sub, role: "vendor" })
    const response = { id: created.id, ok: true, recordDate: created.recordDate, recordTime: created.recordTime }
    return NextResponse.json(response, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to submit payment request") }, { status: 500 })
  }
}