import { NextResponse } from "next/server"
import { createComplaint } from "@/lib/file-db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const required = ["projectId", "contractorId", "contractorName", "managerId", "category", "subject", "description", "severity"]
    for (const k of required) if (!body[k]) return NextResponse.json({ error: `${k} is required` }, { status: 400 })
    const created = await createComplaint({
      projectId: String(body.projectId),
      contractorId: String(body.contractorId),
      contractorName: String(body.contractorName),
      managerId: String(body.managerId),
      category: body.category,
      subject: body.subject,
      description: body.description,
      severity: body.severity,
      attachments: Array.isArray(body.attachments) ? body.attachments : undefined,
      status: "open",
      acknowledgedAt: undefined,
      acknowledgedBy: undefined,
      resolution: undefined,
      resolvedAt: undefined,
      feedback: undefined,
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Failed to create complaint" }, { status: 500 })
  }
}

