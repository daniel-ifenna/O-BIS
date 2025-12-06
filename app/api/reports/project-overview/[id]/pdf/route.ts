import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getProjectById as getProjectFile, getMilestonesByProjectId as getMilestonesFile, getDailyReportsByProjectId as getDailyReportsFile } from "@/lib/file-db"
import PDFDocument from "pdfkit"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    let project: any = null
    let milestones: any[] = []
    let reports: any[] = []
    try {
      const { id } = await params
      project = await (prisma as any).project.findUnique({ where: { id } })
      milestones = await (prisma as any).milestone.findMany({ where: { projectId: id }, orderBy: { startDate: "asc" } })
      reports = await (prisma as any).dailyReport.findMany({ where: { projectId: id }, orderBy: { createdAt: "desc" } })
    } catch {}
    const { id } = await params
    if (!project) project = await getProjectFile(id)
    if (!Array.isArray(milestones) || milestones.length === 0) milestones = await getMilestonesFile(id)
    if (!Array.isArray(reports) || reports.length === 0) reports = await getDailyReportsFile(id)
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

    const doc = new PDFDocument({ size: "A4", margin: 40 })
    const chunks: Buffer[] = []
    doc.on("data", (d) => chunks.push(d as Buffer))
    const title = String(project.title || "Project")
    const location = String(project.location || "")
    const budgetNum = Number(String(project.budget || 0).replace(/[^0-9.]/g, "")) || 0
    const budgetText = `₦${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(budgetNum)}`
    const createdAt = project.createdAt ? new Date(project.createdAt).toLocaleString() : ""
    const totalProgress = milestones.reduce((sum: number, m: any) => sum + ((Number(m.weight || 0) * Number(m.progress || 0)) / 100), 0)

    const createdDate = project.createdAt ? new Date(project.createdAt) : null
    const daysElapsed = createdDate ? Math.max(0, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))) : 0
    const plannedDays = project.acceptedBidDays ? Number(project.acceptedBidDays) : (project.bidDays ? Number(project.bidDays) : 0)

    const totalDays = Math.max(0, plannedDays || 0)
    const minStart = (() => {
      const dates = milestones.map((m: any) => m.startDate && new Date(m.startDate)).filter(Boolean) as Date[]
      return dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : (createdDate || new Date())
    })()
    const maxEnd = (() => {
      const dates = milestones.map((m: any) => m.endDate && new Date(m.endDate)).filter(Boolean) as Date[]
      return dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : (createdDate ? new Date(createdDate.getTime() + totalDays * 24 * 60 * 60 * 1000) : new Date())
    })()
    const dailyPlanned: number[] = Array.from({ length: Math.max(1, totalDays) }).map(() => 0)
    milestones.forEach((m: any) => {
      const s = m.startDate ? new Date(m.startDate) : minStart
      const e = m.endDate ? new Date(m.endDate) : maxEnd
      const span = Math.max(1, Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1)
      const inc = Number(m.weight || 0) / Math.max(1, span)
      for (let i = 0; i < dailyPlanned.length; i++) {
        const d = new Date((minStart as Date).getTime() + i * 24 * 60 * 60 * 1000)
        if (d.getTime() >= s.getTime() && d.getTime() <= e.getTime()) dailyPlanned[i] += inc
      }
    })
    for (let i = 1; i < dailyPlanned.length; i++) dailyPlanned[i] = Math.min(100, dailyPlanned[i] + dailyPlanned[i - 1])
    const dayIdx = Math.min(Math.max(0, daysElapsed), Math.max(0, dailyPlanned.length - 1))
    const plannedToDate = Math.min(100, Math.round(dailyPlanned[dayIdx] || (dailyPlanned[dailyPlanned.length - 1] || 0)))
    const actualToDate = Math.min(100, Math.round(totalProgress))
    const spi = plannedToDate > 0 ? actualToDate / plannedToDate : 0
    const delayPct = plannedToDate > 0 ? Math.max(0, ((plannedToDate - actualToDate) / plannedToDate) * 100) : 0
    const rag: "Green" | "Amber" | "Red" = spi >= 1 ? "Green" : spi >= 0.95 ? "Amber" : "Red"

    doc.fontSize(20).text("Project Overview", { align: "center" })
    doc.moveDown()
    doc.fontSize(12).text(`Title: ${title}`)
    doc.text(`Location: ${location}`)
    doc.text(`Budget: ${budgetText}`)
    doc.text(`Status: ${String(project.status || "")}`)
    if (createdAt) doc.text(`Created: ${createdAt}`)
    doc.text(`Overall Progress: ${Math.round(totalProgress)}%`)
    doc.text(`SPI: ${spi.toFixed(2)} • Delay: ${delayPct.toFixed(1)}% • RAG: ${rag}`)

    doc.moveDown()
    doc.fontSize(14).text("Milestones", { underline: true })
    doc.moveDown(0.5)
    if (milestones.length === 0) {
      doc.fontSize(12).text("No milestones")
    } else {
      milestones.forEach((m: any, i: number) => {
        const start = m.startDate ? new Date(m.startDate).toLocaleDateString() : ""
        const end = m.endDate ? new Date(m.endDate).toLocaleDateString() : ""
        const contrib = ((Number(m.weight || 0) * Number(m.progress || 0)) / 100).toFixed(1)
        doc.fontSize(12).text(`${i + 1}. ${String(m.name)} — Weight ${m.weight}% • Progress ${m.progress}% • Contribution ${contrib}%${start ? ` • ${start}` : ""}${end ? ` → ${end}` : ""}`)
      })
    }

    doc.moveDown()
    doc.fontSize(14).text("Recent Activities", { underline: true })
    doc.moveDown(0.5)
    const recent = reports.slice(0, 5)
    if (recent.length === 0) {
      doc.fontSize(12).text("No daily reports")
    } else {
      recent.forEach((r: any, i: number) => {
        const when = `${String(r.date || "").toString()} ${String(r.time || "").toString()}`.trim()
        doc.fontSize(12).text(`${i + 1}. ${when} — ${String(r.workDescription || "").slice(0, 200)}`)
      })
    }

    doc.end()
    await new Promise<void>((resolve, reject) => {
      doc.on("end", () => resolve())
      doc.on("error", reject)
    })
    const pdf = Buffer.concat(chunks)
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="Project_Overview_${title.replace(/[^a-z0-9_-]+/gi, "_")}.pdf"` } })
  } catch (e) {
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
