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
  const status = url.searchParams.get("status") || undefined
  const query = url.searchParams.get("q") || ""

  try {
    const projects = await prisma.project.findMany({
      where: {
        status: status as any,
        title: query ? { contains: query } : undefined
      },
      include: {
        manager: {
          include: {
            user: {
               select: { name: true, email: true }
            }
          }
        },
        _count: {
          select: { bids: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    })

    const mapped = projects.map(p => ({
      id: p.id,
      title: p.title,
      location: p.location,
      budget: p.budget,
      status: p.status,
      createdAt: p.createdAt,
      managerName: p.manager?.user?.name || "Unknown",
      bidsCount: p._count.bids,
      // We don't track "fees paid" per project explicitly in schema yet unless we query transactions.
      // We can aggregate fees from transactions related to this project.
      // For now, let's leave it simple or do a quick aggregation if needed.
    }))

    return NextResponse.json(mapped)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}
