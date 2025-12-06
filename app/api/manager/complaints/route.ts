import { NextResponse } from "next/server"
import { getComplaintsByManager } from "@/lib/file-db"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const managerId = url.searchParams.get("managerId") || ""
    if (!managerId) return NextResponse.json({ error: "managerId is required" }, { status: 400 })
    const items = await getComplaintsByManager(managerId)
    return NextResponse.json(items)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load complaints" }, { status: 500 })
  }
}

