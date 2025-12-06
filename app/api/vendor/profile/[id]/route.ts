import { NextResponse, NextRequest } from "next/server"
import { findVendorProfileById } from "@/lib/file-db"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const profile = await findVendorProfileById(id)
    if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(profile)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 })
  }
}
