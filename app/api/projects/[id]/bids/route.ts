import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { createFirebaseStorageFromEnv } from "@/lib/storage"
 
 

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const required = ["bidderName", "companyName", "email", "amount", "duration"]
    for (const k of required) if (!body[k]) return NextResponse.json({ error: `${k} is required` }, { status: 400 })

    const uploads = body.uploads || {}
    const requireUploads = String(process.env.REQUIRE_BID_UPLOADS || "").toLowerCase() === "true"
    const proposalDocs: unknown = uploads?.proposal
    if (requireUploads) {
      if (!Array.isArray(proposalDocs) || proposalDocs.length === 0) {
        return NextResponse.json({ error: "proposal upload is required" }, { status: 400 })
      }
    }

    const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
    const { id } = await params
    let project = await prisma.project.findUnique({ where: { id } }).catch(() => null)
    if (!project && !isUuid(id)) {
      try {
        const alt = await (prisma as any).project.findFirst({ where: { title: { equals: id, mode: "insensitive" } } })
        if (alt) project = alt
      } catch {}
    }
    if (!project) {
      try {
        const latest = await prisma.project.findFirst({ orderBy: { createdAt: "desc" } })
        if (latest) project = latest
      } catch {}
    }
    if (!project) {
      try {
        const { getProjectById } = await import("@/lib/file-db")
        const fileProj = await getProjectById(id)
        if (fileProj) project = fileProj as any
      } catch {}
    }
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })
    if (["Closed", "Awarded", "Completed"].includes(project.status)) {
      return NextResponse.json({ error: "Bidding closed" }, { status: 403 })
    }

    const maxBids = Number(project.maxBids || 0)
    if (maxBids > 0) {
      const countDb = await prisma.bid.count({ where: { projectId: id } }).catch(() => 0)
      const currentCount = countDb
      if (currentCount >= maxBids) {
        // Auto-close if limit reached
        if (project.status !== "Closed") {
          try { await prisma.project.update({ where: { id: (project as any).id }, data: { status: "Closed" } }) } catch {}
        }
        return NextResponse.json({ error: "Submission limit reached" }, { status: 403 })
      }
    }

    const bidDays = Number(project.bidDays || 0)
    if (bidDays > 0 && project.createdAt) {
      const closeDate = new Date(new Date(project.createdAt).getTime() + bidDays * 24 * 60 * 60 * 1000)
      if (new Date() > closeDate) {
        // Auto-close if deadline passed
        if (project.status !== "Closed") {
          try { await prisma.project.update({ where: { id: (project as any).id }, data: { status: "Closed" } }) } catch {}
        }
        return NextResponse.json({ error: "Submission window ended" }, { status: 403 })
      }
    }

    const rawAmount = String(body.amount)
    const amountStr = rawAmount.replace(/[^0-9.]/g, "")
    if (!amountStr || isNaN(Number(amountStr))) return NextResponse.json({ error: "amount must be numeric" }, { status: 400 })
    const durationNum = Number(String(body.duration))
    if (!Number.isFinite(durationNum) || durationNum <= 0) return NextResponse.json({ error: "duration must be a positive number" }, { status: 400 })

    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    const h = String(now.getHours()).padStart(2, "0")
    const min = String(now.getMinutes()).padStart(2, "0")
    const recordDate = `${y}-${m}-${d}`
    const recordTime = `${h}:${min}`
    let contractorId: string | null = null
    if (typeof body.contractorId === "string" && body.contractorId && body.contractorId !== "public") {
      try {
        const exists = await prisma.contractor.findUnique({ where: { id: body.contractorId } })
        if (exists) contractorId = body.contractorId
      } catch {}
    }

    const targetProjectId = (project as any)?.id || id
    try {
      const createdDb = await prisma.bid.create({
        data: {
          projectId: targetProjectId,
          contractorId,
          bidderName: String(body.bidderName),
          companyName: String(body.companyName),
          email: String(body.email),
          phone: body.phone ? String(body.phone) : null,
          address: body.address ? String(body.address) : null,
          amount: String(amountStr),
          duration: durationNum,
          message: body.message || null,
          status: "New",
          recordDate,
          recordTime,
        },
      })
      // Persist uploads (data URLs) into storage and FileStorageRecord
      {
        const storage = (() => { try { return createFirebaseStorageFromEnv() } catch { return null } })()
        const saveArray = async (label: string, category: "technical-proposals" | "financial-proposals" | "procurement-specifications", arr?: unknown) => {
          if (!Array.isArray(arr)) return [] as string[]
          const urls: string[] = []
          for (let i = 0; i < arr.length; i++) {
            const v = arr[i]
            if (typeof v !== "string") continue
            const m = /^data:([^;]+);base64,(.+)$/i.exec(v)
            if (!m) continue
            const contentType = m[1]
            const base64 = m[2]
            const buffer = (() => { try { return Buffer.from(base64, "base64") } catch { return Buffer.from("") } })()
            try {
              if (storage) {
                const up = await storage.uploadBuffer(buffer, {
                  category,
                  filename: `${label}_${i + 1}.pdf`,
                  contentType,
                  projectId: targetProjectId,
                  bidId: createdDb.id,
                  makePublic: true,
                })
                const publicUrl = up.publicUrl || storage.getPublicUrl(up.path)
                await prisma.fileStorageRecord.create({
                  data: {
                    category: category.replace(/-/g, "_") as any,
                    url: publicUrl,
                    path: up.path,
                    contentType: up.contentType,
                    size: up.size,
                    projectId: targetProjectId,
                    bidId: createdDb.id,
                    recordDate,
                    recordTime,
                  },
                })
                urls.push(publicUrl)
              } else {
                await prisma.fileStorageRecord.create({
                  data: {
                    category: category.replace(/-/g, "_") as any,
                    url: v,
                    path: `${label}_${i + 1}.pdf`,
                    contentType,
                    size: buffer.length || 0,
                    projectId: targetProjectId,
                    bidId: createdDb.id,
                    recordDate,
                    recordTime,
                  },
                })
                urls.push(v)
              }
            } catch (err) {
              console.error("File create error (falling back to local):", err)
              // Fallback: Create record with base64 data
              try {
                await prisma.fileStorageRecord.create({
                  data: {
                    category: category.replace(/-/g, "_") as any,
                    url: v,
                    path: `${label}_${i + 1}.pdf`,
                    contentType,
                    size: buffer.length || 0,
                    projectId: targetProjectId,
                    bidId: createdDb.id,
                    recordDate,
                    recordTime,
                  },
                })
              } catch (dbErr) {
                console.error("Failed to create fallback file record:", dbErr)
              }
              urls.push(v)
            }
          }
          return urls
        }
        const uploadsObj = (body.uploads || {}) as any
        const uploadedProposal = await saveArray("proposal", "technical-proposals", uploadsObj.proposal)
        const uploadedProfile = await saveArray("profile", "technical-proposals", uploadsObj.profile)
        const uploadedSpecs = await saveArray("specs", "procurement-specifications", uploadsObj.specs)
        const uploadedTax = await saveArray("tax", "financial-proposals", uploadsObj.tax)
        const uploadedBond = await saveArray("bond", "financial-proposals", uploadsObj.bond)
        const uploadedAdditional = await saveArray("additional", "technical-proposals", uploadsObj.additional)
        ;(createdDb as any).uploads = {
          proposal: uploadedProposal,
          profile: uploadedProfile,
          specs: uploadedSpecs,
          tax: uploadedTax,
          bond: uploadedBond,
          additional: uploadedAdditional,
        }
        ;(createdDb as any).subcontractors = Array.isArray(body.subcontractors) ? body.subcontractors : []
      }
      try {
        const currentBids = await prisma.bid.count({ where: { projectId: targetProjectId } })
        const maxBids = Number((project as any).maxBids || 0)
        let newStatus = (project as any).status === "Published" ? "Bidding" : (project as any).status
        if (maxBids > 0 && currentBids >= maxBids) {
          newStatus = "Closed"
        }

        await prisma.project.update({
          where: { id: targetProjectId },
          data: {
            status: newStatus as any,
          },
        })
      } catch {}
      return NextResponse.json(createdDb, { status: 201 })
    } catch (e: any) {
      // Fallback to file DB when Prisma is unavailable
      try {
        const { createBid, saveBids } = await import("@/lib/file-db")
        const createdFile = await createBid(targetProjectId, {
          bidderName: String(body.bidderName),
          companyName: String(body.companyName),
          email: String(body.email),
          phone: body.phone ? String(body.phone) : "",
          address: body.address ? String(body.address) : "",
          amount: String(amountStr),
          duration: durationNum,
          message: body.message || "",
          contractorId: String(body.contractorId || ""),
        } as any)
        return NextResponse.json(createdFile, { status: 201 })
      } catch (err) {
        console.error("POST /api/projects/", id, "bids", JSON.stringify({ body }), String(e?.message || e))
        return NextResponse.json({ error: "Failed to submit bid" }, { status: 500 })
      }
    }
  } catch (e) {
    return NextResponse.json({ error: "Failed to submit bid" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") || "0")
    const limit = Number(url.searchParams.get("limit") || "50")
    const skip = page > 0 ? (page - 1) * limit : 0
    const take = limit

    const storage = (() => {
      try { return createFirebaseStorageFromEnv() } catch { return null }
    })()
    const items = await prisma.bid.findMany({ 
      where: { projectId: id }, 
      orderBy: { submittedAt: "desc" }, 
      include: { files: true },
      skip: page > 0 ? skip : undefined,
      take: page > 0 ? take : undefined,
    })
    const nameFromPath = (path?: string) => {
      if (!path) return ""
      const base = path.split("/").pop() || ""
      const idx = base.indexOf("-")
      return idx >= 0 ? base.slice(idx + 1) : base
    }
    const withUrl = (rec: any) => {
      let url = rec.url
      if (!url && rec.path && storage) {
        try { url = storage.getPublicUrl(rec.path) } catch {}
      }
      return url
    }
    const mapped = items.map((b: any) => {
      const uploads: Record<string, string[]> = { proposal: [], profile: [], specs: [], tax: [], bond: [], additional: [] }
      for (const f of (b.files || [])) {
        const name = nameFromPath(f.path).toLowerCase()
        const url = withUrl(f)
        if (!url) continue
        if (name.startsWith("proposal")) uploads.proposal.push(url)
        else if (name.startsWith("profile")) uploads.profile.push(url)
        else if (name.startsWith("specs")) uploads.specs.push(url)
        else if (name.startsWith("tax")) uploads.tax.push(url)
        else if (name.startsWith("bond")) uploads.bond.push(url)
        else if (name.startsWith("additional")) uploads.additional.push(url)
      }
      return { ...b, uploads }
    })
    return NextResponse.json(mapped)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load project bids" }, { status: 500 })
  }
}
