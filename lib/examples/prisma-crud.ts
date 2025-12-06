import { prisma } from "@/lib/db"

export async function createUser(input: { name: string; email: string; role: "manager" | "contractor" | "vendor"; passwordHash: string; company?: string }) {
  return prisma.user.create({ data: input })
}

export async function createProject(input: { title: string; location: string; status: "Published" | "Bidding" | "Closed" | "Awarded" | "Completed"; contractorId?: string; budget?: string }) {
  return prisma.project.create({ data: input })
}

export async function submitBid(input: { projectId: string; contractorId?: string; bidderName: string; companyName: string; email: string; amount: string; duration: number }) {
  const bid = await prisma.bid.create({ data: { ...input, status: "New" } })
  await prisma.project.update({ where: { id: input.projectId }, data: { bidsCount: { increment: 1 } } })
  return bid
}

export async function listProjectBids(projectId: string) {
  return prisma.bid.findMany({ where: { projectId }, orderBy: { submittedAt: "desc" } })
}

export async function updateBidStatus(bidId: string, status: "Reviewed" | "Accepted" | "Rejected") {
  return prisma.bid.update({ where: { id: bidId }, data: { status, reviewedAt: new Date() } })
}

export async function deleteProject(projectId: string) {
  return prisma.project.delete({ where: { id: projectId } })
}

