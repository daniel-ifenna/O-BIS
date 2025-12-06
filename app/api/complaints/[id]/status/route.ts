import { NextResponse, NextRequest } from "next/server"
import { updateComplaintStatus } from "@/lib/file-db"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { status } = body
    if (!status) return NextResponse.json({ error: "status is required" }, { status: 400 })
    const { id } = await params
    const updated = await updateComplaintStatus(id, status)
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}
