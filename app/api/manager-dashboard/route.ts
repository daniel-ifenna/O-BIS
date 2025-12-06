import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/middleware/rbac"

export async function GET(request: Request) {
  const guard = await requireRole("manager")(request as any)
  if (guard) return guard
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } })
  const bids = await prisma.bid.findMany({ orderBy: { submittedAt: "desc" } })
  const procurements = await prisma.procurementRequest.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json({ projects, bids, procurements })
}

