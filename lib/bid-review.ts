import { google } from "googleapis"
import nodemailer from "nodemailer"
import PDFDocument from "pdfkit"
import { format } from "date-fns"
import { shortlistedEmail } from "@/lib/utils/email-templates"

export type Bid = {
  contactPerson: string
  email: string
  projectName: string
  companyName?: string
  estimatedBudget?: string | number
  estimatedDuration?: number
  description?: string
  subcontractors?: Array<{ name: string; company?: string; scope?: string }>
  meetingDate?: string
  meetingTime?: string
}

export type InvitationEmail = { subject: string; html: string }
export type AwardEmail = { subject: string; html: string }
export type CalendarEventResult = { eventId: string; hangoutLink?: string; htmlLink?: string; start: string; end: string }

function toISO(date: string, time: string) {
  const [y, m, d] = date.split("-").map((v) => Number(v))
  const [hh, mm] = time.split(":" ).map((v) => Number(v))
  const dt = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0)
  return dt.toISOString()
}

export function generateInvitationEmail(bid: Bid, ownerName: string, timeZone: string, googleMeetLink: string): InvitationEmail {
  const email = shortlistedEmail({ contractorName: bid.contactPerson, managerName: ownerName, projectName: bid.projectName, meetingLink: googleMeetLink, bidAmount: bid.estimatedBudget, duration: bid.estimatedDuration })
  return { subject: email.subject, html: email.html }
}

export async function createGoogleMeetEvent(bid: Bid, ownerName: string, timeZone: string, attendees: string[] = []): Promise<CalendarEventResult> {
  const clientId = process.env.GOOGLE_CLIENT_ID || ""
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ""
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || ""
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary"
  if (!clientId || !clientSecret || !refreshToken) throw new Error("Missing Google OAuth credentials")
  if (!bid.meetingDate || !bid.meetingTime) throw new Error("Missing meetingDate or meetingTime")
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  const calendar = google.calendar({ version: "v3", auth: oauth2Client })
  const startIso = toISO(bid.meetingDate, bid.meetingTime)
  const start = { dateTime: startIso, timeZone }
  const endIso = toISO(bid.meetingDate, bid.meetingTime)
  const endDate = new Date(endIso)
  endDate.setHours(endDate.getHours() + 1)
  const end = { dateTime: endDate.toISOString(), timeZone }
  const event = {
    summary: `Discussion: ${bid.projectName}`,
    description: `Proposal discussion for ${bid.projectName} with ${bid.companyName || "Bidder"}. Owner: ${ownerName}.`,
    start,
    end,
    attendees: [
      { email: bid.email },
      ...attendees.map((e) => ({ email: e })),
    ],
    reminders: { useDefault: false, overrides: [{ method: "email", minutes: 240 }] },
    conferenceData: {
      createRequest: { requestId: `${Date.now()}-${Math.random()}`.replace(/\./g, ""), conferenceSolutionKey: { type: "hangoutsMeet" } },
    },
  }
  const { data } = await calendar.events.insert({ calendarId, requestBody: event, conferenceDataVersion: 1 })
  return { eventId: String(data.id), hangoutLink: data.hangoutLink || undefined, htmlLink: data.htmlLink || undefined, start: start.dateTime, end: end.dateTime }
}

function mailer() {
  const host = process.env.SMTP_HOST || ""
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER || ""
  const pass = process.env.SMTP_PASS || ""
  const from = process.env.SMTP_FROM || ""
  if (!host || !user || !pass || !from) throw new Error("Missing SMTP configuration")
  const transport = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
  return { transport, from }
}

export async function sendInvitationEmail(to: string, email: InvitationEmail) {
  const { transport, from } = mailer()
  const info = await transport.sendMail({ from, to, subject: email.subject, html: email.html })
  return info.messageId
}

export function generateContractAwardPDF(bid: Bid): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 })
    const chunks: Buffer[] = []
    doc.on("data", (d) => chunks.push(d as Buffer))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)
    doc.fontSize(20).text("O-BIS Contract Award", { align: "center" })
    doc.moveDown(1)
    doc.fontSize(12).text(`Project: ${bid.projectName}`)
    doc.text(`Company: ${bid.companyName || "N/A"}`)
    doc.text(`Contact: ${bid.contactPerson}`)
    doc.moveDown(0.5)
    doc.text("Project Information", { underline: true })
    doc.moveDown(0.5)
    doc.text(`Estimated Budget: ${bid.estimatedBudget ?? "N/A"}`)
    doc.text(`Estimated Duration: ${bid.estimatedDuration ? bid.estimatedDuration + " days" : "N/A"}`)
    doc.moveDown(0.5)
    doc.text("Project Description", { underline: true })
    doc.moveDown(0.5)
    doc.text(`${bid.description || "No description provided."}`)
    if (bid.subcontractors && bid.subcontractors.length > 0) {
      doc.moveDown(0.5)
      doc.text("Subcontractors", { underline: true })
      bid.subcontractors.forEach((s, i) => {
        doc.text(`${i + 1}. ${s.name}${s.company ? " — " + s.company : ""}${s.scope ? " — " + s.scope : ""}`)
      })
    }
    doc.moveDown(0.5)
    doc.text("Terms and Conditions", { underline: true })
    doc.moveDown(0.5)
    doc.text("All work shall be performed in accordance with O-BIS standards, applicable regulations, and the mutually agreed scope, schedule, and commercial terms.")
    doc.moveDown(1)
    doc.text("Authorized Signature:", { continued: true }).text(" ____________________________")
    doc.moveDown(2)
    doc.fontSize(10).text("O-BIS • Contract Award Document", { align: "center" })
    doc.end()
  })
}

export function generateContractAwardEmail(bid: Bid, ownerName: string): AwardEmail {
  const subject = `Contract Award: ${bid.projectName}`
  const html = `
  <div style="font-family: Arial, sans-serif; color:#111; line-height:1.6;">
    <p>Dear ${bid.contactPerson},</p>
    <p>We are pleased to inform you that O-BIS is awarding the contract for <strong>${bid.projectName}</strong> to <strong>${bid.companyName || "your organization"}</strong>.</p>
    <p>Project Information</p>
    <ul>
      <li>Owner: ${ownerName}</li>
      <li>Estimated Budget: ${bid.estimatedBudget ?? "N/A"}</li>
      <li>Estimated Duration: ${bid.estimatedDuration ? bid.estimatedDuration + " days" : "N/A"}</li>
    </ul>
    <p>Description</p>
    <p>${bid.description || "No description provided."}</p>
    <p>Next Steps</p>
    <p>Please review the attached contract award document. Our team will coordinate kickoff activities and contractual formalities.</p>
    <p>Sincerely,<br/>O-BIS Management</p>
  </div>
  `.trim()
  return { subject, html }
}

export async function sendContractAwardEmail(to: string, email: AwardEmail, pdf: Buffer) {
  const { transport, from } = mailer()
  const info = await transport.sendMail({ from, to, subject: email.subject, html: email.html, attachments: [{ filename: "contract-award.pdf", content: pdf }] })
  return info.messageId
}
