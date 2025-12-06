import { NextResponse } from "next/server"
export const runtime = "nodejs"
import { prisma } from "@/lib/db"
import { promises as fs } from "fs"
import path from "path"

export async function GET() {
  try {
    const items = await (prisma as any).procurementRequest.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: "desc" },
      include: { quotes: true },
    })
    const normalized = items.map((p: any) => ({
      ...p,
      requestedDate: p.requestedDate ? new Date(p.requestedDate).toISOString().slice(0, 10) : "",
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : "",
      quotes: Array.isArray(p.quotes)
        ? p.quotes.map((q: any) => ({
            ...q,
            pricePerUnit: String(q.pricePerUnit),
            totalPrice: String(q.totalPrice),
            deliveryDate: q.deliveryDate ? new Date(q.deliveryDate).toISOString().slice(0, 10) : "",
          }))
        : [],
    }))
    if (normalized.length > 0) return NextResponse.json(normalized)
    try {
      const fp = path.join(process.cwd(), "data", "public_procurements.json")
      const txt = await fs.readFile(fp, "utf8")
      const arr = JSON.parse(txt)
      const mapped = (Array.isArray(arr) ? arr : []).filter((p: any) => !!p.isPublic).map((p: any) => ({
        ...p,
        requestedDate: p.requestedDate ? String(p.requestedDate).slice(0, 10) : "",
        createdAt: p.createdAt ? String(p.createdAt) : "",
        quotes: Array.isArray(p.quotes)
          ? p.quotes.map((q: any) => ({
              ...q,
              pricePerUnit: String(q.pricePerUnit),
              totalPrice: String(q.totalPrice),
              deliveryDate: q.deliveryDate ? String(q.deliveryDate).slice(0, 10) : "",
            }))
          : [],
      }))
      return NextResponse.json(mapped)
    } catch {}
    return NextResponse.json([])
  } catch (e) {
    return NextResponse.json({ error: "Failed to load procurements" }, { status: 500 })
  }
}
