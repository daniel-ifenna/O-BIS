import { promises as fs } from "fs"
import path from "path"
import bcrypt from "bcryptjs"

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

const dataDir = path.join(process.cwd(), "data")

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true })
}

function filePath(name: string) {
  return path.join(dataDir, `${name}.json`)
}

async function readJson<T>(name: string, def: T): Promise<T> {
  await ensureDir()
  const fp = filePath(name)
  try {
    const txt = await fs.readFile(fp, "utf8")
    return JSON.parse(txt) as T
  } catch (e: any) {
    if (e?.code === "ENOENT") {
      await fs.writeFile(fp, JSON.stringify(def, null, 2), "utf8")
      return def
    }
    throw e
  }
}

async function writeJson<T>(name: string, data: T): Promise<void> {
  await ensureDir()
  const fp = filePath(name)
  await fs.writeFile(fp, JSON.stringify(data, null, 2), "utf8")
}

async function seedUsers() {
  const users = await readJson<any[]>("users", [])
  if (users.length > 0) return users
  const rounds = Number(process.env.BCRYPT_ROUNDS || 10)
  const pass = process.env.SEED_PASSWORD || "Test12345!"
  const salt = await bcrypt.genSalt(rounds)
  const hash = await bcrypt.hash(pass, salt)
  const now = new Date()
  const iso = now.toISOString()
  const base = { createdAt: iso, updatedAt: iso, recordDate: fmtDate(now), recordTime: fmtTime(now) }
  const contractor = { id: `u-${Date.now()}`, name: "Seed Contractor", email: "contractor@example.com", role: "contractor", company: "ContCo", passwordHash: hash, ...base }
  const manager = { id: `u-${Date.now() + 1}`, name: "Seed Manager", email: "manager@example.com", role: "manager", company: "MgrCo", passwordHash: hash, ...base }
  const vendor = { id: `u-${Date.now() + 2}`, name: "Seed Vendor", email: "vendor@example.com", role: "vendor", company: "VendCo", passwordHash: hash, ...base }
  const next = [contractor, manager, vendor]
  await writeJson("users", next)
  return next
}

async function seedProjects(managerId: string) {
  const projects = await readJson<any[]>("projects", [])
  if (projects.length > 0) return projects
  const now = new Date()
  const p1 = {
    id: Date.now(),
    title: "Office Renovation",
    location: "Lagos",
    budget: String(50000000),
    status: "Published",
    bids: 0,
    createdAt: now.toISOString(),
    estimatedCost: "",
    contingency: "",
    contingencyPercent: "",
    paymentSchedule: "",
    paymentTerms: "",
    retentionPercent: "",
    managerId,
    recordDate: fmtDate(now),
    recordTime: fmtTime(now),
  }
  const p2 = {
    id: Date.now() + 1,
    title: "Warehouse Upgrade",
    location: "Abuja",
    budget: String(35000000),
    status: "Published",
    bids: 0,
    createdAt: now.toISOString(),
    estimatedCost: "",
    contingency: "",
    contingencyPercent: "",
    paymentSchedule: "",
    paymentTerms: "",
    retentionPercent: "",
    managerId,
    recordDate: fmtDate(now),
    recordTime: fmtTime(now),
  }
  const next = [p1, p2]
  await writeJson("projects", next)
  return next
}

async function seedMilestones(projectId: string | number) {
  const arr = await readJson<any[]>("milestones", [])
  const now = new Date()
  arr.unshift({ id: `ms-${Date.now()}`, projectId: String(projectId), name: "Foundation", startDate: fmtDate(now), endDate: fmtDate(now), weight: 20, progress: 0, status: "Pending" })
  arr.unshift({ id: `ms-${Date.now() + 1}`, projectId: String(projectId), name: "Framing", startDate: fmtDate(now), endDate: fmtDate(now), weight: 30, progress: 0, status: "Pending" })
  await writeJson("milestones", arr)
}

async function seedProcurement(projectId: string | number, contractorId: string) {
  const arr = await readJson<any[]>("public_procurements", [])
  if (arr.length > 0) return arr
  const now = new Date()
  const item = {
    id: `pp-${Date.now()}`,
    projectId: String(projectId),
    contractorId,
    item: "Cement",
    specification: "Grade 42.5R",
    quantity: 1000,
    unit: "kilograms",
    deliveryLocation: "Site A",
    requestedDate: fmtDate(now),
    status: "open",
    createdAt: now.toISOString(),
    publicUrl: `/public-procurement/${Date.now()}`,
    quotes: [],
    selectedQuoteId: undefined,
    isPublic: true,
    recordDate: fmtDate(now),
    recordTime: fmtTime(now),
  }
  arr.unshift(item)
  await writeJson("public_procurements", arr)
  return arr
}

async function seedBids(projectId: string | number, contractorEmail: string, contractorId: string) {
  const arr = await readJson<any[]>("bids", [])
  if (arr.some((b) => String(b.projectId) === String(projectId))) return arr
  const now = new Date()
  const bid = { id: `bid-${Date.now()}`, projectId: String(projectId), contractorId, bidderName: "Seed Contractor", companyName: "ContCo", email: contractorEmail, phone: "0800", address: "1 Road", amount: String(12000000), duration: String(30), message: "We can deliver.", status: "New", submittedAt: now.toISOString(), recordDate: fmtDate(now), recordTime: fmtTime(now) }
  arr.unshift(bid)
  await writeJson("bids", arr)
  return arr
}

async function seedDailyReport(projectId: string | number, contractorId: string) {
  const arr = await readJson<any[]>("daily_reports", [])
  const now = new Date()
  const rep = { id: `dr-${Date.now()}`, projectId: String(projectId), contractorId, date: fmtDate(now), time: fmtTime(now), crew: "Alpha Team", crewChief: "John", totalPersonnel: 10, workDescription: "Foundation", workPercentage: 20, safetyIncidents: 0, qaIssues: 0, attachments: [] }
  arr.unshift(rep)
  await writeJson("daily_reports", arr)
}

async function main() {
  const users = await seedUsers()
  const contractor = users.find((u) => u.role === "contractor")!
  const manager = users.find((u) => u.role === "manager")!
  const projects = await seedProjects(manager.id)
  for (const p of projects) {
    await seedMilestones(p.id)
    await seedBids(p.id, contractor.email, contractor.id)
    await seedDailyReport(p.id, contractor.id)
  }
  await seedProcurement(projects[0].id, contractor.id)
  console.log("Seed complete.")
}

main().catch((e) => { console.error(e); process.exit(1) })
