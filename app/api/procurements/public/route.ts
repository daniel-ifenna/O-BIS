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
    
    // Fallback removed to ensure clean state
    return NextResponse.json([])
  } catch (e) {
    return NextResponse.json({ error: "Failed to load procurements" }, { status: 500 })
  }
}
