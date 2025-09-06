const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verifyUserEmail() {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'matheus.cavalcante@santacacasa.org' }
    });
    
    if (existingUser) {
      console.log('User found:', existingUser.email);
      console.log('Current email verification status:', existingUser.isEmailVerified);
      
      // Update email verification status
      const updatedUser = await prisma.user.update({
        where: { email: 'matheus.cavalcante@santacacasa.org' },
        data: { isEmailVerified: true }
      });
      
      console.log('Email verified successfully for user:', updatedUser.email);
      console.log('New verification status:', updatedUser.isEmailVerified);
      return updatedUser;
    } else {
      console.log('User not found with email: matheus.cavalcante@santacacasa.org');
      
      // Create new user with verified email
      const hashedPassword = await bcrypt.hash('Vitoria0612', 10);
      const user = await prisma.user.create({
        data: {
          email: 'matheus.cavalcante@santacacasa.org',
          password: hashedPassword,
          isEmailVerified: true,
          profile: {
            create: {
              name: 'Matheus Cavalcante',
              phone: '+55 11 99999-9999',
              riskTolerance: 'moderate'
            }
          }
        },
        include: {
          profile: true
        }
      });
      
      console.log('User created successfully with verified email:', {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        profile: user.profile
      });
      
      return user;
    }
  } catch (error) {
    console.error('Error verifying user email:', error.message);
    throw error;
  }
}

verifyUserEmail()
  .catch(console.error)
  .finally(() => prisma.$disconnect());