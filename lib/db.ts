import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const dbUrl = process.env.DATABASE_URL_PGBOUNCER || process.env.DATABASE_URL || ""

function createPrismaOrMock(): PrismaClient | any {
  if (dbUrl) {
    return new PrismaClient({
      datasources: {
        db: { url: dbUrl },
      },
    })
  }
  const warn = (op: string) => {
    throw new Error(`Database unavailable: set DATABASE_URL before calling ${op}`)
  }
  return new Proxy(
    {},
    {
      get(_, prop) {
        if (prop === "$use") return () => {}
        if (prop === "$transaction") return () => warn("$transaction")
        return () => warn(String(prop))
      },
    },
  ) as PrismaClient
}

export const prisma = globalForPrisma.prisma || createPrismaOrMock()

if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma

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

const TARGET_MODELS = new Set([
  "User",
  "Contractor",
  "Vendor",
  "Manager",
  "Project",
  "Bid",
  "BidInvitation",
  "ProcurementRequest",
  "EscrowWalletTransaction",
  "FileStorageRecord",
  "PaymentRequest",
  "Milestone",
  "DailyReport",
  "VendorQuote",
])

if (typeof (prisma as any).$use === "function") (prisma as any).$use(async (params: any, next: any) => {
  const modelMatches = TARGET_MODELS.has(params.model || "")
  const preventDeletes = String(process.env.ALLOW_DELETE || "").toLowerCase() !== "true"
  if (preventDeletes && (params.action === "delete" || params.action === "deleteMany")) {
    throw new Error("Delete operations are disabled")
  }

  if (modelMatches) {
    const now = new Date()
    const date = fmtDate(now)
    const time = fmtTime(now)
    
    if (params.action === "create") {
      params.args.data = { ...(params.args.data || {}), recordDate: date, recordTime: time }
    } else if (params.action === "createMany") {
      const data = params.args.data
      if (Array.isArray(data)) {
        params.args.data = data.map((item: any) => ({ ...(item || {}), recordDate: date, recordTime: time }))
      } else {
        params.args.data = { ...(data || {}), recordDate: date, recordTime: time }
      }
    } else if (params.action === "update" || params.action === "upsert") {
      params.args.data = { ...(params.args.data || {}), recordDate: date, recordTime: time }
    } else if (params.action === "updateMany") {
      const data = params.args.data
      params.args.data = { ...(data || {}), recordDate: date, recordTime: time }
    }
  }

  return next(params)
})
