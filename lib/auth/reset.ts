import * as jwt from "jsonwebtoken"
import { prisma } from "@/lib/db"

function fmtDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function fmtTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${h}:${min}`
}

export async function issueResetToken(userId: string, expiresIn = process.env.JWT_EXPIRES_IN || "24h"): Promise<{ token: string; recordDate: string; recordTime: string; expiresAt: string }> {
  const secret = process.env.JWT_SECRET || ""
  if (!secret) throw new Error("Missing JWT_SECRET")
  const now = new Date()
  const token = jwt.sign({ sub: userId, type: "password_reset" } as jwt.JwtPayload, secret as jwt.Secret, { expiresIn } as jwt.SignOptions)
  const decoded = jwt.decode(token) as any
  const expMs = decoded?.exp ? decoded.exp * 1000 : now.getTime() + 24 * 60 * 60 * 1000
  const expiresAt = new Date(expMs).toISOString()
  const recordDate = fmtDate(now)
  const recordTime = fmtTime(now)

  await (prisma as any).passwordResetToken.create({ data: { token, userId, issuedAt: now, expiresAt: new Date(expiresAt), used: false, recordDate, recordTime } })
  return { token, recordDate, recordTime, expiresAt }
}

export async function validateResetToken(token: string): Promise<{ valid: boolean; userId?: string; reason?: string }> {
  const secret = process.env.JWT_SECRET || ""
  if (!secret) return { valid: false, reason: "Missing JWT_SECRET" }
  try {
    const payload = jwt.verify(token, secret as jwt.Secret) as any
    if (payload?.type !== "password_reset") return { valid: false, reason: "Invalid token type" }
    const rec = await (prisma as any).passwordResetToken.findUnique({ where: { token } })
    if (!rec) return { valid: false, reason: "Token not found" }
    if (rec.used) return { valid: false, reason: "Token already used" }
    if (new Date(rec.expiresAt).getTime() < Date.now()) return { valid: false, reason: "Token expired" }
    return { valid: true, userId: rec.userId }
  } catch (e: any) {
    return { valid: false, reason: e?.message || "Invalid token" }
  }
}

export async function consumeResetToken(token: string): Promise<void> {
  await (prisma as any).passwordResetToken.update({ where: { token }, data: { used: true } })
}

export async function issueVerificationToken(userId: string, expiresIn = process.env.JWT_EXPIRES_IN || "24h"): Promise<{ token: string; recordDate: string; recordTime: string; expiresAt: string }> {
  const secret = process.env.JWT_SECRET || ""
  if (!secret) throw new Error("Missing JWT_SECRET")
  const now = new Date()
  const token = (jwt as any).sign({ sub: userId, type: "email_verification" }, secret, { expiresIn })
  const decoded: any = (jwt as any).decode(token)
  const expMs = decoded?.exp ? decoded.exp * 1000 : now.getTime() + 24 * 60 * 60 * 1000
  const expiresAt = new Date(expMs).toISOString()
  const recordDate = fmtDate(now)
  const recordTime = fmtTime(now)
  const m = (prisma as any).emailVerificationToken
  const alt = (prisma as any).passwordResetToken
  if (m && typeof m.create === "function") {
    await m.create({ data: { token, userId, issuedAt: now, expiresAt: new Date(expiresAt), used: false, recordDate, recordTime } })
  } else if (alt && typeof alt.create === "function") {
    await alt.create({ data: { token, userId, issuedAt: now, expiresAt: new Date(expiresAt), used: false, recordDate, recordTime } })
  } else {
    throw new Error("Verification token storage unavailable")
  }
  return { token, recordDate, recordTime, expiresAt }
}

export async function validateVerificationToken(token: string): Promise<{ valid: boolean; userId?: string; reason?: string }> {
  const secret = process.env.JWT_SECRET || ""
  if (!secret) return { valid: false, reason: "Missing JWT_SECRET" }
  try {
    const payload: any = (jwt as any).verify(token, secret)
    if (payload?.type !== "email_verification") return { valid: false, reason: "Invalid token type" }
    const m = (prisma as any).emailVerificationToken
    const alt = (prisma as any).passwordResetToken
    const rec = m && typeof m.findUnique === "function" ? await m.findUnique({ where: { token } }) : alt && typeof alt.findUnique === "function" ? await alt.findUnique({ where: { token } }) : null
    if (!rec) return { valid: false, reason: "Token not found" }
    if (rec.used) return { valid: false, reason: "Token already used" }
    if (new Date(rec.expiresAt).getTime() < Date.now()) return { valid: false, reason: "Token expired" }
    return { valid: true, userId: rec.userId }
  } catch (e: any) {
    return { valid: false, reason: e?.message || "Invalid token" }
  }
}

export async function consumeVerificationToken(token: string): Promise<void> {
  const m = (prisma as any).emailVerificationToken
  const alt = (prisma as any).passwordResetToken
  if (m && typeof m.update === "function") {
    await m.update({ where: { token }, data: { used: true } })
    return
  }
  if (alt && typeof alt.update === "function") {
    await alt.update({ where: { token }, data: { used: true } })
    return
  }
  throw new Error("Verification token storage unavailable")
}
