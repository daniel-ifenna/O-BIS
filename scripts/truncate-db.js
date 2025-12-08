const fs = require("fs")
const path = require("path")
const { PrismaClient } = require("@prisma/client")

function parseEnvFile(fp) {
  try {
    const txt = fs.readFileSync(fp, "utf8")
    txt.split(/\r?\n/).forEach((line) => {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
      if (m) {
        const key = m[1]
        let val = m[2]
        if (val.startsWith("\"") && val.endsWith("\"")) val = val.slice(1, -1)
        if (!process.env[key]) process.env[key] = val
      }
    })
  } catch {}
}

async function main() {
  parseEnvFile(path.join(process.cwd(), ".env.local"))
  parseEnvFile(path.join(process.cwd(), ".env"))
  const prisma = new PrismaClient()
  try {
    // We'll try to truncate "Payment" first; if it fails (table doesn't exist), we ignore it.
    try { await prisma.$executeRawUnsafe('TRUNCATE TABLE "Payment" RESTART IDENTITY CASCADE;') } catch {}

    const sql = [
      'TRUNCATE TABLE "VendorQuote", "ProcurementRequest", "BidInvitation", "Bid", "FileStorageRecord", "EscrowWalletTransaction", "PaymentRequest", "Milestone", "DailyReport", "Project", "Vendor", "Contractor", "Manager", "User", "PasswordResetToken", "EmailVerificationToken" RESTART IDENTITY CASCADE;'
    ].join("\n")
    await prisma.$executeRawUnsafe(sql)
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.bid.count(),
      prisma.procurementRequest.count(),
      prisma.vendorQuote.count(),
    ])
    console.log("Counts after truncate:", {
      User: counts[0],
      Project: counts[1],
      Bid: counts[2],
      ProcurementRequest: counts[3],
      VendorQuote: counts[4],
    })
    console.log("Database truncate complete")
  } catch (e) {
    console.error("Truncate error:", e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })

