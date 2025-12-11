import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth/jwt"

export const dynamic = "force-dynamic"

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
    const todayStr = today.toISOString()

    const [
      totalUsers,
      totalVendors,
      totalManagers,
      newUsersToday,
      newVendorsToday,
      projectsPending,
      projectsOngoing,
      projectsCompleted,
      transactionsToday,
      newProjectsToday
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "vendor" } }),
      prisma.user.count({ where: { role: "manager" } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { role: "vendor", createdAt: { gte: today } } }),
      prisma.project.count({ where: { status: "Bidding" } }),
      prisma.project.count({ where: { status: "Awarded" } }),
      prisma.project.count({ where: { status: "Completed" } }),
      prisma.escrowWalletTransaction.count({ where: { date: { gte: today } } }),
      prisma.project.count({ where: { createdAt: { gte: today } } })
    ])

    // Get all projects for progress tracking
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        milestones: {
          select: { progress: true, weight: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    })

    const projectProgress = projects.map(p => {
      const totalProgress = p.milestones.reduce((acc, m) => acc + (Number(m.progress || 0) * Number(m.weight || 0) / 100), 0)
      return {
        id: p.id,
        title: p.title,
        status: p.status,
        progress: Math.round(totalProgress)
      }
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        totalVendors,
        totalManagers,
        newUsersToday,
        newVendorsToday,
        newProjectsToday,
        projectsPending,
        projectsOngoing,
        projectsCompleted,
        transactionsToday
      },
      projects: projectProgress
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to load admin stats" }, { status: 500 })
  }
}
