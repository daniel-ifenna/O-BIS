import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth/jwt"
import { createGoogleMeetEvent, generateInvitationEmail, sendInvitationEmail, type Bid as IBid } from "@/lib/bid-review"

function getAuthRole(request: NextRequest): { userId: string; role: string } | null {
  const auth = request.headers.get("authorization") || ""
  const m = /^Bearer\s+(.+)$/i.exec(auth)
  if (!m) return null
  const payload = verifyToken(m[1])
  if (!payload) return null
  return { userId: payload.sub, role: payload.role }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthRole(request)
    if (!auth || (auth.role !== "manager" && auth.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const { id } = await params
  const body = await request.json().catch(() => ({}))
  const ownerName: string = body.ownerName || "Owner"
  const timeZone: string = body.timeZone || "UTC"
  const meetingDate: string | undefined = body.meetingDate
  const meetingTime: string | undefined = body.meetingTime
  const meetUrl: string | undefined = body.meetUrl
  const attendees: string[] = Array.isArray(body.attendees) ? body.attendees : []

    const bid = await prisma.bid.findUnique({ where: { id } })
    if (!bid) return NextResponse.json({ error: "Bid not found" }, { status: 404 })
    const project = await prisma.project.findUnique({ where: { id: bid.projectId } })
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

    if (bid.status !== "Reviewed") {
      return NextResponse.json({ error: "Only shortlisted bids can be invited" }, { status: 400 })
    }
    if (["Closed", "Awarded", "Completed"].includes(project.status as any)) {
      return NextResponse.json({ error: "Invitations are disabled for closed or awarded projects" }, { status: 400 })
    }

    const bidInput: IBid = {
      contactPerson: bid.bidderName,
      email: bid.email,
      projectName: project.title,
      companyName: bid.companyName || undefined,
      estimatedBudget: (bid as any).amount,
      estimatedDuration: bid.duration,
      description: project.description || bid.message || undefined,
      meetingDate,
      meetingTime,
    }

    let event
    let finalMeetUrl = ""
    if (meetUrl && typeof meetUrl === "string") {
      const valid = /^https:\/\/meet\.google\.com\/[a-z0-9-]+(\?.*)?$/i.test(meetUrl)
      if (!valid) {
        return NextResponse.json({ error: "Invalid Google Meet link" }, { status: 400 })
      }
      finalMeetUrl = meetUrl
      event = { eventId: "manual-link", hangoutLink: meetUrl, start: meetingDate || "", end: meetingTime || "" }
    } else {
      event = await createGoogleMeetEvent(bidInput, ownerName, timeZone, attendees)
      finalMeetUrl = event.hangoutLink || event.htmlLink || ""
    }
    const email = generateInvitationEmail(bidInput, ownerName, timeZone, finalMeetUrl)

    const recipients = [bid.email, ...attendees].filter(Boolean)
    const messageIds: string[] = []
    for (const to of recipients) {
      const msgId = await sendInvitationEmail(to, email)
      messageIds.push(msgId)
    }

    return NextResponse.json({ ok: true, event, messageIds })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to send invitation") }, { status: 500 })
  }
}

