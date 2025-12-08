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
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Revenue aggregations by fee type
    const [
      publishingFees,
      biddingFees,
      quoteFees,
      transferFees,
      subscriptionFees,
      totalTransacted
    ] = await Promise.all([
      prisma.escrowWalletTransaction.aggregate({ where: { feeType: "publishing" }, _sum: { amount: true } }),
      prisma.escrowWalletTransaction.aggregate({ where: { feeType: "bidding" }, _sum: { amount: true } }),
      prisma.escrowWalletTransaction.aggregate({ where: { feeType: "quote" }, _sum: { amount: true } }),
      prisma.escrowWalletTransaction.aggregate({ where: { feeType: "transfer" }, _sum: { amount: true } }),
      prisma.escrowWalletTransaction.aggregate({ where: { feeType: "subscription" }, _sum: { amount: true } }),
      prisma.escrowWalletTransaction.aggregate({ _sum: { amount: true } }) // Total money moved
    ])

    // Breakdowns
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const [dailyRev, weeklyRev, monthlyRev] = await Promise.all([
       prisma.escrowWalletTransaction.aggregate({ 
         where: { feeType: { not: "none" }, date: { gte: oneDayAgo } }, 
         _sum: { amount: true } 
       }),
       prisma.escrowWalletTransaction.aggregate({ 
         where: { feeType: { not: "none" }, date: { gte: oneWeekAgo } }, 
         _sum: { amount: true } 
       }),
       prisma.escrowWalletTransaction.aggregate({ 
         where: { feeType: { not: "none" }, date: { gte: oneMonthAgo } }, 
         _sum: { amount: true } 
       })
    ])

    return NextResponse.json({
      fees: {
        publishing: publishingFees._sum.amount || 0,
        bidding: biddingFees._sum.amount || 0,
        quote: quoteFees._sum.amount || 0,
        transfer: transferFees._sum.amount || 0,
        subscription: subscriptionFees._sum.amount || 0
      },
      totalVolume: totalTransacted._sum.amount || 0,
      revenue: {
        daily: dailyRev._sum.amount || 0,
        weekly: weeklyRev._sum.amount || 0,
        monthly: monthlyRev._sum.amount || 0
      }
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to load financials" }, { status: 500 })
  }
}
