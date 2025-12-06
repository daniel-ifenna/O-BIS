import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth/jwt"
 

export async function POST(request: Request) {
  try {
    const auth = request.headers.get("authorization") || ""
    const m = /^Bearer\s+(.+)$/i.exec(auth)
    if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = verifyToken(m[1])
    if (!payload || payload.role !== "contractor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json()
    const required = ["item", "specification", "quantity", "unit", "deliveryLocation", "requestedDate"]
    for (const k of required) if (!body[k]) return NextResponse.json({ error: `${k} is required` }, { status: 400 })

    const now = new Date()
    const y = now.getFullYear()
    const mon = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    const h = String(now.getHours()).padStart(2, "0")
    const min = String(now.getMinutes()).padStart(2, "0")
    const recordDate = `${y}-${mon}-${d}`
    const recordTime = `${h}:${min}`

    const projectId: string | undefined = body.projectId ? String(body.projectId) : undefined
    const contractorId: string | undefined = body.contractorId ? String(body.contractorId) : undefined

    try {
      if (!projectId) throw new Error("Missing projectId")
      const nowIso = new Date()
      const y2 = nowIso.getFullYear()
      const m2 = String(nowIso.getMonth() + 1).padStart(2, "0")
      const d2 = String(nowIso.getDate()).padStart(2, "0")
      const h2 = String(nowIso.getHours()).padStart(2, "0")
      const min2 = String(nowIso.getMinutes()).padStart(2, "0")
      const recordDate2 = `${y2}-${m2}-${d2}`
      const recordTime2 = `${h2}:${min2}`
      const created = await prisma.procurementRequest.create({
        data: {
          projectId,
          contractorId: contractorId || null,
          item: String(body.item),
          specification: String(body.specification),
          quantity: Number(body.quantity),
          unit: String(body.unit),
          deliveryLocation: String(body.deliveryLocation),
          requestedDate: new Date(String(body.requestedDate)),
          status: "open",
          isPublic: Boolean(body.isPublic ?? true),
          recordDate: recordDate2,
          recordTime: recordTime2,
        },
      })
      return NextResponse.json(created, { status: 201 })
    } catch {
      return NextResponse.json({ error: "Failed to create procurement request" }, { status: 500 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to create procurement request") }, { status: 500 })
  }
}
