import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth/jwt"
import { createFirebaseStorageFromEnv } from "@/lib/storage"
import type { Project } from "@/lib/database-schema"
import { getCache, setCache, clearCache } from "@/lib/cache"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") || "0")
    const limit = Number(url.searchParams.get("limit") || "50")
    const skip = page > 0 ? (page - 1) * limit : 0
    const take = limit
    
    const cacheKey = `projects_list_p${page}_l${limit}`
    const cached = getCache(cacheKey)
    if (cached) return NextResponse.json(cached)

    const items = await prisma.project.findMany({ 
      orderBy: { createdAt: "desc" }, 
      include: { _count: { select: { bids: true } }, files: true },
      skip: page > 0 ? skip : undefined,
      take: page > 0 ? take : undefined,
    })
    
    let storage: any = null
    try {
      storage = createFirebaseStorageFromEnv()
    } catch {}
    const mapped = await Promise.all(
      items.map(async (p: any) => {
        const pick = (cat: string) => (p as any).files?.find((f: any) => String(f.category).toLowerCase() === cat)
        const nameFromPath = (path?: string) => {
          if (!path) return undefined
          const base = path.split("/").pop() || ""
          const idx = base.indexOf("-")
          return idx >= 0 ? base.slice(idx + 1) : base
        }
        const withUrl = async (rec?: any) => {
          if (!rec) return { name: undefined, url: undefined }
          const name = nameFromPath(rec.path)
          let url = rec.url
          if (!url && rec.path && storage) {
            try {
              url = await storage.getSignedUrl(rec.path, 3600)
            } catch {
              try {
                url = storage.getPublicUrl(rec.path)
              } catch {}
            }
          }
          return { name, url }
        }
        const itbRec = pick("bidding_documents")
        const specsRec = pick("technical_proposals")
        const boqRec = pick("procurement_specifications")
        const financialRec = pick("financial_proposals")
        const itbInfo = await withUrl(itbRec)
        const specsInfo = await withUrl(specsRec)
        const boqInfo = await withUrl(boqRec)
        const financialInfo = await withUrl(financialRec)
        const documents = {
          itb: itbInfo.name,
          itbUrl: itbInfo.url,
          specs: specsInfo.name,
          specsUrl: specsInfo.url,
          boq: boqInfo.name,
          boqUrl: boqInfo.url,
          financial: financialInfo.name,
          financialUrl: financialInfo.url,
        }
        return {
          ...p,
          id: p.id,
          title: p.title,
          location: p.location,
          budget: String(p.budget ?? ""),
          status: p.status,
          bids: Number((p as any)._count?.bids || 0),
          documents,
        }
      })
    )
    
    // Cache for 30 seconds
    setCache(cacheKey, mapped, 30)
    return NextResponse.json(mapped)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  // Invalidate cache on new project
  clearCache("projects_list")
  try {
    const required = ["title", "location", "budget"]
    for (const k of required) if (!body[k]) return NextResponse.json({ error: `${k} is required` }, { status: 400 })
    const cleanNum = (v: any) => {
      const s = String(v ?? "")
      const n = Number(s.replace(/[^0-9.\-]/g, ""))
      return Number.isFinite(n) ? String(n) : undefined
    }
    const auth = request.headers.get("authorization") || ""
    const bearerMatch = /^Bearer\s+(.+)$/i.exec(auth)
    const payload = bearerMatch ? verifyToken(bearerMatch[1]) : null
    let managerId: string | null = null
    if (payload && payload.role === "manager") {
      try {
        const mgr = await prisma.manager.findUnique({ where: { userId: payload.sub } })
        managerId = mgr?.id || null
      } catch {}
    }
    const now = new Date()
    const y = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    const h = String(now.getHours()).padStart(2, "0")
    const min = String(now.getMinutes()).padStart(2, "0")
    const recordDate = `${y}-${mm}-${d}`
    const recordTime = `${h}:${min}`
    const budgetClean = cleanNum(body.budget)
    if (budgetClean == null) {
      return NextResponse.json({ error: "Invalid budget" }, { status: 400 })
    }
    const estimatedClean = body.estimatedCost != null ? cleanNum(body.estimatedCost) : undefined
    if (body.estimatedCost != null && estimatedClean == null) {
      return NextResponse.json({ error: "Invalid estimatedCost" }, { status: 400 })
    }
    const contingencyClean = body.contingency != null ? cleanNum(body.contingency) : undefined
    if (body.contingency != null && contingencyClean == null) {
      return NextResponse.json({ error: "Invalid contingency" }, { status: 400 })
    }
    const contingencyPercentClean = body.contingencyPercent != null ? cleanNum(body.contingencyPercent) : undefined
    if (body.contingencyPercent != null && contingencyPercentClean == null) {
      return NextResponse.json({ error: "Invalid contingencyPercent" }, { status: 400 })
    }
    const retentionPercentClean = body.retentionPercent != null ? cleanNum(body.retentionPercent) : undefined
    if (body.retentionPercent != null && retentionPercentClean == null) {
      return NextResponse.json({ error: "Invalid retentionPercent" }, { status: 400 })
    }

    let resolvedManagerId: string | null = managerId
    if (!resolvedManagerId && body.managerId) {
      try {
        const mgrById = await prisma.manager.findUnique({ where: { id: String(body.managerId) } })
        if (mgrById) {
          resolvedManagerId = mgrById.id
        } else {
          const mgrByUser = await prisma.manager.findUnique({ where: { userId: String(body.managerId) } })
          resolvedManagerId = mgrByUser?.id || null
        }
      } catch {}
    }

    let created: any = null
    let mapped: any = null
    try {
      created = await prisma.project.create({
        data: {
          title: String(body.title),
          location: String(body.location),
          budget: budgetClean,
          status: (body.status || "Published") as any,
          bidsCount: Number(body.bids ?? 0),
          estimatedCost: estimatedClean ?? null,
          contingency: contingencyClean ?? null,
          contingencyPercent: contingencyPercentClean ?? null,
          paymentSchedule: body.paymentSchedule || null,
          paymentTerms: body.paymentTerms || null,
          retentionPercent: retentionPercentClean ?? null,
          category: body.category || null,
          description: (body.detailedDescription || body.description || null),
          clientName: body.clientName || null,
          clientCompany: body.clientCompany || null,
          bidDays: body.bidDays ? Number(body.bidDays) : null,
          maxBids: body.maxBids ? Number(body.maxBids) : null,
          managerId: resolvedManagerId,
          contractorId: body.contractorId || null,
          recordDate,
          recordTime,
        },
      })
      mapped = { ...created, bids: Number(created.bidsCount || 0), budget: String(created.budget ?? "") }
    } catch {
      const { createProject } = await import("@/lib/file-db")
      const createdFile = await createProject({
        title: String(body.title),
        location: String(body.location),
        budget: String(budgetClean),
        status: (body.status || "Published") as any,
        bids: Number(body.bids ?? 0),
        estimatedCost: String(estimatedClean ?? ""),
        contingency: String(contingencyClean ?? ""),
        contingencyPercent: String(contingencyPercentClean ?? ""),
        paymentSchedule: body.paymentSchedule || "",
        paymentTerms: body.paymentTerms || "",
        retentionPercent: String(retentionPercentClean ?? ""),
        category: body.category || undefined,
        description: body.detailedDescription || body.description || undefined,
        detailedDescription: body.detailedDescription || undefined,
        managerId: resolvedManagerId || (payload?.sub || "manager-1"),
        contractorId: body.contractorId || undefined,
        bidDays: body.bidDays ? Number(body.bidDays) : undefined,
        maxBids: body.maxBids ? Number(body.maxBids) : undefined,
        clientName: body.clientName || undefined,
        clientCompany: body.clientCompany || undefined,
        documents: {},
      } as any)
      mapped = { ...createdFile, budget: String(createdFile.budget ?? "") }
    }

    try {
      const docsInput = body.documents || {}
      const storage = createFirebaseStorageFromEnv()
      const now2 = new Date()
      const yy = now2.getFullYear()
      const mm2 = String(now2.getMonth() + 1).padStart(2, "0")
      const dd2 = String(now2.getDate()).padStart(2, "0")
      const hh2 = String(now2.getHours()).padStart(2, "0")
      const mn2 = String(now2.getMinutes()).padStart(2, "0")
      const recordDate2 = `${yy}-${mm2}-${dd2}`
      const recordTime2 = `${hh2}:${mn2}`
      const nameAndUrl = async (label: string, url?: string, defaultCatHyphen?: string) => {
        if (!url || typeof url !== "string") return undefined
        if (!url.startsWith("data:")) return undefined
        const match = /^data:([^;]+);base64,(.+)$/i.exec(url)
        if (!match) return undefined
        const contentType = match[1]
        const base64 = match[2]
        const buffer = Buffer.from(base64, "base64")
        const catHyphen = defaultCatHyphen || "bidding-documents"
        const catDb = String(catHyphen).replace(/-/g, "_") as any
        try {
          const result = await storage.uploadBuffer(buffer, {
            category: catHyphen as any,
            filename: `${label}.pdf`,
            contentType,
            projectId: created.id,
            makePublic: true,
          })
          const urlPublic = result.publicUrl || storage.getPublicUrl(result.path)
          await prisma.fileStorageRecord.create({
            data: {
              category: catDb,
              url: urlPublic,
              path: result.path,
              contentType,
              size: result.size,
              projectId: created.id,
              recordDate: recordDate2,
              recordTime: recordTime2,
            },
          })
          return { name: `${label}.pdf`, url: urlPublic }
        } catch {
          const fakePath = `data-url/${created.id}/${label}.pdf`
          await prisma.fileStorageRecord.create({
            data: {
              category: catDb,
              url,
              path: fakePath,
              contentType,
              size: buffer.length,
              projectId: created.id,
              recordDate: recordDate2,
              recordTime: recordTime2,
            },
          })
          return { name: `${label}.pdf`, url }
        }
      }
      const itb = await nameAndUrl("itb", docsInput.itbUrl, "bidding-documents")
      const specs = await nameAndUrl("specs", docsInput.specsUrl, "technical-proposals")
      const boq = await nameAndUrl("boq", docsInput.boqUrl, "procurement-specifications")
      const financial = await nameAndUrl("financial", docsInput.financialUrl, "financial-proposals")
      mapped.documents = {
        itb: itb?.name,
        itbUrl: itb?.url,
        specs: specs?.name,
        specsUrl: specs?.url,
        boq: boq?.name,
        boqUrl: boq?.url,
        financial: financial?.name,
        financialUrl: financial?.url,
      }
    } catch {}
    return NextResponse.json(mapped, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to create project") }, { status: 500 })
  }
}
