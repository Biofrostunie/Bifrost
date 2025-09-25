import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Expenses Load Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.setGlobalPrefix('api');
    
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  beforeEach(async () => {
    // Clean database
    await prisma.expense.deleteMany();
    await prisma.user.deleteMany();

    // Create and authenticate user
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'loadtest@example.com',
        password: 'password123',
        fullName: 'Load Test User',
      });

    userId = registerResponse.body.data.id;

    // Verify email
    await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'loadtest@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.data.access_token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Expense Creation Load Test', () => {
    it('should handle 200 concurrent expense creations', async () => {
      const concurrentRequests = 200;
      const promises: Promise<any>[] = [];

      const categories = ['Food', 'Transport', 'Entertainment', 'Health', 'Education'];
      const startTime = Date.now();

      for (let i = 0; i < concurrentRequests; i++) {
        const promise = request(app.getHttpServer())
          .post('/api/expenses')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            description: `Load test expense ${i}`,
            amount: Math.random() * 1000 + 10,
            category: categories[i % categories.length],
            date: new Date().toISOString().split('T')[0],
            essential: i % 2 === 0,
          });
        
        promises.push(promise);
      }

      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Count successful creations
      const successful = results.filter(
        (result) => result.status === 'fulfilled' && result.value.status === 201
      ).length;

      console.log(`Expense Creation Load Test Results:`);
      console.log(`- Total requests: ${concurrentRequests}`);
      console.log(`- Successful: ${successful}`);
      console.log(`- Failed: ${concurrentRequests - successful}`);
      console.log(`- Duration: ${duration}ms`);
      console.log(`- Average response time: ${duration / concurrentRequests}ms`);

      // At least 95% should be successful
      expect(successful).toBeGreaterThanOrEqual(concurrentRequests * 0.95);
      
      // Should complete within reasonable time (15 seconds)
      expect(duration).toBeLessThan(15000);

      // Verify expenses were actually created
      const expenseCount = await prisma.expense.count({
        where: { userId },
      });
      expect(expenseCount).toBe(successful);
    }, 60000);
  });

  describe('Expense Retrieval Load Test', () => {
    beforeEach(async () => {
      // Create test expenses
      const expenses = [];
      for (let i = 0; i < 100; i++) {
        expenses.push({
          userId,
          description: `Test expense ${i}`,
          amount: Math.random() * 1000 + 10,
          category: 'Food',
          date: new Date(),
          essential: i % 2 === 0,
        });
      }

      await prisma.expense.createMany({
        data: expenses,
      });
    });

    it('should handle 100 concurrent expense retrievals', async () => {
      const concurrentRequests = 100;
      const promises: Promise<any>[] = [];

      const startTime = Date.now();

      for (let i = 0; i < concurrentRequests; i++) {
        const promise = request(app.getHttpServer())
          .get('/api/expenses')
          .set('Authorization', `Bearer ${authToken}`);
        
        promises.push(promise);
      }

      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Count successful retrievals
      const successful = results.filter(
        (result) => result.status === 'fulfilled' && result.value.status === 200
      ).length;

      console.log(`Expense Retrieval Load Test Results:`);
      console.log(`- Total requests: ${concurrentRequests}`);
      console.log(`- Successful: ${successful}`);
      console.log(`- Failed: ${concurrentRequests - successful}`);
      console.log(`- Duration: ${duration}ms`);
      console.log(`- Average response time: ${duration / concurrentRequests}ms`);

      // All should be successful
      expect(successful).toBe(concurrentRequests);
      
      // Should complete within reasonable time (5 seconds)
      expect(duration).toBeLessThan(5000);
    }, 60000);
  });

  describe('Mixed Expense Operations Load Test', () => {
    it('should handle mixed CRUD operations under load', async () => {
      const totalRequests = 150;
      const promises: Promise<any>[] = [];

      const startTime = Date.now();

      for (let i = 0; i < totalRequests; i++) {
        let promise;
        
        if (i % 4 === 0) {
          // Create expense
          promise = request(app.getHttpServer())
            .post('/api/expenses')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              description: `Mixed test expense ${i}`,
              amount: Math.random() * 1000 + 10,
              category: 'Food',
              date: new Date().toISOString().split('T')[0],
              essential: false,
            });
        } else if (i % 4 === 1) {
          // Get expenses
          promise = request(app.getHttpServer())
            .get('/api/expenses')
            .set('Authorization', `Bearer ${authToken}`);
        } else if (i % 4 === 2) {
          // Get expenses with filter
          promise = request(app.getHttpServer())
            .get('/api/expenses?category=Food')
            .set('Authorization', `Bearer ${authToken}`);
        } else {
          // Get expenses with date filter
          promise = request(app.getHttpServer())
            .get(`/api/expenses?startDate=${new Date().toISOString().split('T')[0]}`)
            .set('Authorization', `Bearer ${authToken}`);
        }
        
        promises.push(promise);
      }

      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Count successful operations
      const successful = results.filter(
        (result) => result.status === 'fulfilled' && 
        (result.value.status === 200 || result.value.status === 201)
      ).length;

      console.log(`Mixed Expense Operations Load Test Results:`);
      console.log(`- Total requests: ${totalRequests}`);
      console.log(`- Successful: ${successful}`);
      console.log(`- Failed: ${totalRequests - successful}`);
      console.log(`- Duration: ${duration}ms`);
      console.log(`- Average response time: ${duration / totalRequests}ms`);

      // At least 90% should be successful
      expect(successful).toBeGreaterThanOrEqual(totalRequests * 0.9);
      
      // Should complete within reasonable time (10 seconds)
      expect(duration).toBeLessThan(10000);
    }, 60000);
  });
});