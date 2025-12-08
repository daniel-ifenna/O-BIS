const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'info.openeyeafrica.com';
  // I will ask the user to provide the password they are trying to use, 
  // but for now I will check against the one I just generated if I can recall it or if I can just check if the user exists.
  // Wait, I don't know the password I generated in the previous turn because it had a random component: 'admin-secure-password-' + crypto.randomBytes(4).toString('hex')
  // AND I printed it to the console. The user has it.
  
  // However, I can't verify the *exact* password unless I reset it to a known value now.
  // Given the user says it returns invalid, I should RESET it to a specific known value so they can definitely log in.
  
  const newPassword = 'AdminPassword123!';
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  console.log(`Checking for user: ${email}`);
  const user = await prisma.user.findUnique({
    where: { email },
    include: { admin: true }
  });
  
  if (!user) {
    console.log('User NOT FOUND in database!');
    // Create it again if missing
    const created = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: email,
        role: 'admin',
        passwordHash: hashedPassword,
        isVerified: true,
        admin: { create: {} }
      }
    });
    console.log('User created again.');
  } else {
    console.log('User FOUND.');
    console.log(`Role: ${user.role}`);
    console.log(`Has Admin Profile: ${!!user.admin}`);
    
    // Update password to ensure it is correct
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hashedPassword }
    });
    console.log('Password has been reset to: ' + newPassword);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
