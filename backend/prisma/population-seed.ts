import { DataSource } from "typeorm";
import { v4 as uuid } from "uuid";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";

dotenv.config();

const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
});

async function seed() {
    await AppDataSource.initialize();
    const queryRunner = AppDataSource.createQueryRunner();

    try {
        // Quantidades
        const NUM_USERS = 50;
        const NUM_EXPENSES_PER_USER = 10;
        const NUM_INCOMES_PER_USER = 5;
        const NUM_CONCEPTS = 20;
        const NUM_INTERACTIONS = 5;
        const NUM_SIMULATIONS_PER_USER = 3;

        // =======================
        // USERS
        // =======================
        type User = {
          id: string;
          email: string;
          passwordHash: string;
          fullName: string;
          phone: string;
          address: string;
          isEmailVerified: boolean;
        };

        const users: User[] = [];

        for (let i = 0; i < NUM_USERS; i++) {
            const user = {
                id: uuid(),
                email: faker.internet.email(),
                passwordHash: faker.internet.password(),
                fullName: faker.person.fullName(),
                phone: faker.phone.number(),
                address: faker.location.streetAddress(),
                isEmailVerified: faker.datatype.boolean()
            };
            users.push(user);

            await queryRunner.query(
                `INSERT INTO "users"("id","email","passwordHash","fullName","phone","address","isEmailVerified","createdAt","updatedAt")
                VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())`,
                [user.id, user.email, user.passwordHash, user.fullName, user.phone, user.address, user.isEmailVerified]
            );
        }

        // =======================
        // USER PROFILES
        // =======================
        for (const user of users) {
            const profile = {
                id: uuid(),
                userId: user.id,
                monthlyIncome: parseFloat(faker.finance.amount(1500, 20000, 2)),
                financialGoals: [faker.lorem.word(), faker.lorem.word()],
                risk: faker.helpers.arrayElement(['baixo', 'moderado', 'alto']),
            };

            // PostgreSQL array syntax: '{goal1,goal2}'
            const goalsArray = `{${profile.financialGoals.join(",")}}`;

            await queryRunner.query(
                `INSERT INTO "user_profiles"("id", "userId", "monthlyIncome", "financialGoals", "riskTolerance", "createdAt", "updatedAt")
                 VALUES ($1,$2,$3,$4,$5,NOW(),NOW())`,
                [profile.id, profile.userId, profile.monthlyIncome, goalsArray, profile.risk]
            );
        }

        // =======================
        // EXPENSES
        // =======================
        for (const user of users) {
            for (let i = 0; i < NUM_EXPENSES_PER_USER; i++) {
                const expense = {
                    id: uuid(),
                    userId: user.id,
                    description: faker.commerce.productName(),
                    amount: parseFloat(faker.finance.amount(10, 2000, 2)),
                    category: faker.helpers.arrayElement(['Alimentação','Transporte','Lazer','Saúde','Educação','Moradia']),
                    date: faker.date.recent({ days: 180 }),
                    essential: faker.datatype.boolean(),
                };

                await queryRunner.query(
                    `INSERT INTO "expenses"("id","userId","description","amount","category","date","essential","createdAt")
                    VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
                    [expense.id, expense.userId, expense.description, expense.amount, expense.category, expense.date, expense.essential]
                );
            }
        }

        // =======================
        // INCOMES
        // =======================
        for (const user of users) {
            for (let i = 0; i < NUM_INCOMES_PER_USER; i++) {
                const income = {
                    id: uuid(),
                    userId: user.id,
                    source: faker.company.name(),
                    amount: parseFloat(faker.finance.amount(1000, 20000, 2)),
                    recurrent: faker.datatype.boolean(),
                };

                await queryRunner.query(
                    `INSERT INTO "incomes"("id","userId","source","amount","recurrent","createdAt")
                     VALUES ($1,$2,$3,$4,$5,NOW())`,
                    [income.id, income.userId, income.source, income.amount, income.recurrent]
                );
            }
        }

        // =======================
        // FINANCIAL CONCEPTS
        // =======================
        type Concept = {
            id: string;
            title: string;
            description: string;
            category: string;
            difficulty: string;
            tags: string[];
        };

        const concepts: Concept[] = [];
        
        for (let i = 0; i < NUM_CONCEPTS; i++) {
            const concept = {
                id: uuid(),
                title: faker.lorem.words(2),
                description: faker.lorem.sentence(),
                category: faker.helpers.arrayElement(['Investimentos','Finanças Pessoais','Economia']),
                difficulty: faker.helpers.arrayElement(['básico','intermediário','avançado']),
                tags: [faker.lorem.word(), faker.lorem.word()],
            };
            concepts.push(concept);

            await queryRunner.query(
                `INSERT INTO "financial_concepts"("id","title","description","category","difficultyLevel","tags","createdAt")
                 VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
                [concept.id, concept.title, concept.description, concept.category, concept.difficulty, concept.tags]
            );
        }

        // =======================
        // EDUCATIONAL INTERACTIONS
        // =======================
        const usedInteractions = new Set<string>();

        for (const user of users) {
            for (let i = 0; i < NUM_INTERACTIONS; i++) {
                const concept = faker.helpers.arrayElement(concepts);
                const type = faker.helpers.arrayElement(['view','like','complete']);
                const key = `${user.id}-${concept.id}-${type}`;
                if (usedInteractions.has(key)) continue; // evita duplicados
                usedInteractions.add(key);

                await queryRunner.query(
                    `INSERT INTO "educational_interactions"("id","userId","contentType","contentId","interactionType","createdAt")
                     VALUES ($1,$2,'concept',$3,$4,NOW())`,
                    [uuid(), user.id, concept.id, type]
                );
            }
        }

        // =======================
        // INVESTMENT SIMULATIONS
        // =======================
        for (const user of users) {
            for (let i = 0; i < NUM_SIMULATIONS_PER_USER; i++) {
                await queryRunner.query(
                    `INSERT INTO "investment_simulations"("id","userId","initialAmount","monthlyContribution","annualReturnRate","timePeriodMonths","simulationName","createdAt")
                     VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
                    [
                        uuid(),
                        user.id,
                        parseFloat(faker.finance.amount(1000,50000,2)),
                        parseFloat(faker.finance.amount(100,5000,2)),
                        parseFloat(faker.finance.amount(3,15,2)),
                        faker.datatype.number({min:12,max:240}),
                        faker.lorem.words(3)
                    ]
                );
            }
        }

        console.log('Database seeded successfully with hundreds of records!');
    } catch (err) {
        console.error(err);
    } finally {
        await queryRunner.release();
        await AppDataSource.destroy();
    }
}

seed();
