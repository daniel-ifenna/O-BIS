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

  const url = new URL(request.url)
  const range = url.searchParams.get("range") || "month"

  try {
    const today = new Date()
    let startDate = new Date()
    
    if (range === "day") startDate.setDate(today.getDate() - 1)
    if (range === "week") startDate.setDate(today.getDate() - 7)
    if (range === "month") startDate.setMonth(today.getMonth() - 1)
    if (range === "year") startDate.setFullYear(today.getFullYear() - 1)
    
    // Fetch transactions
    const txns = await prisma.escrowWalletTransaction.findMany({
      where: {
        recordDate: { gte: startDate.toISOString().split('T')[0] }
      }
    })

    // Calculate Fees
    // Logic: 
    // - 1% Publishing Fee: usually deducted when Manager funds wallet or Project is published. 
    //   If we don't have explicit Fee records, we can infer or track them separately. 
    //   Assuming we have a "fee" type or description pattern.
    // - Bidding Fee: small fee per bid.
    // - Internal Transfer Fee: 55 NGN.
    // - Vendor Quote Fee.
    
    // For this MVP, let's assume we can filter by description or type if available.
    // Or we rely on a specific Fee table if we had one. 
    // Current schema uses EscrowWalletTransaction with 'description'.
    
    let internalTransferFees = 0
    let publishingFees = 0
    let biddingFees = 0
    let quoteFees = 0
    let subscriptionFees = 0
    let totalTransacted = 0

    txns.forEach(t => {
      const amt = Number(t.amount)
      totalTransacted += amt
      
      const desc = (t.description || "").toLowerCase()
      
      if (desc.includes("transfer fee") || desc.includes("internal transfer fee")) {
        internalTransferFees += amt
      }
      else if (desc.includes("publishing fee")) {
        publishingFees += amt
      }
      else if (desc.includes("bidding fee")) {
        biddingFees += amt
      }
      else if (desc.includes("quote fee")) {
        quoteFees += amt
      }
      else if (desc.includes("subscription")) {
        subscriptionFees += amt
      }
    })

    return NextResponse.json({
      summary: {
        internalTransferFees,
        publishingFees,
        biddingFees,
        quoteFees,
        subscriptionFees,
        totalRevenue: internalTransferFees + publishingFees + biddingFees + quoteFees + subscriptionFees,
        totalTransacted
      },
      transactions: txns.slice(0, 100) // Return recent transactions list
    })

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to fetch financials" }, { status: 500 })
  }
}
