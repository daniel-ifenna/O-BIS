const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const oldEmail = 'info.openeyeafrica.com';
  const newEmail = 'info.openeyeafrica@gmail.com';
  const password = 'AdminPassword123!';
  const hashedPassword = await bcrypt.hash(password, 12);

  console.log(`Updating admin email from "${oldEmail}" to "${newEmail}"...`);

  // 1. Check if the new email already exists to avoid unique constraint errors
  const existingNew = await prisma.user.findUnique({ where: { email: newEmail } });
  
  if (existingNew) {
    console.log(`User with new email ${newEmail} already exists.`);
    // Just ensure it has admin role and correct password
    await prisma.user.update({
      where: { email: newEmail },
      data: {
        role: 'admin',
        passwordHash: hashedPassword,
        admin: {
          upsert: {
            create: {},
            update: {}
          }
        }
      }
    });
    console.log('Updated existing user to be Admin with correct password.');
    
    // Optionally delete the old one if it exists and is different
    const oldUser = await prisma.user.findUnique({ where: { email: oldEmail } });
    if (oldUser) {
      console.log('Deleting old incorrect user...');
      await prisma.user.delete({ where: { email: oldEmail } });
    }

  } else {
    // 2. Check if the old email user exists to update it
    const oldUser = await prisma.user.findUnique({ where: { email: oldEmail } });
    
    if (oldUser) {
      console.log('Found user with old email. Updating...');
      await prisma.user.update({
        where: { email: oldEmail },
        data: {
          email: newEmail,
          passwordHash: hashedPassword // Update password just in case
        }
      });
      console.log('Email updated successfully.');
    } else {
      console.log('Old user not found either. Creating new Admin user...');
      await prisma.user.create({
        data: {
          name: 'Super Admin',
          email: newEmail,
          role: 'admin',
          passwordHash: hashedPassword,
          isVerified: true,
          admin: {
            create: {}
          }
        }
      });
      console.log('New Admin user created.');
    }
  }

  console.log('\n-----------------------------------');
  console.log('ADMIN CREDENTIALS UPDATED');
  console.log('-----------------------------------');
  console.log(`Email:    ${newEmail}`);
  console.log(`Password: ${password}`);
  console.log('-----------------------------------');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
