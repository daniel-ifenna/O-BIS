import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import type { Bid } from "@/lib/database-schema"
import { hashPassword } from "@/lib/auth/password"
import { getBidById, updateBidById, updateProjectById, createUser, createRoleProfile, sanitizeUser, findUserByEmail } from "@/lib/file-db"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { id } = await params
    const status: Bid["status"] = body?.status
    if (!status || !["New", "Reviewed", "Accepted", "Rejected", "Awarded"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    let current: any = null
    try { current = await (prisma as any).bid.findUnique({ where: { id } }) } catch {}
    if (!current) current = await getBidById(id)
    if (!current) return NextResponse.json({ error: "Bid not found" }, { status: 404 })
    if (status === "Reviewed" && current.status === "Reviewed") {
      return NextResponse.json(current)
    }
    if (status === "Awarded") {
      return NextResponse.json({ error: "Use /api/bids/:id/award for awarding" }, { status: 400 })
    }
    // Allow Reject from New or Reviewed without meeting invite
    // Allow Accept from Reviewed without meeting invite
    if (status === "Accepted" && !["Reviewed"].includes(current.status)) {
      return NextResponse.json({ error: "Only shortlisted bids can be accepted" }, { status: 400 })
    }
    const now = new Date()
    let updated: any = null
    try { updated = await (prisma as any).bid.update({ where: { id }, data: { status, reviewedAt: now } }) } catch {}
    if (!updated) updated = await updateBidById(id, { status, reviewedAt: now.toISOString() as any })
    if (!updated) return NextResponse.json({ error: "Bid not found" }, { status: 404 })

    if (status === "Accepted") {
      try {
        await (prisma as any).bid.updateMany({ where: { projectId: current.projectId, id: { not: id } }, data: { status: "Rejected" as any, reviewedAt: now } })
      } catch {
        // Fallback: reject other bids in file DB
        const projectBids = await (async () => {
          const { getBidsByProjectId } = await import("@/lib/file-db")
          return getBidsByProjectId(current.projectId)
        })()
        for (const b of projectBids) {
          if (b.id !== id) await updateBidById(b.id, { status: "Rejected" as any, reviewedAt: now.toISOString() as any })
        }
      }
      // Auto-create contractor account
      let user: any = null
      try { user = await (prisma as any).user.findUnique({ where: { email: current.email } }) } catch {}
      if (!user) {
        try { user = await findUserByEmail(current.email) } catch {}
      }
      if (!user) {
        const tempPassword = Math.random().toString(36).slice(2, 10) + "!A"
        const passwordHash = await hashPassword(tempPassword)
        try {
          user = await (prisma as any).user.create({ data: { name: current.bidderName, email: current.email, role: "contractor", company: current.companyName || null, passwordHash } })
          await (prisma as any).contractor.create({ data: { userId: user.id } })
        } catch {
          const created = await createUser({ name: current.bidderName, email: current.email, role: "contractor", company: current.companyName || undefined, passwordHash })
          await createRoleProfile(created)
          user = sanitizeUser(created)
        }
      }
      // Update project status to Active
      try {
        await (prisma as any).project.update({ where: { id: current.projectId }, data: { status: "Active" as any } })
      } catch {
        await updateProjectById(current.projectId, { status: "Active" as any })
      }
    }

    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: "Failed to update bid status" }, { status: 500 })
  }
}
