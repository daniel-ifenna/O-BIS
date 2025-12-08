import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth/jwt"

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization") || ""
  const m = /^Bearer\s+(.+)$/i.exec(auth)
  if (!m) return false
  const payload = verifyToken(m[1])
  return payload && payload.role === "admin"
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        user: {
          select: { name: true, email: true, isVerified: true, isActive: true }
        }
      }
    })

    // We need to aggregate stats for each vendor. 
    // This could be heavy if done one by one, but for now it's fine.
    const withStats = await Promise.all(vendors.map(async (v) => {
      const quotesCount = await prisma.vendorQuote.count({ where: { vendorId: v.id } })
      const jobsWon = await prisma.vendorQuote.count({ where: { vendorId: v.id, status: "accepted" } }) // Assuming 'accepted' status
      
      // Fees paid
      const fees = await prisma.escrowWalletTransaction.aggregate({
        where: { userId: v.userId, feeType: { in: ["quote", "bidding"] } },
        _sum: { amount: true }
      })

      return {
        id: v.id,
        userId: v.userId,
        name: v.user.name,
        email: v.user.email,
        company: v.company,
        status: v.user.isActive ? "Active" : "Suspended",
        quotesSubmitted: quotesCount,
        jobsWon,
        totalFees: fees._sum.amount || 0
      }
    }))

    return NextResponse.json(withStats)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load vendors" }, { status: 500 })
  }
}
