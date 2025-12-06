import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import type { Milestone } from "@/lib/database-schema"
import { getMilestonesByProjectId as getMilestonesFile } from "@/lib/file-db"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const items = await (prisma as any).milestone.findMany({ where: { projectId: id }, orderBy: { startDate: "asc" } })
    return NextResponse.json(items)
  } catch (e) {
    try {
      const { id } = await params
      const items = await getMilestonesFile(id)
      return NextResponse.json(items)
    } catch {
      return NextResponse.json({ error: "Failed to load milestones" }, { status: 500 })
    }
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const milestones: Array<Omit<Milestone, "id" | "projectId" | "progress" | "status">> = body?.milestones || []
    if (!Array.isArray(milestones) || milestones.length === 0) {
      return NextResponse.json({ error: "milestones array is required" }, { status: 400 })
    }
    const totalWeight = milestones.reduce((sum, m) => sum + (Number(m.weight) || 0), 0)
    if (Math.round(totalWeight) !== 100) {
      return NextResponse.json({ error: "Sum of milestone weights must equal 100" }, { status: 400 })
    }
    const { id } = await params
    await (prisma as any).milestone.deleteMany({ where: { projectId: id } })
    await (prisma as any).milestone.createMany({
      data: milestones.map((m) => ({
        projectId: id,
        name: String(m.name),
        startDate: new Date(m.startDate as any),
        endDate: m.endDate ? new Date(m.endDate as any) : undefined,
        weight: Number(m.weight) || 0,
        progress: 0,
        status: "Pending",
      })),
    })
    const next = await (prisma as any).milestone.findMany({ where: { projectId: id }, orderBy: { startDate: "asc" } })
    return NextResponse.json(next, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Failed to save milestones" }, { status: 500 })
  }
}
