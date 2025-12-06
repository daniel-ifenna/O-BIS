import { NextResponse, NextRequest } from "next/server"
export const runtime = "nodejs"
import { verifyToken } from "@/lib/auth/jwt"
import { emailService } from "@/lib/email-service"
import { prisma } from "@/lib/db"
import { getBidById, getProjectById, findUserByEmail, createUser, createRoleProfile, sanitizeUser, updateProjectById } from "@/lib/file-db"
import { hashPassword } from "@/lib/auth/password"

function getAuthRole(request: NextRequest): { userId: string; role: string } | null {
  const auth = request.headers.get("authorization") || ""
  const m = /^Bearer\s+(.+)$/i.exec(auth)
  if (!m) return null
  const payload = verifyToken(m[1])
  if (!payload) return null
  return { userId: payload.sub, role: payload.role }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthRole(request)
    if (!auth || (auth.role !== "manager" && auth.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    let ownerName: string = body.ownerName || "Owner"

    let bid: any = null
    let project: any = null
    try {
      bid = await (prisma as any).bid.findUnique({ where: { id } })
    } catch {}
    if (!bid) bid = await getBidById(id)
    if (!bid) return NextResponse.json({ error: "Bid not found" }, { status: 404 })
    try {
      project = await (prisma as any).project.findUnique({ where: { id: bid.projectId } })
    } catch {}
    if (!project) project = await getProjectById(bid.projectId)
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })
    try {
      const mgr = await (prisma as any).manager.findUnique({ where: { id: project.managerId as any }, include: { user: true } })
      const derivedName = mgr?.user?.name || null
      if (!body.ownerName && derivedName) ownerName = derivedName
    } catch {}

    const pdfBuffer = await emailService.generateContractAwardPDF(
      {
        bidderName: bid.bidderName,
        companyName: bid.companyName,
        email: bid.email,
        amount: Number(bid.amount || 0),
        duration: Number(bid.duration || 0),
        message: bid.message,
      } as any,
      ownerName,
      project.title,
    )

    let tempPassword: string | null = null
    let passwordHash: string | null = null
    const now = new Date()
    const recordDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
    const recordTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

    let user: any = null
    let isNewUser = false
    try {
      user = await (prisma as any).user.findUnique({ where: { email: bid.email } })
    } catch {}
    if (!user) {
      isNewUser = true
      tempPassword = Math.random().toString(36).slice(2, 10) + "!A"
      passwordHash = await hashPassword(tempPassword)
      try {
        user = await (prisma as any).user.create({ data: { name: bid.bidderName, email: bid.email, role: "contractor", company: bid.companyName || null, passwordHash, recordDate, recordTime } })
      } catch {}
    }
    if (!user) {
      isNewUser = true
      if (!tempPassword) {
        tempPassword = Math.random().toString(36).slice(2, 10) + "!A"
      }
      if (!passwordHash) {
        passwordHash = await hashPassword(tempPassword)
      }
      const created = await createUser({ name: bid.bidderName, email: bid.email, role: "contractor", company: bid.companyName || undefined, passwordHash })
      await createRoleProfile(created)
      user = sanitizeUser(created)
    }
    // Persist contractor to project and mark project Awarded
    let updatedProject: any = null
    try {
      const contractor = await (prisma as any).contractor.findUnique({ where: { userId: user.id } })
      const ensured = contractor || (await (prisma as any).contractor.create({ data: { userId: user.id, recordDate, recordTime } }))
      updatedProject = await (prisma as any).project.update({ where: { id: project.id }, data: { contractorId: ensured.id, status: "Awarded" as any } })
    } catch {
      updatedProject = await updateProjectById(project.id, { contractorId: user.id, status: "Awarded" as any })
    }
    // Ensure the awarded bid is marked Awarded server-side and reject others
    try {
      await (prisma as any).bid.update({ where: { id }, data: { status: "Awarded" as any, reviewedAt: now } })
      await (prisma as any).bid.updateMany({ where: { projectId: project.id, id: { not: id } }, data: { status: "Rejected" as any, reviewedAt: now } })
    } catch {
      // Fallback to file DB when Prisma is unavailable
      try {
        const { updateBidById } = await import("@/lib/file-db")
        await updateBidById(id, { status: "Awarded" as any, reviewedAt: now.toISOString() as any })
      } catch {}
    }

    let emailError: string | null = null
    let contractSent = false
    try {
      await emailService.sendContractAwardEmail({
        to: bid.email,
        companyName: bid.companyName || bid.bidderName,
        projectName: project.title,
        estimatedBudget: Number(bid.amount || 0),
        estimatedDuration: Number(bid.duration || 0),
        contractPdfBuffer: pdfBuffer || undefined,
        loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/contractor/sign-in`,
        loginEmail: isNewUser ? bid.email : undefined,
        tempPassword: isNewUser ? tempPassword || undefined : undefined,
        isPasswordSetup: !isNewUser,
      })
      contractSent = true
    } catch (e: any) {
      emailError = String(e?.message || "Failed to send email")
    }
    const contractSentAt = new Date().toISOString()
    return NextResponse.json({ ok: true, contractSent, emailError, attachmentIncluded: Boolean(pdfBuffer), contractSentAt, biddingClosed: true, contractor: { id: user.id, name: user.name, email: user.email, role: user.role }, project: updatedProject })

    // done
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Failed to award and provision contractor") }, { status: 500 })
  }
}
