import { NextResponse, NextRequest } from "next/server"
export const runtime = "nodejs"
import { prisma } from "@/lib/db"
import { promises as fs } from "fs"
import path from "path"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const items = await (prisma as any).vendorQuote.findMany({ where: { procurementId: id }, orderBy: { submittedAt: "desc" } })
    return NextResponse.json(items)
  } catch (e) {
    try {
      const { id } = await params
      const fp = path.join(process.cwd(), "data", "public_procurements.json")
      const txt = await fs.readFile(fp, "utf8")
      const arr = JSON.parse(txt)
      const item = (Array.isArray(arr) ? arr : []).find((p: any) => String(p.id) === String(id))
      const quotes = Array.isArray(item?.quotes) ? item.quotes : []
      return NextResponse.json(quotes)
    } catch {
      return NextResponse.json({ error: "Failed to load quotes" }, { status: 500 })
    }
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const required = ["vendorName", "vendorEmail", "pricePerUnit", "deliveryDays", "deliveryDate"]
    for (const k of required) if (!body[k]) return NextResponse.json({ error: `${k} is required` }, { status: 400 })
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    const h = String(now.getHours()).padStart(2, "0")
    const min = String(now.getMinutes()).padStart(2, "0")
    const recordDate = `${y}-${m}-${d}`
    const recordTime = `${h}:${min}`
    try {
      const { id } = await params
      const proc = await (prisma as any).procurementRequest.findUnique({ where: { id } })
      if (proc) {
        const created = await (prisma as any).vendorQuote.create({
          data: {
            procurementId: id,
            vendorId: body.vendorId || null,
            vendorName: String(body.vendorName),
            vendorEmail: String(body.vendorEmail),
            vendorPhone: body.vendorPhone ? String(body.vendorPhone) : null,
            pricePerUnit: String(body.pricePerUnit),
            totalPrice: body.totalPrice ? String(body.totalPrice) : String(Number(body.pricePerUnit) * Number(body.quantity || 0)),
            deliveryDays: Number.parseInt(String(body.deliveryDays)),
            deliveryDate: new Date(String(body.deliveryDate)),
            status: "pending",
            proposalUrl: body.proposalUrl || null,
            complianceScore: body.complianceScore ? Number(body.complianceScore) : null,
            notes: body.notes || null,
            recordDate,
            recordTime,
          },
        })
        const normalized = {
          ...created,
          pricePerUnit: String((created as any).pricePerUnit),
          totalPrice: String((created as any).totalPrice),
          deliveryDate: created.deliveryDate ? new Date(created.deliveryDate).toISOString().slice(0, 10) : "",
          recordDate,
          recordTime,
        }
        return NextResponse.json(normalized, { status: 201 })
      }
    } catch {}
    try {
      const { id } = await params
      const fp = path.join(process.cwd(), "data", "public_procurements.json")
      const txt = await fs.readFile(fp, "utf8")
      const arr = JSON.parse(txt)
      const idx = (Array.isArray(arr) ? arr : []).findIndex((p: any) => String(p.id) === String(id))
      if (idx < 0) return NextResponse.json({ error: "Procurement not found" }, { status: 404 })
      const created = {
        id: `vq-${Date.now()}`,
        procurementId: id,
        vendorId: body.vendorId || null,
        vendorName: String(body.vendorName),
        vendorEmail: String(body.vendorEmail),
        vendorPhone: body.vendorPhone ? String(body.vendorPhone) : null,
        pricePerUnit: String(body.pricePerUnit),
        totalPrice: body.totalPrice ? String(body.totalPrice) : String(Number(body.pricePerUnit) * Number(body.quantity || 0)),
        deliveryDays: Number.parseInt(String(body.deliveryDays)),
        deliveryDate: String(body.deliveryDate),
        status: "pending",
        proposalUrl: body.proposalUrl || null,
        complianceScore: body.complianceScore ? Number(body.complianceScore) : null,
        notes: body.notes || null,
        submittedAt: now.toISOString(),
        recordDate,
        recordTime,
      }
      const currentQuotes = Array.isArray(arr[idx].quotes) ? arr[idx].quotes : []
      arr[idx].quotes = [created, ...currentQuotes]
      await fs.writeFile(fp, JSON.stringify(arr, null, 2), "utf8")
      const normalized = {
        ...created,
        deliveryDate: new Date(String(body.deliveryDate)).toISOString().slice(0, 10),
      }
      return NextResponse.json(normalized, { status: 201 })
    } catch {
      return NextResponse.json({ error: "Failed to submit quote" }, { status: 500 })
    }
  } catch (e) {
    return NextResponse.json({ error: "Failed to submit quote" }, { status: 500 })
  }
}
