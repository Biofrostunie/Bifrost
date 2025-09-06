const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyUserEmail() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'matheus.cavalcante@santacasa.org' }
    });
    
    if (user) {
      await prisma.user.update({
        where: { email: 'matheus.cavalcante@santacasa.org' },
        data: { isEmailVerified: true }
      });
      console.log('Email verified successfully for user:', user.email);
      console.log('User ID:', user.id);
    } else {
      console.log('User not found with email: matheus.cavalcante@santacasa.org');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUserEmail();