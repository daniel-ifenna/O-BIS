import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: {
        status: {
          in: ["Bidding", "Published"]
        }
      },
      include: {
        bids: true
      }
    })

    const updates = []
    for (const p of projects) {
      const acceptedBid = p.bids.find((b: any) => b.status === "Accepted" || b.status === "Awarded")
      if (acceptedBid) {
        updates.push(p.title)
        await prisma.project.update({
          where: { id: p.id },
          data: { status: "Awarded" }
        })
      }
    }

    return NextResponse.json({ ok: true, updated: updates })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
