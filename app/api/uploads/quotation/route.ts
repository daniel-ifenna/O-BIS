import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 })

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "quotations")
    await fs.mkdir(uploadsDir, { recursive: true })

    const originalName = file.name || "quotation"
    const safeName = originalName.replace(/[^a-zA-Z0-9_.-]/g, "_")
    const filename = `${Date.now()}_${safeName}`
    const filePath = path.join(uploadsDir, filename)

    const arrayBuffer = await file.arrayBuffer()
    await fs.writeFile(filePath, Buffer.from(arrayBuffer))

    const url = `/uploads/quotations/${filename}`
    return NextResponse.json({ url }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

