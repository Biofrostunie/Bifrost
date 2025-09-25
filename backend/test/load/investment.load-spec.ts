import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Investment Simulations Load Tests', () => {
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
    await prisma.investmentSimulation.deleteMany();
    await prisma.user.deleteMany();

    // Create and authenticate user
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'investmenttest@example.com',
        password: 'password123',
        fullName: 'Investment Test User',
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
        email: 'investmenttest@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.data.access_token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Investment Calculation Load Test', () => {
    it('should handle 500 concurrent investment calculations', async () => {
      const concurrentRequests = 500;
      const promises: Promise<any>[] = [];

      const startTime = Date.now();

      for (let i = 0; i < concurrentRequests; i++) {
        const promise = request(app.getHttpServer())
          .post('/api/investment-simulations/calculate')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            initialAmount: Math.random() * 50000 + 1000,
            monthlyContribution: Math.random() * 2000 + 100,
            annualReturnRate: Math.random() * 15 + 3,
            timePeriodMonths: Math.floor(Math.random() * 360) + 12,
          });
        
        promises.push(promise);
      }

      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Count successful calculations
      const successful = results.filter(
        (result) => result.status === 'fulfilled' && result.value.status === 200
      ).length;

      console.log(`Investment Calculation Load Test Results:`);
      console.log(`- Total requests: ${concurrentRequests}`);
      console.log(`- Successful: ${successful}`);
      console.log(`- Failed: ${concurrentRequests - successful}`);
      console.log(`- Duration: ${duration}ms`);
      console.log(`- Average response time: ${duration / concurrentRequests}ms`);

      // All should be successful (calculations are CPU-bound, not I/O)
      expect(successful).toBe(concurrentRequests);
      
      // Should complete within reasonable time (10 seconds)
      expect(duration).toBeLessThan(10000);
    }, 60000);
  });

  describe('Simulation Creation Load Test', () => {
    it('should handle 100 concurrent simulation creations', async () => {
      const concurrentRequests = 100;
      const promises: Promise<any>[] = [];

      const simulationNames = [
        'Retirement Fund',
        'Emergency Fund',
        'House Down Payment',
        'Vacation Fund',
        'Education Fund',
      ];

      const startTime = Date.now();

      for (let i = 0; i < concurrentRequests; i++) {
        const promise = request(app.getHttpServer())
          .post('/api/investment-simulations')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            simulationName: `${simulationNames[i % simulationNames.length]} ${i}`,
            initialAmount: Math.random() * 50000 + 1000,
            monthlyContribution: Math.random() * 2000 + 100,
            annualReturnRate: Math.random() * 15 + 3,
            timePeriodMonths: Math.floor(Math.random() * 360) + 12,
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

      console.log(`Simulation Creation Load Test Results:`);
      console.log(`- Total requests: ${concurrentRequests}`);
      console.log(`- Successful: ${successful}`);
      console.log(`- Failed: ${concurrentRequests - successful}`);
      console.log(`- Duration: ${duration}ms`);
      console.log(`- Average response time: ${duration / concurrentRequests}ms`);

      // At least 95% should be successful
      expect(successful).toBeGreaterThanOrEqual(concurrentRequests * 0.95);
      
      // Should complete within reasonable time (8 seconds)
      expect(duration).toBeLessThan(8000);

      // Verify simulations were actually created
      const simulationCount = await prisma.investmentSimulation.count({
        where: { userId },
      });
      expect(simulationCount).toBe(successful);
    }, 60000);
  });

  describe('Complex Investment Operations Load Test', () => {
    beforeEach(async () => {
      // Create some test simulations
      const simulations = [];
      for (let i = 0; i < 20; i++) {
        simulations.push({
          userId,
          simulationName: `Test Simulation ${i}`,
          initialAmount: 10000,
          monthlyContribution: 500,
          annualReturnRate: 8,
          timePeriodMonths: 120,
        });
      }

      await prisma.investmentSimulation.createMany({
        data: simulations,
      });
    });

    it('should handle complex mixed operations under load', async () => {
      const totalRequests = 200;
      const promises: Promise<any>[] = [];

      const startTime = Date.now();

      for (let i = 0; i < totalRequests; i++) {
        let promise;
        
        if (i % 5 === 0) {
          // Calculate investment
          promise = request(app.getHttpServer())
            .post('/api/investment-simulations/calculate')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              initialAmount: Math.random() * 50000 + 1000,
              monthlyContribution: Math.random() * 2000 + 100,
              annualReturnRate: Math.random() * 15 + 3,
              timePeriodMonths: Math.floor(Math.random() * 360) + 12,
            });
        } else if (i % 5 === 1) {
          // Create simulation
          promise = request(app.getHttpServer())
            .post('/api/investment-simulations')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              simulationName: `Load Test Simulation ${i}`,
              initialAmount: 10000,
              monthlyContribution: 500,
              annualReturnRate: 8,
              timePeriodMonths: 120,
            });
        } else if (i % 5 === 2) {
          // Get all simulations
          promise = request(app.getHttpServer())
            .get('/api/investment-simulations')
            .set('Authorization', `Bearer ${authToken}`);
        } else if (i % 5 === 3) {
          // Get simulation with calculation (will use first available)
          const simulations = await prisma.investmentSimulation.findFirst({
            where: { userId },
          });
          
          if (simulations) {
            promise = request(app.getHttpServer())
              .get(`/api/investment-simulations/${simulations.id}/calculate`)
              .set('Authorization', `Bearer ${authToken}`);
          } else {
            // Fallback to get all simulations
            promise = request(app.getHttpServer())
              .get('/api/investment-simulations')
              .set('Authorization', `Bearer ${authToken}`);
          }
        } else {
          // Another calculation request
          promise = request(app.getHttpServer())
            .post('/api/investment-simulations/calculate')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              initialAmount: 5000,
              annualReturnRate: 6,
              timePeriodMonths: 60,
            });
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

      console.log(`Complex Investment Operations Load Test Results:`);
      console.log(`- Total requests: ${totalRequests}`);
      console.log(`- Successful: ${successful}`);
      console.log(`- Failed: ${totalRequests - successful}`);
      console.log(`- Duration: ${duration}ms`);
      console.log(`- Average response time: ${duration / totalRequests}ms`);

      // At least 90% should be successful
      expect(successful).toBeGreaterThanOrEqual(totalRequests * 0.9);
      
      // Should complete within reasonable time (15 seconds)
      expect(duration).toBeLessThan(15000);
    }, 60000);
  });
});