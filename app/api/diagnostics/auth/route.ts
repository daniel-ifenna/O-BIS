import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword, verifyPassword } from "@/lib/auth/password"
import { signToken } from "@/lib/auth/jwt"

export const dynamic = "force-dynamic"

function hr() { return typeof performance !== "undefined" && performance.now ? performance.now() : Date.now() }

export async function GET(request: NextRequest) {
  const t0 = hr()
  const metrics: Record<string, any> = { ok: true }
  metrics.env = {
    node: process.version,
    region: (process.env.VERCEL_REGION || process.env.FLY_REGION || process.env.AWS_REGION || "local"),
    dbConfigured: Boolean(process.env.DATABASE_URL_PGBOUNCER || process.env.DATABASE_URL),
  }
  try {
    const tDbStart = hr()
    // Lightweight DB operations
    const ping = await prisma.$queryRawUnsafe("SELECT 1")
    const tPing = hr()
    const usersCount = await prisma.user.count().catch(() => -1)
    const tCount = hr()

    metrics.db = {
      pingMs: Math.round(tPing - tDbStart),
      countMs: Math.round(tCount - tPing),
      usersCount,
    }
  } catch (e: any) {
    metrics.db = { error: String(e?.message || e) }
  }
  try {
    const tHashStart = hr()
    const hash = await hashPassword("DiagPassw0rd!")
    const tHash = hr()
    const valid = await verifyPassword("DiagPassw0rd!", hash)
    const tVerify = hr()
    const token = signToken({ sub: "diag", role: "manager" as any })
    const tSign = hr()
    metrics.crypto = {
      hashMs: Math.round(tHash - tHashStart),
      verifyMs: Math.round(tVerify - tHash),
      signMs: Math.round(tSign - tVerify),
      jwtLen: token.length,
      verifyOk: valid,
    }
  } catch (e: any) {
    metrics.crypto = { error: String(e?.message || e) }
  }
  metrics.totalMs = Math.round(hr() - t0)
  return NextResponse.json(metrics)
}

