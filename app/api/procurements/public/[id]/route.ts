import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const item = await (prisma as any).procurementRequest.findUnique({
      where: { id },
      include: { quotes: true },
    })
    if (!item || !item.isPublic) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const normalized = {
      ...item,
      requestedDate: item.requestedDate ? new Date(item.requestedDate).toISOString().slice(0, 10) : "",
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : "",
      quotes: Array.isArray(item.quotes)
        ? item.quotes.map((q: any) => ({
            ...q,
            pricePerUnit: String(q.pricePerUnit),
            totalPrice: String(q.totalPrice),
            deliveryDate: q.deliveryDate ? new Date(q.deliveryDate).toISOString().slice(0, 10) : "",
          }))
        : [],
    }
    return NextResponse.json(normalized)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load procurement" }, { status: 500 })
  }
}
