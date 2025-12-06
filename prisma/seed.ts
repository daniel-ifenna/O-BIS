import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function run() {
  const managerPass = await bcrypt.hash("Manager123!", 10)
  const manager = await prisma.user.upsert({
    where: { email: "manager@example.com" },
    update: {},
    create: {
      name: "Manager",
      email: "manager@example.com",
      role: "manager",
      passwordHash: managerPass,
    },
  })
  await prisma.manager.upsert({ where: { userId: manager.id }, update: {}, create: { userId: manager.id, company: "Acme" } })

  const contractorPass = await bcrypt.hash("Contractor123!", 10)
  const contractorUser = await prisma.user.upsert({
    where: { email: "contractor@example.com" },
    update: {},
    create: {
      name: "Contractor",
      email: "contractor@example.com",
      role: "contractor",
      passwordHash: contractorPass,
    },
  })

  const contractor = await prisma.contractor.upsert({
    where: { userId: contractorUser.id },
    update: {},
    create: { userId: contractorUser.id },
  })

  const project = await prisma.project.create({
    data: {
      title: "Road Construction Phase I",
      location: "Downtown",
      status: "Published",
      contractorId: contractor.id,
      bidsCount: 0,
    },
  })

  await prisma.bid.create({
    data: {
      projectId: project.id,
      contractorId: contractor.id,
      bidderName: "John Doe",
      companyName: "BuildCorp",
      email: "john@buildcorp.com",
      amount: "500000.00",
      duration: 90,
      status: "New",
    },
  })
}

run()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async () => {
    await prisma.$disconnect()
    process.exit(1)
  })
