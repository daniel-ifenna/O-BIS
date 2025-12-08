const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting admin setup...');

  // 1. Remove all seeded data (Order matters to satisfy foreign keys)
  console.log('Clearing database...');
  await prisma.escrowWalletTransaction.deleteMany({});
  await prisma.fileStorageRecord.deleteMany({});
  await prisma.vendorQuote.deleteMany({});
  await prisma.procurementRequest.deleteMany({});
  await prisma.bidInvitation.deleteMany({});
  await prisma.bid.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.dailyReport.deleteMany({});
  await prisma.paymentRequest.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.contractor.deleteMany({});
  await prisma.manager.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.emailVerificationToken.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Database cleared.');

  // 2. Create Admin User
  const adminEmail = 'info.openeyeafrica.com';
  const adminPassword = 'admin-secure-password-' + crypto.randomBytes(4).toString('hex');
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const user = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: adminEmail,
      role: 'admin',
      passwordHash: passwordHash,
      isVerified: true,
      admin: {
        create: {}
      }
    },
    include: {
      admin: true
    }
  });

  console.log('\n-----------------------------------');
  console.log('ADMIN CREATED SUCCESSFULLY');
  console.log('-----------------------------------');
  console.log(`Email:    ${user.email}`);
  console.log(`Password: ${adminPassword}`);
  console.log('-----------------------------------');
  console.log('Please save these credentials securely.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
