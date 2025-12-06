import { NextResponse } from "next/server"
import { createFirebaseStorageFromEnv } from "@/lib/storage"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

function parseDataUrl(input: string): { buffer: Buffer; contentType: string } {
  const m = /^data:(.*?);base64,(.+)$/.exec(input)
  if (!m) throw new Error("Invalid dataUrl")
  const contentType = m[1]
  const buffer = Buffer.from(m[2], "base64")
  return { buffer, contentType }
}

export async function POST(request: Request) {
  try {
    const ct = request.headers.get("content-type") || ""
    const storage = createFirebaseStorageFromEnv()

    if (ct.includes("multipart/form-data")) {
      const form = await request.formData()
      const file = form.get("file") as File | null
      if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 })

      const category = String(form.get("category") || "contracts") as any
      const filename = String(form.get("filename") || file.name || "upload.bin")
      const contentType = file.type || String(form.get("contentType") || "application/octet-stream")
      const makePublic = String(form.get("makePublic") || "false") === "true"
      const projectId = form.get("projectId")?.toString()
      const bidId = form.get("bidId")?.toString()
      const procurementId = form.get("procurementId")?.toString()
      const vendorId = form.get("vendorId")?.toString()
      const userId = form.get("userId")?.toString()
      const ab = await file.arrayBuffer()
      const buffer = Buffer.from(ab)

      const result = await storage.uploadBuffer(buffer, {
        category,
        filename,
        contentType,
        projectId,
        bidId,
        procurementId,
        vendorId,
        userId,
        makePublic,
      })

      try {
        const now = new Date()
        const y = now.getFullYear()
        const mm = String(now.getMonth() + 1).padStart(2, "0")
        const d = String(now.getDate()).padStart(2, "0")
        const h = String(now.getHours()).padStart(2, "0")
        const min = String(now.getMinutes()).padStart(2, "0")
        const recordDate = `${y}-${mm}-${d}`
        const recordTime = `${h}:${min}`
        const catDb = String(category).replace(/-/g, "_") as any
        await prisma.fileStorageRecord.create({
          data: {
            category: catDb,
            url: result.publicUrl || result.mediaLink || (projectId ? storage.getPublicUrl(result.path) : result.signedUrl || ""),
            path: result.path,
            contentType,
            size: result.size,
            projectId: projectId || null,
            bidId: bidId || null,
            procurementId: procurementId || null,
            vendorId: vendorId || null,
            userId: userId || null,
            recordDate,
            recordTime,
          },
        })
      } catch {}

      const signed = Number(String(form.get("signed")))
      if (!Number.isNaN(signed) && signed > 0) {
        const url = await storage.getSignedUrl(result.path, signed)
        return NextResponse.json({ ...result, signedUrl: url }, { status: 201 })
      }
      return NextResponse.json(result, { status: 201 })
    }

    const body = await request.json().catch(() => null)
    if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 })
    if (typeof body.dataUrl !== "string" || typeof body.filename !== "string" || typeof body.category !== "string") {
      return NextResponse.json({ error: "dataUrl, filename, category are required" }, { status: 400 })
    }

    const parsed = parseDataUrl(body.dataUrl)
    const makePublic = Boolean(body.makePublic)
    const result = await storage.uploadBuffer(parsed.buffer, {
      category: body.category,
      filename: body.filename,
      contentType: parsed.contentType,
      projectId: body.projectId,
      bidId: body.bidId,
      procurementId: body.procurementId,
      vendorId: body.vendorId,
      userId: body.userId,
      makePublic,
      metadata: body.metadata,
    })

    try {
      const now = new Date()
      const y = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, "0")
      const d = String(now.getDate()).padStart(2, "0")
      const h = String(now.getHours()).padStart(2, "0")
      const min = String(now.getMinutes()).padStart(2, "0")
      const recordDate = `${y}-${mm}-${d}`
      const recordTime = `${h}:${min}`
      const catDb = String(body.category).replace(/-/g, "_") as any
      await prisma.fileStorageRecord.create({
        data: {
          category: catDb,
          url: result.publicUrl || result.mediaLink || (body.projectId ? storage.getPublicUrl(result.path) : result.signedUrl || ""),
          path: result.path,
          contentType: parsed.contentType,
          size: result.size,
          projectId: body.projectId || null,
          bidId: body.bidId || null,
          procurementId: body.procurementId || null,
          vendorId: body.vendorId || null,
          userId: body.userId || null,
          recordDate,
          recordTime,
        },
      })
    } catch {}

    const signed = Number(body.signed)
    if (!Number.isNaN(signed) && signed > 0) {
      const url = await storage.getSignedUrl(result.path, signed)
      return NextResponse.json({ ...result, signedUrl: url }, { status: 201 })
    }
    return NextResponse.json(result, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Upload failed") }, { status: 500 })
  }
}

