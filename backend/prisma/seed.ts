import { PrismaClient } from '@prisma/client';
import { seedFinancialConcepts } from './financial-concepts-seed';
import { seedUsers } from './population-seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Seeds to Execute
  await seedFinancialConcepts();
  await seedUsers();
  
  console.log('All seeding operations completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });