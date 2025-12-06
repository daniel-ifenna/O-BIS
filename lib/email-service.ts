import nodemailer, { type Transporter } from "nodemailer"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import path from "path"
import type { Bid } from "@/lib/database-schema"

interface ContractAwardParams {
  to: string
  companyName: string
  projectName: string
  estimatedBudget: number
  estimatedDuration: number
  contractPdfBuffer?: Buffer
  loginUrl: string
  loginEmail?: string
  tempPassword?: string
  isPasswordSetup?: boolean
}

export class EmailService {
  private transporter: Transporter | null = null
  private isVerified = false

  constructor() {
    void this.initializeTransporter()
  }

  private async initializeTransporter() {
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = Number(process.env.SMTP_PORT || 0)
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASSWORD

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
        // Increase connection timeout to 10 seconds and greeting timeout to 10 seconds
        connectionTimeout: 10000,
        greetingTimeout: 10000,
      })
    } else if (gmailUser && gmailPass) {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass },
      })
    } else {
      console.warn("[EmailService] Email service not configured (missing SMTP/Gmail envs).")
      // In development/test, we might proceed without a transporter, but warn.
      return
    }

    try {
      await this.transporter.verify()
      this.isVerified = true
      console.log("[EmailService] SMTP verified successfully")
    } catch (err) {
      console.error("[EmailService] SMTP verification failed:", err)
      this.isVerified = false
    }
  }

  getStatus() {
    return { ready: this.isVerified }
  }

  buildHtmlTemplate(params: { preheader?: string; title: string; greeting?: string; bodyHtml: string; ctaText?: string; ctaUrl?: string; footerNote?: string }) {
    const pre = params.preheader || params.title
    const href = this.resolveUrl(params.ctaUrl)
    const cta = params.ctaText && href
      ? `<a href="${href}" style="display:inline-block;padding:12px 18px;background:#ea580c;color:#fff;text-decoration:none;border-radius:6px">${params.ctaText}</a>`
      : ""
    const note = params.footerNote ? `<p style="margin:16px 0;color:#6b7280">${params.footerNote}</p>` : ""
    const greet = params.greeting ? `<p style="margin:0 0 12px 0">${params.greeting}</p>` : ""
    return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:Inter,Arial,sans-serif;color:#1f2937">
  <div style="display:none;max-height:0;overflow:hidden">${pre}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f7f7f7">
    <tr>
      <td align="center" style="padding:24px">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb">
          <tr>
            <td style="padding:24px;border-bottom:1px solid #e5e7eb">
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:32px;height:32px;border-radius:8px;background:#ea580c"></div>
                <div style="font-weight:700;color:#0f172a">Open-Eye Africa Technologies – O-BIS</div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px">
              <h2 style="margin:0 0 8px 0;color:#0f172a">${params.title}</h2>
              ${greet}
              ${params.bodyHtml}
              ${cta}
              ${note}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px">
              © ${new Date().getFullYear()} Open-Eye Africa Technologies. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  
</body>
</html>`
  }

  private resolveUrl(u?: string): string | undefined {
    if (!u) return undefined
    const s = String(u).trim()
    if (!s) return undefined
    if (/^https?:\/\//i.test(s)) return s
    if (s.startsWith("/")) {
      const base = process.env.NEXT_PUBLIC_BASE_URL
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
        || process.env.BASE_URL
        || "http://localhost:3000"
      return `${base}${s}`
    }
    return s
  }

  async sendEmail(params: { to: string; subject: string; html: string }) {
    if (!this.transporter || !this.isVerified) return false

    try {
      const isFullDoc = /^\s*<!DOCTYPE html>/i.test(params.html)
      const htmlOut = isFullDoc ? params.html : this.buildHtmlTemplate({ title: params.subject, bodyHtml: params.html })
      await this.transporter.sendMail({ from: process.env.SMTP_FROM || process.env.GMAIL_USER, to: params.to, subject: params.subject, html: htmlOut })
      console.log(`[EmailService] Email sent to ${params.to}`)
      return true
    } catch (err) {
      console.error(`[EmailService] Failed to send email to ${params.to}:`, err)
      return false
    }
  }

  async sendContractAwardEmail(params: ContractAwardParams) {
    if (!this.transporter || !this.isVerified) return false

    const formatNaira = (v: number) => `NGN ${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(v)}`
    const ctaText = params.isPasswordSetup ? "Log In" : undefined
    const ctaUrl = params.isPasswordSetup ? params.loginUrl : undefined
    const credsBlock = !params.isPasswordSetup && params.loginEmail && params.tempPassword
      ? `<div style="margin-top:8px"><div style="font-weight:600;color:#1f2937">Login Email: ${params.loginEmail}</div><div style="color:#1f2937">Temporary Password: ${params.tempPassword}</div></div>`
      : ""
    const bodyHtml = `
              <p style="margin:0 0 12px 0">Dear ${params.companyName},</p>
              <p style="margin:0 0 12px 0">Your bid has been approved for <strong>${params.projectName}</strong>.</p>
              <div style="margin:16px 0;padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa">
                <div style="margin:4px 0"><span style="color:#6b7280">Budget:</span> <span style="font-weight:600">${formatNaira(params.estimatedBudget)}</span></div>
                <div style="margin:4px 0"><span style="color:#6b7280">Duration:</span> <span style="font-weight:600">${params.estimatedDuration} days</span></div>
              </div>
              ${credsBlock}
              <p style="margin:16px 0">Attached is your contract document.</p>`
    const htmlContent = this.buildHtmlTemplate({ preheader: `Contract Award – ${params.projectName}`, title: `Contract Award Notification – ${params.projectName}`, bodyHtml, ctaText, ctaUrl })

    try {
      const attachments = params.contractPdfBuffer
        ? [
            {
              filename: `Contract_Award_${params.projectName.replace(/\s+/g, "_")}.pdf`,
              content: params.contractPdfBuffer,
              contentType: "application/pdf",
            },
          ]
        : []
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.GMAIL_USER,
        to: params.to,
        subject: `Contract Award - ${params.projectName}`,
        html: htmlContent,
        attachments,
      })
      console.log(`[EmailService] Contract award email sent to ${params.to}`)
      return true
    } catch (err) {
      console.error(`[EmailService] Failed to send contract award email to ${params.to}:`, err)
      return false
    }
  }

  async sendMeetingInviteEmail(params: { to: string; subject: string; html: string; icsContent: string }) {
    if (!this.transporter || !this.isVerified) return false
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.GMAIL_USER,
        to: params.to,
        subject: params.subject,
        html: params.html,
        attachments: [
          {
            filename: "meeting-invite.ics",
            content: params.icsContent,
            contentType: "text/calendar; charset=utf-8; method=REQUEST",
          },
        ],
      })
      console.log(`[EmailService] Meeting invite sent to ${params.to}`)
      return true
    } catch (err) {
      console.error(`[EmailService] Failed to send meeting invite to ${params.to}:`, err)
      return false
    }
  }

  async sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
    if (!this.transporter || !this.isVerified) return false
    const bodyHtml = `
              <p style="margin:0 0 12px 0">Dear ${name},</p>
              <p style="margin:0 0 12px 0">Click the button below to reset your password.</p>
              <p style="margin:0 0 12px 0;color:#6b7280">This link will expire in 24 hours.</p>`
    const html = this.buildHtmlTemplate({ preheader: "Password Reset", title: "Password Reset", bodyHtml, ctaText: "Reset Password", ctaUrl: resetUrl })

    try {
      await this.transporter.sendMail({ from: process.env.SMTP_FROM || process.env.GMAIL_USER, to: email, subject: "Password Reset Request", html })
      console.log(`[EmailService] Password reset email sent to ${email}`)
      return true
    } catch (err) {
      console.error(`[EmailService] Failed to send password reset email to ${email}:`, err)
      return false
    }
  }

  async sendVerificationEmail(email: string, name: string, verifyUrl: string) {
    if (!this.transporter || !this.isVerified) return false
    const bodyHtml = `
              <p style="margin:0 0 12px 0">Dear ${name},</p>
              <p style="margin:0 0 12px 0">Please confirm your email address to activate your account.</p>
              <p style="margin:16px 0;color:#6b7280">This link will expire in 24 hours.</p>`
    const html = this.buildHtmlTemplate({ preheader: "Verify your email", title: "Verify your email", bodyHtml, ctaText: "Verify Email", ctaUrl: verifyUrl })
    try {
      await this.transporter.sendMail({ from: process.env.SMTP_FROM || process.env.GMAIL_USER, to: email, subject: "Verify your email", html })
      console.log(`[EmailService] Verification email sent to ${email}`)
      return true
    } catch (err) {
      console.error(`[EmailService] Failed to send verification email to ${email}:`, err)
      return false
    }
  }

  async generateContractAwardPDF(bid: Bid, ownerName: string, projectTitle: string) {
    const pdf = await PDFDocument.create()
    let page = pdf.addPage([595.28, 841.89])
    const font = await pdf.embedFont(StandardFonts.TimesRoman)
    const margin = 40
    const primaryColor = rgb(0.9176, 0.3451, 0.0471)
    const textColor = rgb(0.1216, 0.1608, 0.2157)
    const lightGray = rgb(0.4196, 0.4549, 0.5020)
    let width = page.getSize().width
    let height = page.getSize().height
    let contentWidth = width - margin * 2
    let cursorY = height - margin
    const lineSize = 12
    const lineGap = Math.round(lineSize * 0.3)

    const newPage = () => {
      page = pdf.addPage([595.28, 841.89])
      width = page.getSize().width
      height = page.getSize().height
      contentWidth = width - margin * 2
      cursorY = height - margin
    }

    const ensureSpace = (needed: number) => {
      if (cursorY - needed < margin) newPage()
    }

    const drawJustifiedLine = (words: string[], size: number, color: any, justify: boolean) => {
      ensureSpace(size + lineGap)
      let x = margin
      const spaceW = font.widthOfTextAtSize(" ", size)
      const wordWidths = words.map((w) => font.widthOfTextAtSize(w, size))
      const totalWords = wordWidths.reduce((a, b) => a + b, 0)
      const gaps = Math.max(words.length - 1, 0)
      const baseTotalSpaces = gaps * spaceW
      const remaining = contentWidth - (totalWords + baseTotalSpaces)
      const extra = justify && gaps > 0 && remaining > 0 ? remaining / gaps : 0
      for (let i = 0; i < words.length; i++) {
        const w = words[i]
        page.drawText(w, { x, y: cursorY - size, size, font, color })
        x += wordWidths[i]
        if (i < words.length - 1) x += spaceW + extra
      }
      cursorY -= size + lineGap
    }

    const wrapToLines = (t: string, size: number) => {
      const words = String(t).split(/\s+/).filter(Boolean)
      const lines: string[] = []
      let cur: string[] = []
      let curWidth = 0
      const spaceW = font.widthOfTextAtSize(" ", size)
      for (const w of words) {
        const wWidth = font.widthOfTextAtSize(w, size)
        const testWidth = curWidth + (cur.length ? spaceW : 0) + wWidth
        if (testWidth <= contentWidth) {
          cur.push(w)
          curWidth = testWidth
        } else {
          if (cur.length) lines.push(cur.join(" "))
          cur = [w]
          curWidth = wWidth
        }
      }
      if (cur.length) lines.push(cur.join(" "))
      return lines.map((ln) => ln.trim())
    }

    const awardDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    const budgetNum = Number((bid as any).amount || 0)
    const formatNaira = (v: number) => `NGN ${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(v)}`
    const budgetFmt = formatNaira(budgetNum)
    const amountInWords = (n: number) => {
      const units = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"]
      const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]
      const toWords = (x: number): string => {
        if (x < 20) return units[x]
        if (x < 100) return `${tens[Math.floor(x/10)]}${x%10 ? "-" + units[x%10] : ""}`
        if (x < 1000) return `${units[Math.floor(x/100)]} hundred${x%100 ? " and " + toWords(x%100) : ""}`
        if (x < 1000000) return `${toWords(Math.floor(x/1000))} thousand${x%1000 ? " " + toWords(x%1000) : ""}`
        if (x < 1000000000) return `${toWords(Math.floor(x/1000000))} million${x%1000000 ? " " + toWords(x%1000000) : ""}`
        return `${toWords(Math.floor(x/1000000000))} billion${x%1000000000 ? " " + toWords(x%1000000000) : ""}`
      }
      return toWords(Math.floor(n))
    }

    ensureSpace(22 + 10)
    page.drawText("CONTRACT AWARD AGREEMENT", { x: margin, y: cursorY - 22, size: 22, font, color: primaryColor })
    cursorY -= 22 + 10
    const sub = `(Issued electronically through the ${process.env.NEXT_PUBLIC_PLATFORM_NAME || "O-BIS"} Construction Management System)`
    const subLines = wrapToLines(sub, 10)
    for (let i = 0; i < subLines.length; i++) {
      const words = subLines[i].split(/\s+/)
      drawJustifiedLine(words, 10, lightGray, false)
    }
    cursorY -= 6

    try {
      const fallback = path.join(process.cwd(), "public", "icon.svg.png")
      const logoPath = process.env.COMPANY_LOGO_PATH || fallback
      const fs = await import("fs/promises")
      const buf = await fs.readFile(logoPath)
      let img
      if (/\.png$/i.test(logoPath)) img = await pdf.embedPng(buf)
      else img = await pdf.embedJpg(buf)
      const logoMargin = 20
      const iw = 64
      const ih = 64
      const lx = width - logoMargin - iw
      const ly = height - logoMargin - ih
      page.drawImage(img, { x: lx, y: ly, width: iw, height: ih })
    } catch {}

    const templateRaw = process.env.CONTRACT_TEMPLATE_TEXT || "Client: {{CLIENT_NAME}}\nAuthorized Manager: {{AUTHORIZED_MANAGER}}\nContractor: {{CONTRACTOR_NAME}}\nRecitals: This Agreement is generated on {{AWARD_DATE}} for {{PROJECT_TITLE}}.\nScope: The Contractor shall execute all work associated with {{PROJECT_TITLE}}.\nContract Sum: {{CONTRACT_SUM}} ({{CONTRACT_SUM_WORDS}}).\nDuration: {{CONTRACT_DURATION}} days.\nPayment Terms: Based on verified milestones.\nObligations: Maintain standards; mobilize resources; safety compliance; provide updates.\nChange Orders: Variations must be approved in-platform.\nTermination: For non-performance or non-compliance.\nAcceptance: Digital acceptance is legally binding.\nExecution: Auto-generated and binding without physical signatures.\nAuthorized By: {{AUTHORIZED_MANAGER}}\nAccepted By: {{CONTRACTOR_NAME}}"

    const replacements: Record<string, string> = {
      "{{CLIENT_NAME}}": String(process.env.COMPANY_NAME || (bid as any).companyName || "Client"),
      "{{COMPANY_ADDRESS}}": String(process.env.COMPANY_ADDRESS || ""),
      "{{COMPANY_EMAIL}}": String(process.env.COMPANY_EMAIL || (bid as any).email || ""),
      "{{AUTHORIZED_MANAGER}}": String(process.env.MANAGER_NAME || ownerName || "Manager"),
      "{{CONTRACTOR_NAME}}": String((bid as any).bidderName || "Contractor"),
      "{{PROJECT_TITLE}}": String(projectTitle || "Project"),
      "{{CONTRACT_SUM}}": String(budgetFmt),
      "{{CONTRACT_SUM_WORDS}}": String(amountInWords(budgetNum)),
      "{{CONTRACT_DURATION}}": String((bid as any).duration || 0),
      "{{AWARD_DATE}}": String(awardDate),
      "{{PLATFORM_NAME}}": String(process.env.NEXT_PUBLIC_PLATFORM_NAME || "O-BIS"),
    }

    let templateText = templateRaw
    for (const k of Object.keys(replacements)) {
      templateText = templateText.split(k).join(replacements[k])
    }

    const sanitizeText = (s: string) => {
      return s.replace(/\u20A6/g, "NGN ").replace(/[^\x00-\x7F]+/g, "")
    }
    templateText = sanitizeText(templateText)

    const blocks = String(templateText).split(/\n{2,}/)
    for (const b of blocks) {
      const lines = wrapToLines(sanitizeText(b), lineSize)
      if (!lines.length) continue
      const firstLineWords = lines[0].split(/\s+/)
      const firstLineHeight = lineSize + lineGap
      if (cursorY - firstLineHeight < margin) newPage()
      for (let i = 0; i < lines.length; i++) {
        const words = lines[i].split(/\s+/)
        const justify = i < lines.length - 1
        drawJustifiedLine(words, lineSize, textColor, justify)
      }
      cursorY -= Math.max(lineGap, 8)
    }

    const mName = String(process.env.MANAGER_NAME || ownerName || "Manager")
    const cName = String((bid as any).bidderName || "Contractor")
    const sigBlockHeight = 160
    ensureSpace(sigBlockHeight)
    page.drawText("IN WITNESS WHEREOF", { x: margin, y: cursorY - 18, size: 18, font, color: primaryColor })
    cursorY -= 18 + 14
    const colW = (contentWidth - 20) / 2
    const leftX = margin
    const rightX = margin + colW + 20
    page.drawText("Authorized By:", { x: leftX, y: cursorY - lineSize, size: lineSize, font, color: textColor })
    cursorY -= lineSize + lineGap
    page.drawText(mName, { x: leftX, y: cursorY - lineSize, size: lineSize, font, color: textColor })
    const sigYLeft = cursorY - lineSize - 6
    page.drawRectangle({ x: leftX, y: sigYLeft, width: colW - 20, height: 1, color: lightGray })
    cursorY = sigYLeft - 14
    page.drawText("Signature", { x: leftX, y: cursorY - 10, size: 10, font, color: lightGray })
    const tempY = cursorY
    cursorY = tempY + lineSize + 4
    page.drawText("Accepted By:", { x: rightX, y: tempY - lineSize, size: lineSize, font, color: textColor })
    page.drawText(cName, { x: rightX, y: tempY - lineSize - lineSize - lineGap, size: lineSize, font, color: textColor })
    const sigYRight = tempY - lineSize - lineSize - lineGap - 6
    page.drawRectangle({ x: rightX, y: sigYRight, width: colW - 20, height: 1, color: lightGray })
    page.drawText("Signature", { x: rightX, y: sigYRight - 14, size: 10, font, color: lightGray })

    const out = await pdf.save()
    return Buffer.from(out)
  }

  async generateSimplePDF(_: Bid, __: string, ___: string) {
    const pdf = await PDFDocument.create()
    const page = pdf.addPage([595.28, 841.89])
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    page.drawText("Contract Award", { x: 40, y: page.getSize().height - 60, size: 20, font, color: rgb(0.9176, 0.3451, 0.0471) })
    const out = await pdf.save()
    return Buffer.from(out)
  }
}

export const emailService = new EmailService()
