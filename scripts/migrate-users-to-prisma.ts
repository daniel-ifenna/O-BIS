import { promises as fs } from "fs"
import path from "path"
import { PrismaClient } from "@prisma/client"

type JsonUser = {
  id: string
  name: string
  email: string
  role: "manager" | "contractor" | "vendor"
  company?: string
  passwordHash: string
  createdAt?: string
  updatedAt?: string
  recordDate?: string
  recordTime?: string
}

async function readJsonUsers(): Promise<JsonUser[]> {
  const fp = path.join(process.cwd(), "data", "users.json")
  try {
    const txt = await fs.readFile(fp, "utf8")
    const arr = JSON.parse(txt)
    return Array.isArray(arr) ? (arr as JsonUser[]) : []
  } catch (e: any) {
    if (e?.code === "ENOENT") return []
    throw e
  }
}

async function main() {
  const prisma = new PrismaClient()
  try {
    const users = await readJsonUsers()
    if (users.length === 0) {
      console.log("No users found in data/users.json; nothing to migrate.")
      return
    }
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
    for (const u of users) {
      const existing = await prisma.user.findUnique({ where: { email: u.email } })
      let user
      if (existing) {
        user = await prisma.user.update({
          where: { email: u.email },
          data: {
            name: u.name,
            role: u.role,
            company: u.company || null,
            passwordHash: u.passwordHash,
            updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
          },
        })
      } else {
        user = await prisma.user.create({
          data: {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            company: u.company || null,
            passwordHash: u.passwordHash,
            createdAt: u.createdAt ? new Date(u.createdAt) : undefined,
            updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
            recordDate: u.recordDate || fmtDate(u.createdAt ? new Date(u.createdAt) : new Date()),
            recordTime: u.recordTime || fmtTime(u.createdAt ? new Date(u.createdAt) : new Date()),
          },
        })
      }
      if (u.role === "manager") {
        await prisma.manager.upsert({
          where: { userId: user.id },
          update: { company: u.company || null },
          create: {
            userId: user.id,
            company: u.company || null,
            recordDate: u.recordDate || fmtDate(new Date()),
            recordTime: u.recordTime || fmtTime(new Date()),
          },
        })
      } else if (u.role === "contractor") {
        await prisma.contractor.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            recordDate: u.recordDate || fmtDate(new Date()),
            recordTime: u.recordTime || fmtTime(new Date()),
          },
        })
      } else if (u.role === "vendor") {
        await prisma.vendor.upsert({
          where: { userId: user.id },
          update: { company: u.company || null },
          create: {
            userId: user.id,
            company: u.company || null,
            recordDate: u.recordDate || fmtDate(new Date()),
            recordTime: u.recordTime || fmtTime(new Date()),
          },
        })
      }
      console.log(`Migrated user ${u.email} (${u.role}) → ${user.id}`)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
