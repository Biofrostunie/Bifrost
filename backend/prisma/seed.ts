import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Seed financial concepts
  const financialConcepts = [
    {
      id: uuidv4(),
      title: 'Compound Interest',
      description: 'Compound interest is the addition of interest to the principal sum of a loan or deposit, or in other words, interest on interest.',
      category: 'investing',
      difficultyLevel: 'beginner',
      tags: ['interest', 'investing', 'basics'],
    },
    {
      id: uuidv4(),
      title: 'Emergency Fund',
      description: 'An emergency fund is a financial safety net for future mishaps and/or unexpected expenses.',
      category: 'saving',
      difficultyLevel: 'beginner',
      tags: ['saving', 'emergency', 'basics'],
    },
    {
      id: uuidv4(),
      title: 'Stock Market Basics',
      description: 'The stock market is where buyers and sellers come together to trade shares in eligible companies.',
      category: 'investing',
      difficultyLevel: 'intermediate',
      tags: ['stocks', 'investing', 'market'],
    },
    {
      id: uuidv4(),
      title: 'Budgeting 101',
      description: 'Budgeting is the process of creating a plan to spend your money.',
      category: 'budgeting',
      difficultyLevel: 'beginner',
      tags: ['budget', 'planning', 'basics'],
    },
    {
      id: uuidv4(),
      title: 'Retirement Planning',
      description: 'Retirement planning is the process of determining retirement income goals and the actions necessary to achieve those goals.',
      category: 'planning',
      difficultyLevel: 'advanced',
      tags: ['retirement', 'planning', 'future'],
    },
  ];

  console.log('Seeding financial concepts...');
  for (const concept of financialConcepts) {
    await prisma.financialConcept.upsert({
      where: { id: concept.id },
      update: {},
      create: concept,
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });