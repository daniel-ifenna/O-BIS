import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/jwt"
import { processPaymentRequest } from "@/lib/server/payment-requests"

export async function POST(request: Request) {
  try {
    const auth = request.headers.get("authorization") || ""
    const m = /^Bearer\s+(.+)$/i.exec(auth)
    if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = verifyToken(m[1])
    if (!payload || (payload.role !== "contractor" && payload.role !== "vendor")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const created = await processPaymentRequest(request, { sub: payload.sub, role: payload.role as any })
    return NextResponse.json({ ok: true, id: created.id, recordDate: created.recordDate, recordTime: created.recordTime })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to submit request") }, { status: 500 })
  }
}
