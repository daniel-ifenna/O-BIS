import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/middleware/rbac"

export async function GET(request: Request) {
  const guard = await requireRole("contractor")(request as any)
  if (guard) return guard
  const auth = (request.headers as any).get("authorization") as string
  const m = /^Bearer\s+(.+)$/i.exec(auth || "")
  if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const token = m[1]
  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString())
  const userId = payload.sub as string
  const contractor = await prisma.contractor.findUnique({ where: { userId } })
  const projects = await prisma.project.findMany({ where: { contractorId: contractor?.id || undefined }, orderBy: { createdAt: "desc" } })
  const bids = await prisma.bid.findMany({ where: { contractorId: contractor?.id || undefined }, orderBy: { submittedAt: "desc" } })
  return NextResponse.json({ projects, bids })
}

