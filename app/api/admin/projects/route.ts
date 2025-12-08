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

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || ""

  try {
    const where: any = {}
    if (status) where.status = status

    const projects = await prisma.project.findMany({
      where,
      include: {
        manager: {
          include: { user: { select: { name: true, email: true } } }
        },
        milestones: true,
        _count: {
          select: { bids: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const withStats = await Promise.all(projects.map(async (p) => {
      // Calculate progress
      const progress = p.milestones.reduce((acc, m) => acc + (Number(m.progress || 0) * Number(m.weight || 0) / 100), 0)
      
      // Calculate fees collected for this project
      const fees = await prisma.escrowWalletTransaction.aggregate({
        where: { projectId: p.id, feeType: { not: "none" } },
        _sum: { amount: true }
      })

      return {
        id: p.id,
        title: p.title,
        owner: p.manager?.user.name || "Unknown",
        budget: p.budget,
        status: p.status,
        progress: Math.round(progress),
        bidsCount: p._count.bids,
        feesCollected: fees._sum.amount || 0,
        createdAt: p.createdAt
      }
    }))

    return NextResponse.json(withStats)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 })
  }
}
