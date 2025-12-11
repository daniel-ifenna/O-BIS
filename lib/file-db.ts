import { promises as fs } from "fs"
import path from "path"
import type { PublicProcurementRequest, Quote, ContractorComplaint, VendorProfile, Bid, Project, Milestone, DailyReport } from "./database-schema"

export type StoredUser = {
  id: string
  name: string
  email: string
  role: "manager" | "contractor" | "vendor"
  company?: string
  passwordHash: string
  createdAt: string
  updatedAt: string
}

const dataDir = path.join(process.cwd(), "data")

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

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true })
}

function filePath(name: string) {
  return path.join(dataDir, `${name}.json`)
}

async function readJson<T>(name: string, defaultValue: T): Promise<T> {
  await ensureDir()
  const fp = filePath(name)
  try {
    const buf = await fs.readFile(fp, "utf8")
    return JSON.parse(buf) as T
  } catch (e: any) {
    if (e && (e.code === "ENOENT" || e.code === "ERR_MODULE_NOT_FOUND")) {
      await fs.writeFile(fp, JSON.stringify(defaultValue, null, 2), "utf8")
      return defaultValue
    }
    throw e
  }
}

async function writeJson<T>(name: string, data: T): Promise<void> {
  await ensureDir()
  const fp = filePath(name)
  await fs.writeFile(fp, JSON.stringify(data, null, 2), "utf8")
}

