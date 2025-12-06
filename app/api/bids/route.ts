import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const items = await (prisma as any).bid.findMany({ orderBy: { submittedAt: "desc" } })
    return NextResponse.json(items)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load bids" }, { status: 500 })
  }
}
