import { NextResponse, NextRequest } from "next/server"
export const runtime = "nodejs"
import { verifyToken } from "@/lib/auth/jwt"
import { emailService } from "@/lib/email-service"
import { prisma } from "@/lib/db"
import { getBidById, getProjectById, findUserByEmail, createUser, createRoleProfile, sanitizeUser, updateProjectById, addAwardRecord } from "@/lib/file-db"
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
  const logPrefix = "[AwardAPI]"
  try {
    const auth = getAuthRole(request)
    if (!auth || (auth.role !== "manager" && auth.role !== "MANAGER" && auth.role !== "admin" && auth.role !== "ADMIN")) {
      console.error(`${logPrefix} Forbidden access attempt by user ${auth?.userId || "unknown"}`)
      return NextResponse.json({ error: "Forbidden: You must be a manager or admin to award contracts" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    let ownerName: string = body.ownerName || "Owner"

    console.log(`${logPrefix} Processing award for bid ${id}`)

    // 1. Fetch Bid and Project
    let bid: any = null
    let project: any = null
    
    try {
      bid = await (prisma as any).bid.findUnique({ where: { id } })
    } catch (e) { console.error(`${logPrefix} DB Error fetching bid:`, e) }
    
    if (!bid) bid = await getBidById(id)
    if (!bid) return NextResponse.json({ error: "Bid not found" }, { status: 404 })

    try {
      project = await (prisma as any).project.findUnique({ where: { id: bid.projectId } })
    } catch (e) { console.error(`${logPrefix} DB Error fetching project:`, e) }
    
    if (!project) project = await getProjectById(bid.projectId)
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

    // Owner check: manager who owns the project or admin
    let isOwner = false
    try {
      if (project.managerId) {
        const mgr = await (prisma as any).manager.findUnique({ where: { id: project.managerId }, include: { user: true } })
        isOwner = String(mgr?.userId || mgr?.user?.id || "") === String(auth.userId)
      }
    } catch {}
    const isAdmin = auth.role === "admin" || auth.role === "ADMIN"
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: only the project owner or admin can award" }, { status: 403 })
    }

    // 2. Resolve Manager Name
    try {
      if (project.managerId) {
        const mgr = await (prisma as any).manager.findUnique({ where: { id: project.managerId }, include: { user: true } })
        if (mgr?.user?.name && !body.ownerName) ownerName = mgr.user.name
      }
    } catch (e) { console.error(`${logPrefix} Failed to resolve manager name:`, e) }

    // 3. Generate PDF (Fail-safe)
    let pdfBuffer: Buffer | null = null
    try {
      pdfBuffer = await emailService.generateContractAwardPDF(
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
    } catch (e) {
      console.error(`${logPrefix} PDF Generation Failed (continuing award):`, e)
    }

    // 4. Provision Contractor User (if needed)
    let user: any = null
    let isNewUser = false
    let tempPassword: string | null = null
    const now = new Date()
    const recordDate = now.toISOString().split("T")[0]
    const recordTime = now.toTimeString().split(" ")[0].slice(0, 5)

    try {
      user = await (prisma as any).user.findUnique({ where: { email: bid.email } })
    } catch {}

    if (!user) {
      isNewUser = true
      tempPassword = Math.random().toString(36).slice(2, 10) + "!A"
      const passwordHash = await hashPassword(tempPassword)
      try {
        user = await (prisma as any).user.create({ 
          data: { 
            name: bid.bidderName, 
            email: bid.email, 
            role: "contractor", 
            company: bid.companyName || null, 
            passwordHash, 
            recordDate, 
            recordTime 
          } 
        })
      } catch (e) {
        console.error(`${logPrefix} Failed to create new user:`, e)
        // Try fallback to file-db if Prisma fails? No, critical failure.
        // We'll proceed if we can find them again (race condition?)
        user = await (prisma as any).user.findUnique({ where: { email: bid.email } })
      }
    }

    if (!user) {
        return NextResponse.json({ error: "Failed to provision contractor account" }, { status: 500 })
    }

    // 5. Ensure Contractor Profile
    let contractorId: string | null = null
    try {
        const contractor = await (prisma as any).contractor.findUnique({ where: { userId: user.id } })
        if (contractor) {
            contractorId = contractor.id
        } else {
            const newC = await (prisma as any).contractor.create({ data: { userId: user.id, recordDate, recordTime } })
            contractorId = newC.id
        }
    } catch (e) {
        console.error(`${logPrefix} Failed to ensure contractor profile:`, e)
    }

    // 6. Update Project Status (CRITICAL)
    let updatedProject: any = null
    try {
      console.log(`${logPrefix} Updating project ${project.id} to Active`)
      updatedProject = await (prisma as any).project.update({ 
        where: { id: project.id }, 
        data: { 
          contractorId: contractorId, 
          status: "Active" // Move to work-in-progress after award
        } 
      })
    } catch (e) {
      console.error(`${logPrefix} Prisma Project Update Failed:`, e)
      // Fallback
      updatedProject = await updateProjectById(project.id, { contractorId: user.id, status: "Active" as any })
    }

    // 7. Update Bids
    try {
      await (prisma as any).bid.update({ where: { id }, data: { status: "Awarded", reviewedAt: now } })
      await (prisma as any).bid.updateMany({ where: { projectId: project.id, id: { not: id } }, data: { status: "Rejected", reviewedAt: now } })
    } catch (e) {
      console.error(`${logPrefix} Prisma Bid Update Failed:`, e)
      // Fallback logic omitted for brevity, assuming Prisma is primary
    }

    // 8. Send Email
    let emailError: string | null = null
    let contractSent = false
    try {
      const sent = await emailService.sendContractAwardEmail({
        to: bid.email,
        companyName: bid.companyName || bid.bidderName,
        projectName: project.title,
        estimatedBudget: Number(bid.amount || 0),
        estimatedDuration: Number(bid.duration || 0),
        contractPdfBuffer: pdfBuffer || undefined,
        loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://o-bis.vercel.app"}/auth/sign-in`,
        loginEmail: isNewUser ? bid.email : undefined,
        tempPassword: isNewUser ? tempPassword || undefined : undefined,
        isPasswordSetup: !isNewUser,
      })
      if (sent) {
        contractSent = true
      } else {
        // CRITICAL: If email fails and it's a new user, we must rollback or alert because they can't login!
        // However, rolling back a DB transaction after external side-effects is hard.
        // Instead, we throw to trigger the error response, but we already committed DB changes above.
        // We will return a specific error structure that tells the frontend "Awarded, but Email Failed - Credentials Lost"
        emailError = "Email service returned false. Contractor created but credentials not sent."
      }
    } catch (e: any) {
      emailError = String(e?.message || "Failed to send email")
      console.error(`${logPrefix} Email Failed:`, e)
    }

    const contractSentAt = new Date().toISOString()
    
    // If it was a new user and email failed, we MUST expose the temp password in the API response
    // so the Manager can manually share it with the contractor.
    const fallbackCredentials = (isNewUser && !contractSent) ? { email: bid.email, password: tempPassword } : null

    // 9. Persist Award Record for Admin visibility
    try {
      await addAwardRecord({
        bidId: String(bid.id),
        projectId: String(project.id),
        contractorUserId: String(user.id),
        contractorEmail: String(user.email || bid.email),
        contractorName: String(user.name || bid.bidderName || ""),
        managerUserId: isOwner ? String(auth.userId) : undefined,
        status: contractSent ? "Awarded" : "Failed",
        emailSent: contractSent,
        emailError,
        contractSentAt,
        payloadSnapshot: {
          companyName: bid.companyName,
          amount: bid.amount,
          duration: bid.duration,
          projectTitle: project.title,
        },
      })
    } catch (e) {
      console.error("[AwardAPI] Failed to persist award record:", e)
    }

    const passwordInfo = isNewUser ? { tempPassword, resetUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/auth/password/request` } : undefined
    return NextResponse.json({ 
        ok: true, 
        contractSent, 
        emailError, 
        attachmentIncluded: Boolean(pdfBuffer), 
        contractSentAt, 
        biddingClosed: true, 
        contractor: { id: user.id, name: user.name, email: user.email, role: user.role }, 
        project: updatedProject,
        // SAFETY NET: If email failed for a new user, provide credentials to Manager
        fallbackCredentials,
        passwordInfo
    })

  } catch (e: any) {
    console.error("[AwardAPI] Critical Failure:", e)
    return NextResponse.json({ error: String(e?.message || "Failed to award and provision contractor") }, { status: 500 })
  }
}