export async function getUsers(): Promise<StoredUser[]> {
  return readJson<StoredUser[]>("users", [])
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const users = await getUsers()
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export async function updateUserPasswordById(userId: string, newHash: string): Promise<StoredUser | undefined> {
  const users = await getUsers()
  const next = users.map((u) => (u.id === userId ? { ...u, passwordHash: newHash, updatedAt: new Date().toISOString() } : u))
  await writeJson("users", next)
  return next.find((u) => u.id === userId)
}

type ResetTokenRecord = { token: string; userId: string; issuedAt: string; expiresAt: string; used: boolean; recordDate: string; recordTime: string }

export async function getResetTokens(): Promise<ResetTokenRecord[]> {
  return readJson<ResetTokenRecord[]>("reset_tokens", [])
}

export async function saveResetTokens(items: ResetTokenRecord[]): Promise<void> {
  await writeJson("reset_tokens", items)
}

export async function createUser(
  user: Omit<StoredUser, "id" | "createdAt" | "updatedAt">,
): Promise<StoredUser> {
  const users = await getUsers()
  const now = new Date()
  const iso = now.toISOString()
  const newUser: StoredUser = { ...user, id: `${Date.now()}`, createdAt: iso, updatedAt: iso } as StoredUser & { recordDate: string; recordTime: string }
  ;(newUser as any).recordDate = fmtDate(now)
  ;(newUser as any).recordTime = fmtTime(now)
  await writeJson("users", [newUser, ...users])
  return newUser
}

export function sanitizeUser(u: StoredUser) {
  const { passwordHash, ...rest } = u
  return rest
}

type BasicProfile = {
  id: string
  userId: string
  email: string
  companyName?: string
  createdAt: string
  updatedAt: string
}

export async function createRoleProfile(user: StoredUser): Promise<void> {
  const now = new Date()
  const iso = now.toISOString()
  const profile: BasicProfile = {
    id: `${user.role}-${Date.now()}`,
    userId: user.id,
    email: user.email,
    companyName: user.company,
    createdAt: iso,
    updatedAt: iso,
  }
  ;(profile as any).recordDate = fmtDate(now)
  ;(profile as any).recordTime = fmtTime(now)
  if (user.role === "vendor") {
    const arr = await readJson<BasicProfile[]>("vendor_profiles", [])
    await writeJson("vendor_profiles", [profile, ...arr])
    return
  }
  if (user.role === "manager") {
    const arr = await readJson<BasicProfile[]>("managers", [])
    await writeJson("managers", [profile, ...arr])
    return
  }
  if (user.role === "contractor") {
    const arr = await readJson<BasicProfile[]>("contractors", [])
    await writeJson("contractors", [profile, ...arr])
    return
  }
}

export async function getProcurements(): Promise<PublicProcurementRequest[]> {
  return readJson<PublicProcurementRequest[]>("public_procurements", [])
}

export async function saveProcurements(items: PublicProcurementRequest[]): Promise<void> {
  await writeJson("public_procurements", items)
}

export async function getProcurementById(id: string): Promise<PublicProcurementRequest | undefined> {
  const arr = await getProcurements()
  return arr.find((p) => p.id === id)
}

export async function addQuoteToProcurement(procurementId: string, quote: Quote): Promise<PublicProcurementRequest | undefined> {
  const arr = await getProcurements()
  const next = arr.map((p) => {
    if (p.id === procurementId) {
      const updated: PublicProcurementRequest = { ...p, quotes: [...(p.quotes || []), quote], status: "quoted" }
      return updated
    }
    return p
  })
  await saveProcurements(next)
  return next.find((p) => p.id === procurementId)
}

export async function getVendorProfiles(): Promise<VendorProfile[]> {
  return readJson<VendorProfile[]>("vendor_profiles", [])
}

export async function saveVendorProfiles(items: VendorProfile[]): Promise<void> {
  await writeJson("vendor_profiles", items)
}

export async function findVendorProfileById(id: string): Promise<VendorProfile | undefined> {
  const arr = await getVendorProfiles()
  return arr.find((v) => v.id === id)
}

export async function createVendorProfile(profile: VendorProfile): Promise<VendorProfile> {
  const arr = await getVendorProfiles()
  const next = [profile, ...arr]
  await saveVendorProfiles(next)
  return profile
}

export async function getComplaints(): Promise<ContractorComplaint[]> {
  return readJson<ContractorComplaint[]>("contractor_complaints", [])
}

export async function saveComplaints(items: ContractorComplaint[]): Promise<void> {
  await writeJson("contractor_complaints", items)
}

export async function createComplaint(input: Omit<ContractorComplaint, "id" | "filedAt">): Promise<ContractorComplaint> {
  const arr = await getComplaints()
  const now = new Date()
  const iso = now.toISOString()
  const id = `complaint-${Date.now()}`
  const complaint: ContractorComplaint = { ...input, id, filedAt: iso }
  ;(complaint as any).recordDate = fmtDate(now)
  ;(complaint as any).recordTime = fmtTime(now)
  await saveComplaints([complaint, ...arr])
  return complaint
}

export async function updateComplaintStatus(id: string, status: ContractorComplaint["status"]): Promise<ContractorComplaint | undefined> {
  const arr = await getComplaints()
  const now = new Date()
  const next = arr.map((c) => (c.id === id ? ({ ...(c as any), status, acknowledgedAt: status === "acknowledged" ? now.toISOString() : c.acknowledgedAt, recordDate: fmtDate(now), recordTime: fmtTime(now) }) : c))
  await saveComplaints(next)
  return next.find((c) => c.id === id)
}

export async function getComplaintsByManager(managerId: string): Promise<ContractorComplaint[]> {
  const arr = await getComplaints()
  return arr.filter((c) => c.managerId === managerId)
}

export async function getBids(): Promise<Bid[]> {
  return readJson<Bid[]>("bids", [])
}

export async function saveBids(items: Bid[]): Promise<void> {
  await writeJson("bids", items)
}

export async function getBidsByProjectId(projectId: string | number): Promise<Bid[]> {
  const arr = await getBids()
  return arr.filter((b) => String(b.projectId) === String(projectId))
}

export async function getBidById(id: string): Promise<Bid | undefined> {
  const arr = await getBids()
  return arr.find((b) => b.id === id)
}

export async function createBid(projectId: string | number, bid: Omit<Bid, "id" | "projectId" | "status" | "submittedAt">): Promise<Bid> {
  const arr = await getBids()
  const now = new Date()
  const iso = now.toISOString()
  const newBid: Bid = {
    ...bid,
    id: `bid-${Date.now()}`,
    projectId: String(projectId),
    status: "New",
    submittedAt: iso,
  }
  ;(newBid as any).recordDate = fmtDate(now)
  ;(newBid as any).recordTime = fmtTime(now)
  await saveBids([newBid, ...arr])
  return newBid
}

export async function updateBidById(id: string, updates: Partial<Bid>): Promise<Bid | undefined> {
  const arr = await getBids()
  const now = new Date()
  const next = arr.map((b) => (b.id === id ? ({ ...(b as any), ...(updates as any), recordDate: fmtDate(now), recordTime: fmtTime(now) }) : b))
  await saveBids(next)
  return next.find((b) => b.id === id)
}

export async function deleteBidById(id: string): Promise<void> {
  const arr = await getBids()
  await saveBids(arr.filter((b) => b.id !== id))
}

// ===================== Bid Invitations =====================
export type BidInvitationRecord = {
  id: string
  bidId: string
  projectId: string | number
  meetingTitle: string
  date: string
  time: string
  googleMeetLink: string
  message?: string
  attendees: string[]
  sentTo: string[]
  createdAt: string
  recordDate: string
  recordTime: string
}

export async function getBidInvitations(): Promise<BidInvitationRecord[]> {
  return readJson<BidInvitationRecord[]>("bidInvitations", [])
}

export async function saveBidInvitations(items: BidInvitationRecord[]): Promise<void> {
  await writeJson("bidInvitations", items)
}

export async function getBidInvitationsByBidId(bidId: string): Promise<BidInvitationRecord[]> {
  const arr = await getBidInvitations()
  return arr.filter((r) => r.bidId === bidId)
}

export async function addBidInvitation(record: Omit<BidInvitationRecord, "id" | "createdAt" | "recordDate" | "recordTime">): Promise<BidInvitationRecord> {
  const arr = await getBidInvitations()
  const now = new Date()
  const iso = now.toISOString()
  const item: BidInvitationRecord = {
    ...record,
    id: `inv-${Date.now()}`,
    createdAt: iso,
    recordDate: fmtDate(now),
    recordTime: fmtTime(now),
  }
  await saveBidInvitations([item, ...arr])
  return item
}

export async function getProjects(): Promise<Project[]> {
  return readJson<Project[]>("projects", [])
}

export async function saveProjects(items: Project[]): Promise<void> {
  await writeJson("projects", items)
}

export async function getProjectById(id: string | number): Promise<Project | undefined> {
  const arr = await getProjects()
  return arr.find((p) => String(p.id) === String(id))
}

export async function createProject(project: Omit<Project, "id" | "createdAt">): Promise<Project> {
  const arr = await getProjects()
  const id = Date.now()
  const now = new Date()
  const iso = now.toISOString()
  const newProject: Project = { ...project, id, createdAt: iso }
  ;(newProject as any).recordDate = fmtDate(now)
  ;(newProject as any).recordTime = fmtTime(now)
  await saveProjects([newProject, ...arr])
  return newProject
}

export async function updateProjectById(id: string | number, updates: Partial<Project>): Promise<Project | undefined> {
  const arr = await getProjects()
  const now = new Date()
  const next = arr.map((p) => (String(p.id) === String(id) ? ({ ...(p as any), ...(updates as any), recordDate: fmtDate(now), recordTime: fmtTime(now) }) : p))
  await saveProjects(next)
  return next.find((p) => String(p.id) === String(id))
}

// ===================== Milestones =====================
export async function getMilestones(): Promise<Milestone[]> {
  return readJson<Milestone[]>("milestones", [])
}

export async function saveMilestones(items: Milestone[]): Promise<void> {
  await writeJson("milestones", items)
}

export async function getMilestonesByProjectId(projectId: string | number): Promise<Milestone[]> {
  const arr = await getMilestones()
  return arr.filter((m) => String(m.projectId) === String(projectId))
}

export async function setProjectMilestones(projectId: string | number, items: Omit<Milestone, "id" | "projectId" | "progress" | "status">[]): Promise<Milestone[]> {
  const existing = await getMilestones()
  const filtered = existing.filter((m) => String(m.projectId) !== String(projectId))
  const nowItems: Milestone[] = items.map((i) => ({
    id: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    projectId: String(projectId),
    name: i.name,
    startDate: i.startDate,
    endDate: i.endDate,
    weight: i.weight,
    progress: 0,
    status: "Pending" as Milestone["status"],
  }))
  await saveMilestones([...nowItems, ...filtered])
  return nowItems
}

export async function updateMilestoneProgress(projectId: string | number, milestoneId: string, newProgress: number): Promise<Milestone | undefined> {
  const arr = await getMilestones()
  const next = arr.map((m) => {
    if (m.id === milestoneId && String(m.projectId) === String(projectId)) {
      const progress = Math.max(m.progress, Math.min(100, newProgress))
      const status = (progress >= 100 ? "Completed" : progress > 0 ? "In Progress" : "Pending") as Milestone["status"]
      return { ...m, progress, status }
    }
    return m
  })
  await saveMilestones(next)
  return next.find((m) => m.id === milestoneId)
}

// ===================== Daily Reports =====================
export async function getDailyReports(): Promise<DailyReport[]> {
  return readJson<DailyReport[]>("daily_reports", [])
}

export async function saveDailyReports(items: DailyReport[]): Promise<void> {
  await writeJson("daily_reports", items)
}

export async function getDailyReportsByProjectId(projectId: string | number): Promise<DailyReport[]> {
  const arr = await getDailyReports()
  return arr.filter((r) => String(r.projectId) === String(projectId))
}

export async function createDailyReport(report: Omit<DailyReport, "id">): Promise<DailyReport> {
  const arr = await getDailyReports()
  const now = new Date()
  const newReport: DailyReport = { ...report, id: `dr-${Date.now()}` }
  ;(newReport as any).recordDate = fmtDate(now)
  ;(newReport as any).recordTime = fmtTime(now)
  await saveDailyReports([newReport, ...arr])
  return newReport
}

// ===================== Contract Awards =====================
export type AwardRecord = {
  id: string
  bidId: string
  projectId: string | number
  contractorUserId: string
  contractorEmail: string
  contractorName?: string
  managerUserId?: string
  status: "Awarded" | "Failed"
  emailSent: boolean
  emailError?: string | null
  contractSentAt?: string
  payloadSnapshot?: any
  createdAt: string
  recordDate: string
  recordTime: string
}

export async function getAwardRecords(): Promise<AwardRecord[]> {
  return readJson<AwardRecord[]>("award_records", [])
}

export async function saveAwardRecords(items: AwardRecord[]): Promise<void> {
  await writeJson("award_records", items)
}

export async function addAwardRecord(record: Omit<AwardRecord, "id" | "createdAt" | "recordDate" | "recordTime">): Promise<AwardRecord> {
  const arr = await getAwardRecords()
  const now = new Date()
  const iso = now.toISOString()
  const item: AwardRecord = {
    ...record,
    id: `award-${Date.now()}`,
    createdAt: iso,
    recordDate: fmtDate(now),
    recordTime: fmtTime(now),
  }
  await saveAwardRecords([item, ...arr])
  return item
}

export type AdminControls = {
  freezeInternalTransfers: boolean
  suspiciousAmountThreshold: number
}

export async function getAdminControls(): Promise<AdminControls> {
  return readJson<AdminControls>("admin_controls", { freezeInternalTransfers: false, suspiciousAmountThreshold: 5000000 })
}

export async function setAdminControls(ctrl: Partial<AdminControls>): Promise<AdminControls> {
  const current = await getAdminControls()
  const next = { ...current, ...ctrl }
  await writeJson("admin_controls", next)
  return next
}

export type InternalTransferRequest = {
  id: string
  fromUserId: string
  toUserId: string
  amount: number
  description: string
  projectId?: string | null
  paymentRequestId?: string | null
  status: "pending" | "approved" | "declined"
  flaggedLarge?: boolean
  createdAt: string
  recordDate: string
  recordTime: string
  approvedAt?: string
  approvedBy?: string
}

export async function getInternalTransferRequests(): Promise<InternalTransferRequest[]> {
  return readJson<InternalTransferRequest[]>("internal_transfer_requests", [])
}

export async function addInternalTransferRequest(rec: Omit<InternalTransferRequest, "id" | "createdAt" | "recordDate" | "recordTime">): Promise<InternalTransferRequest> {
  const arr = await getInternalTransferRequests()
  const now = new Date()
  const iso = now.toISOString()
  const item: InternalTransferRequest = { ...rec, id: `itr-${Date.now()}`, createdAt: iso, recordDate: fmtDate(now), recordTime: fmtTime(now) }
  await writeJson("internal_transfer_requests", [item, ...arr])
  return item
}

export async function updateInternalTransferRequest(id: string, updates: Partial<InternalTransferRequest>): Promise<InternalTransferRequest | undefined> {
  const arr = await getInternalTransferRequests()
  const next = arr.map((r) => (r.id === id ? { ...r, ...updates } : r))
  await writeJson("internal_transfer_requests", next)
  return next.find((r) => r.id === id)
}
