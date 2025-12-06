import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createFirebaseStorageFromEnv } from "@/lib/storage"

export async function POST(request: Request) {
  try {
    const adminKey = (request.headers as any).get("x-admin-key") || ""
    const requiredKey = process.env.ADMIN_API_KEY || ""
    if (!requiredKey || adminKey !== requiredKey) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    ;(process.env as any).ALLOW_DELETE = "true"

    const files = await prisma.fileStorageRecord.findMany()
    try {
      const storage = createFirebaseStorageFromEnv()
      for (const f of files) {
        if (f.path) {
          try { await storage.delete(f.path) } catch {}
        }
      }
    } catch {}

    const counts: Record<string, number> = {}

    const safe = async <T>(fn: () => Promise<T>, key: keyof typeof counts) => {
      try {
        const r: any = await fn()
        counts[String(key)] = Number((r?.count as any) || 0)
      } catch {
        counts[String(key)] = 0
      }
    }
    await safe(() => prisma.bidInvitation.deleteMany(), "bidInvitations")
    await safe(() => prisma.vendorQuote.deleteMany(), "vendorQuotes")
    await safe(() => prisma.dailyReport.deleteMany(), "dailyReports")
    await safe(() => prisma.milestone.deleteMany(), "milestones")
    await safe(() => prisma.paymentRequest.deleteMany(), "paymentRequests")
    await safe(() => prisma.bid.deleteMany(), "bids")
    await safe(() => prisma.procurementRequest.deleteMany(), "procurements")
    await safe(() => prisma.escrowWalletTransaction.deleteMany(), "escrowTransactions")
    await safe(() => prisma.fileStorageRecord.deleteMany(), "fileStorageRecords")
    await safe(() => prisma.project.deleteMany(), "projects")

    // Keep admin accounts
    const adminEmails = String(process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean)
    await safe(() => prisma.passwordResetToken.deleteMany(), "passwordResetTokens")
    await safe(() => prisma.vendor.deleteMany(), "vendors")
    await safe(() => prisma.contractor.deleteMany(), "contractors")
    await safe(() => prisma.manager.deleteMany(), "managers")
    try {
      counts.users = (await prisma.user.deleteMany({ where: adminEmails.length ? { email: { notIn: adminEmails } } : {} })).count
    } catch {
      counts.users = 0
    }

    return NextResponse.json({ ok: true, counts })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to purge") }, { status: 500 })
  }
}
