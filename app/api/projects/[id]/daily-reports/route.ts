import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getMilestonesByProjectId as getMilestonesFile, setProjectMilestones as setProjectMilestonesFile, updateMilestoneProgress as updateMilestoneProgressFile, createDailyReport as createDailyReportFile, getDailyReportsByProjectId as getDailyReportsFile } from "@/lib/file-db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { date, time, crew, crewChief, totalPersonnel, workDescription, workPercentage, attachments } = body || {}
    if (!date || !time || !crew || !workDescription || typeof workPercentage !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const photos = Array.isArray(attachments) ? attachments : []
    if (photos.length > 3) {
      return NextResponse.json({ error: "Maximum 3 photos allowed" }, { status: 400 })
    }
    try {
      const { id } = await params
      let active = await (prisma as any).milestone.findFirst({ where: { projectId: id, progress: { lt: 100 } }, orderBy: { startDate: "asc" } })
      if (!active) {
        const now = new Date()
        active = await (prisma as any).milestone.create({
          data: {
            projectId: id,
            name: "Auto-seeded",
            startDate: now,
            endDate: now,
            weight: 10,
            progress: 0,
            status: "Pending",
          },
        })
      }
      const nextProgress = Math.max(active.progress, Math.min(100, Number(workPercentage)))
      await (prisma as any).milestone.update({
        where: { id: active.id },
        data: { progress: nextProgress, status: nextProgress >= 100 ? "Completed" : "In Progress" },
      })
      const saved = await (prisma as any).dailyReport.create({
        data: {
          projectId: id,
          contractorId: body.contractorId || null,
          date: String(date),
          time: String(time),
          crew: String(crew),
          crewChief: crewChief ? String(crewChief) : "",
          totalPersonnel: Number(totalPersonnel) || 0,
          workDescription: String(workDescription),
          workPercentage: nextProgress,
          safetyIncidents: Number(body.safetyIncidents || 0),
          qaIssues: Number(body.qaIssues || 0),
          attachments: photos,
        },
      })
      return NextResponse.json(saved, { status: 201 })
    } catch (e) {
      const { id } = await params
      const list = await getMilestonesFile(id).catch(() => [])
      let active = list.find((m: any) => Number(m.progress || 0) < 100)
      if (!active) {
        const seeded = await setProjectMilestonesFile(id, [
          { name: "Auto-seeded", startDate: new Date().toISOString().split("T")[0], endDate: new Date().toISOString().split("T")[0], weight: 10 },
        ])
        active = seeded[0]
      }
      const nextProgress = Math.max(Number(active.progress || 0), Math.min(100, Number(workPercentage)))
      await updateMilestoneProgressFile(id, active.id, nextProgress)
      const saved = await createDailyReportFile({
        projectId: String(id),
        contractorId: body.contractorId || "",
        date: String(date),
        time: String(time),
        crew: String(crew),
        crewChief: crewChief ? String(crewChief) : "",
        totalPersonnel: Number(totalPersonnel) || 0,
        workDescription: String(workDescription),
        workPercentage: nextProgress,
        safetyIncidents: Number(body.safetyIncidents || 0),
        qaIssues: Number(body.qaIssues || 0),
        attachments: photos,
      })
      return NextResponse.json(saved, { status: 201 })
    }
  } catch (e) {
    return NextResponse.json({ error: "Failed to submit daily report" }, { status: 500 })
  }
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const items = await (prisma as any).dailyReport.findMany({ where: { projectId: id }, orderBy: { createdAt: "desc" } })
    return NextResponse.json(items)
  } catch (e) {
    try {
      const { id } = await params
      const items = await getDailyReportsFile(id)
      return NextResponse.json(items)
    } catch {
      return NextResponse.json({ error: "Failed to load daily reports" }, { status: 500 })
    }
  }
}
