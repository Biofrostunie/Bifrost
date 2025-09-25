const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyUserEmail() {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        email: 'matheus.cavalcante@santacacasa.org'
      },
      data: {
        isEmailVerified: true
      }
    });
    console.log('User email verified successfully:', updatedUser.email);
    console.log('User ID:', updatedUser.id);
    console.log('Email verified status:', updatedUser.isEmailVerified);
  } catch (error) {
    console.error('Error verifying user email:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUserEmail();