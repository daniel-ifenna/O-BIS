import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { updateProjectById as updateProjectFile, getProjectById as getProjectFile } from "@/lib/file-db"
import { getCache, setCache, clearCache } from "@/lib/cache"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cacheKey = `project_detail_${id}`
    const cached = getCache(cacheKey)
    if (cached) return NextResponse.json(cached)

    const p = await prisma.project.findUnique({ where: { id }, include: { _count: { select: { bids: true } }, files: true } })
    if (!p) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    let storage: any = null
    try { storage = (await import("@/lib/storage")).createFirebaseStorageFromEnv() } catch {}
    const docs = (async () => {
      const pick = (cat: string) => p.files.find((f: any) => String(f.category).toLowerCase() === cat)
      const nameFromPath = (path?: string) => {
        if (!path) return undefined
        const base = path.split("/").pop() || ""
        const idx = base.indexOf("-")
        return idx >= 0 ? base.slice(idx + 1) : base
      }
      const itb = pick("bidding_documents")
      const specs = pick("technical_proposals")
      const boq = pick("procurement_specifications")
      const financial = pick("financial_proposals")
      const withUrl = async (rec?: any) => {
        if (!rec) return { name: undefined, url: undefined }
        const name = nameFromPath(rec.path)
        let url = rec.url
        if (!url && rec.path && storage) {
          try { url = await storage.getSignedUrl(rec.path, 3600) } catch { try { url = storage.getPublicUrl(rec.path) } catch {} }
        }
        return { name, url }
      }
      const itbInfo = await withUrl(itb)
      const specsInfo = await withUrl(specs)
      const boqInfo = await withUrl(boq)
      const financialInfo = await withUrl(financial)
      return {
        itb: itbInfo.name,
        itbUrl: itbInfo.url,
        specs: specsInfo.name,
        specsUrl: specsInfo.url,
        boq: boqInfo.name,
        boqUrl: boqInfo.url,
        financial: financialInfo.name,
        financialUrl: financialInfo.url,
      }
    })()
    const item: any = { ...p, bids: Number((p as any)._count?.bids || 0), budget: String(p.budget ?? ""), documents: await docs }
    setCache(cacheKey, item, 10)
    return NextResponse.json(item)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load project" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    clearCache("projects_list")
    clearCache(`project_detail_${id}`)
    
    const body = await request.json().catch(() => ({}))
    const cleanNum = (v: any) => {
      const s = String(v ?? "")
      const n = Number(s.replace(/[^0-9.\-]/g, ""))
      return Number.isFinite(n) ? String(n) : undefined
    }
    const allowedStatuses = new Set(["Published", "Bidding", "Closed", "Awarded", "In Progress", "Completed"]) as Set<string>
    const updates: any = {}
    if (typeof body.status === "string" && allowedStatuses.has(body.status)) updates.status = body.status as any
    if (typeof body.managerId === "string") updates.managerId = body.managerId || null
    if (typeof body.contractorId === "string") updates.contractorId = body.contractorId || null
    if (typeof body.title === "string") updates.title = body.title
    if (typeof body.location === "string") updates.location = body.location
    if (typeof body.budget !== "undefined") {
      const b = cleanNum(body.budget)
      updates.budget = b ?? null
    }
    if (typeof body.category === "string") updates.category = body.category
    if (typeof body.description === "string") updates.description = body.description
    if (typeof body.bidDays !== "undefined") updates.bidDays = body.bidDays ? Number(body.bidDays) : null
    if (typeof body.maxBids !== "undefined") updates.maxBids = body.maxBids ? Number(body.maxBids) : null
    if (typeof body.acceptedBidDays !== "undefined") updates.acceptedBidDays = body.acceptedBidDays ? Number(body.acceptedBidDays) : null

    try {
      const { id } = await params
      const updated = await prisma.project.update({ where: { id }, data: updates })
      const withCount = await prisma.project.findUnique({ where: { id }, include: { _count: { select: { bids: true } } } })
      const item: any = { ...withCount, bids: Number((withCount as any)?._count?.bids || 0), budget: String(withCount?.budget ?? "") }
      return NextResponse.json(item)
    } catch (err: any) {
      const { id } = await params
      try {
        const updated = await updateProjectFile(id, updates)
        if (!updated) return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
        const item: any = { ...updated, bids: Number((updated as any).bids || 0), budget: String((updated as any).budget ?? "") }
        return NextResponse.json(item)
      } catch (e) {
        console.error("PATCH /api/projects/", id, JSON.stringify({ body, updates }), String(err?.message || err))
        return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
      }
    }
  } catch (e) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    clearCache("projects_list")
    clearCache(`project_detail_${id}`)
    
    ;(process.env as any).ALLOW_DELETE = "true"
    const proj = await prisma.project.findUnique({ where: { id }, include: { paymentRequests: true } })
    if (!proj) return NextResponse.json({ error: "Project not found" }, { status: 404 })
    if (proj.status === "Awarded" || proj.status === "Completed" || proj.contractorId) {
      return NextResponse.json({ error: "Cannot delete awarded or completed projects" }, { status: 409 })
    }
    const hasActivePayments = (proj.paymentRequests || []).some((p: any) => String(p.status) !== "REJECTED")
    if (hasActivePayments) {
      return NextResponse.json({ error: "Cannot delete project with active payment requests" }, { status: 409 })
    }
    await prisma.bidInvitation.deleteMany({ where: { projectId: id } })
    const procurements = await prisma.procurementRequest.findMany({ where: { projectId: id }, select: { id: true } })
    const procurementIds = procurements.map((p: { id: string }) => p.id)
    if (procurementIds.length) {
      await prisma.vendorQuote.deleteMany({ where: { procurementId: { in: procurementIds } } })
    }
    await prisma.dailyReport.deleteMany({ where: { projectId: id } })
    await prisma.milestone.deleteMany({ where: { projectId: id } })
    await prisma.paymentRequest.deleteMany({ where: { projectId: id } })
    await prisma.bid.deleteMany({ where: { projectId: id } })
    await prisma.procurementRequest.deleteMany({ where: { projectId: id } })
    await prisma.escrowWalletTransaction.deleteMany({ where: { projectId: id } })
    await prisma.fileStorageRecord.deleteMany({ where: { projectId: id } })
    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
