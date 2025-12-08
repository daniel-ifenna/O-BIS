import { NextResponse, NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth/jwt"
import { prisma } from "@/lib/db"
import { emailService } from "@/lib/email-service"
import { getBidById, getProjectById, addBidInvitation } from "@/lib/file-db"

function getAuth(request: NextRequest): { userId: string; role: string } | null {
  const auth = request.headers.get("authorization") || ""
  const m = /^Bearer\s+(.+)$/i.exec(auth)
  if (!m) return null
  const payload = verifyToken(m[1])
  if (!payload) return null
  return { userId: payload.sub, role: payload.role }
}

const MEETING_LINK_REGEX = /^(https:\/\/)(meet\.google\.com|teams\.microsoft\.com|zoom\.us)\/.+/i
function normalizeMeetInput(input: string): string {
  const trimmed = String(input || "").trim()
  if (!trimmed) return ""
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const code = trimmed.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9\-]/g, "")
  if (code.length >= 3) return `https://meet.google.com/${code}`
  return trimmed
}
function isValidMeet(url: string): boolean {
  return MEETING_LINK_REGEX.test(url)
}

function toIcsDate(date: string, time: string): string {
  const [y, m, d] = date.split("-").map((v) => Number(v))
  const [hh, mm] = time.split(":").map((v) => Number(v))
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0))
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}${pad(dt.getUTCSeconds())}Z`
}

function buildIcs({ title, date, time, link, description, attendees }: { title: string; date: string; time: string; link: string; description?: string; attendees: string[] }): string {
  const uid = `inv-${Date.now()}@nexus-construct`
  const stamp = toIcsDate(date, time)
  const endStamp = toIcsDate(date, time)
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nexus Construct//EN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${stamp}`,
    `DTEND:${endStamp}`,
    `SUMMARY:${title.replace(/\r?\n/g, " ")}`,
    `DESCRIPTION:${((description || "") + "\\n" + link).replace(/\r?\n/g, " ")}`,
    `LOCATION:${link}`,
  ]
  for (const a of attendees) {
    lines.push(`ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:${a}`)
  }
  lines.push("END:VEVENT", "END:VCALENDAR")
  return lines.join("\r\n")
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuth(request)
    if (!auth || (auth.role !== "manager" && auth.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const { id } = await params
    const history = await (prisma as any).bidInvitation.findMany({ where: { bidId: id }, orderBy: { createdAt: "desc" } })
    return NextResponse.json(history)
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to load invitations") }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuth(request)
    if (!auth || (auth.role !== "manager" && auth.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const meetingTitle: string = body.meetingTitle || "Bid Review Meeting"
    const date: string = body.date
    const time: string = body.time
    let googleMeetLink: string = normalizeMeetInput(body.googleMeetLink || "")
    const message: string | undefined = body.message
    const attendees: string[] = Array.isArray(body.attendees) ? body.attendees : []
    let ownerName: string = body.ownerName || "Project Manager"
    const timeZone: string | undefined = typeof body.timeZone === "string" ? body.timeZone : undefined
    const includeAllShortlisted: boolean = Boolean(body.includeAllShortlisted)

    if (!date || !time || !googleMeetLink) {
      return NextResponse.json({ error: "date, time, and meeting link are required" }, { status: 400 })
    }
    if (!isValidMeet(googleMeetLink)) {
      return NextResponse.json({ error: "Invalid meeting link" }, { status: 400 })
    }

    let bid = await (prisma as any).bid.findUnique({ where: { id } })
    if (!bid) bid = await getBidById(id)
    if (!bid) return NextResponse.json({ error: "Bid not found" }, { status: 404 })
    let project = await (prisma as any).project.findUnique({ where: { id: bid.projectId } })
    if (!project) project = await getProjectById(bid.projectId)
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })
    let isOwner = false
    try {
      const mgr = await (prisma as any).manager.findUnique({ where: { id: project.managerId as any } })
      isOwner = String(mgr?.userId || "") === String(auth.userId)
    } catch {}
    if (!isOwner && String((project as any).managerId || "") !== String(auth.userId)) {
      return NextResponse.json({ error: "Unauthorized: not project manager" }, { status: 403 })
    }
    if (!includeAllShortlisted && bid.status !== "Reviewed") {
      try { await (prisma as any).bid.update({ where: { id }, data: { status: "Reviewed", reviewedAt: new Date() } }) } catch {}
    }

    const baseRecipients = new Set<string>([bid.email, ...attendees].filter(Boolean))
    try {
      const mgr = await (prisma as any).manager.findUnique({ where: { id: project.managerId as any }, include: { user: true } })
      const derivedName = mgr?.user?.name || null
      if (!body.ownerName && derivedName) ownerName = derivedName
    } catch {}
    const subject = `Bid Review Meeting – ${project.title}`
    const formatNaira = (v: unknown) => `₦${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(Number(String(v ?? 0).replace(/[^0-9.]/g, "")) || 0)}`
    const toLocalTime = () => {
      try {
        const [yy, mm, dd] = date.split("-").map((v: string) => Number(v))
        const [hh, mn] = time.split(":").map((v: string) => Number(v))
        const dt = new Date(Date.UTC(yy, (mm || 1) - 1, dd || 1, hh || 0, mn || 0))
        if (timeZone) {
          const fmt = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })
          return fmt.format(dt)
        }
      } catch {}
      return `${date} ${time}`
    }
    const attendeesText = [bid.email, ...attendees].filter(Boolean).join(", ")
    const buildHtml = (contact: string) => {
      const bodyHtml = `
              <p style="margin:0 0 12px 0">Dear ${contact},</p>
              <p style="margin:0 0 12px 0">You have been shortlisted for the bid review meeting for the project <strong>${project.title}</strong>.</p>
              <div style="margin:16px 0;padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa">
                <div style="margin:4px 0"><span style="color:#6b7280">Meeting Owner:</span> <span style="font-weight:600">${ownerName}</span></div>
                <div style="margin:4px 0"><span style="color:#6b7280">Date & Time (UTC):</span> <span style="font-weight:600">${date} ${time}</span></div>
                <div style="margin:4px 0"><span style="color:#6b7280">Local Time${timeZone ? ` (${timeZone})` : ""}:</span> <span style="font-weight:600">${toLocalTime()}</span></div>
                <div style="margin:4px 0"><span style="color:#6b7280">Attendees:</span> <span style="font-weight:600">${attendeesText}</span></div>
                <div style="margin:4px 0"><span style="color:#6b7280">Message:</span> <span style="font-weight:600">${message ? message : "None"}</span></div>
              </div>
              <p style="margin:16px 0;color:#6b7280">An ICS calendar invite is attached to this email.</p>`
      return emailService.buildHtmlTemplate({ preheader: `Bid Review Meeting – ${project.title}`, title: `Bid Review Meeting – ${project.title}`, bodyHtml, ctaText: "Join Meeting", ctaUrl: googleMeetLink })
    }

    const results: Array<{ bidId: string; to: string; ok: boolean; skippedDuplicate?: boolean }> = []
    const invitedForBids: Array<{ bidId: string; sentTo: string[] }> = []

    const sendForBid = async (targetBid: any, targetEmail: string, contactName: string) => {
      const prev = await (prisma as any).bidInvitation.findFirst({ where: { bidId: targetBid.id, date, time } })
      if (prev) {
        results.push({ bidId: targetBid.id, to: targetEmail, ok: false, skippedDuplicate: true })
        return false
      }
      const ics = buildIcs({ title: meetingTitle, date, time, link: googleMeetLink, description: message, attendees: [targetEmail, ...attendees].filter(Boolean) })
      const ok = await emailService.sendMeetingInviteEmail({ to: targetEmail, subject, html: buildHtml(contactName), icsContent: ics })
      results.push({ bidId: targetBid.id, to: targetEmail, ok })
      return ok
    }

    if (includeAllShortlisted) {
      const shortlisted = await (prisma as any).bid.findMany({ where: { projectId: bid.projectId, status: "Reviewed" } })
      for (const b of shortlisted) {
        const email = b.email
        if (!email) continue
        await sendForBid(b, email, b.bidderName)
        const sentTo = [email, ...Array.from(baseRecipients)].filter(Boolean)
        invitedForBids.push({ bidId: b.id, sentTo })
        try {
          await (prisma as any).bidInvitation.create({ data: { bidId: b.id, projectId: bid.projectId, meetingTitle, date, time, googleMeetLink, message, attendees, sentTo } })
        } catch {
          await addBidInvitation({ bidId: b.id, projectId: String(bid.projectId), meetingTitle, date, time, googleMeetLink, message, attendees, sentTo })
        }
      }
    } else {
      const email = bid.email
      const sentOk = await sendForBid(bid, email, bid.bidderName)
      const sentTo = [email, ...Array.from(baseRecipients)].filter(Boolean)
      invitedForBids.push({ bidId: bid.id, sentTo })
      if (sentOk) {
        try {
          await (prisma as any).bidInvitation.create({ data: { bidId: id, projectId: bid.projectId, meetingTitle, date, time, googleMeetLink, message, attendees, sentTo } })
        } catch {
          await addBidInvitation({ bidId: id, projectId: String(bid.projectId), meetingTitle, date, time, googleMeetLink, message, attendees, sentTo })
        }
      }
    }

    const okAll = results.filter((r) => !r.skippedDuplicate).every((r) => r.ok)
    
    // Auto-close project from bidding if invite is sent
    if (results.some(r => r.ok)) {
      try {
        await (prisma as any).project.update({ where: { id: bid.projectId }, data: { status: "Closed" } })
      } catch (e) {
        console.error("Failed to close project after invite:", e)
      }
    }

    return NextResponse.json({ ok: okAll, results })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to send meeting invite") }, { status: 500 })
  }
}
