import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Auth Load Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
    // Clean database before each test
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Registration Load Test', () => {
    it('should handle 100 concurrent registrations', async () => {
      const concurrentRequests = 100;
      const promises: Promise<any>[] = [];

      const startTime = Date.now();

      for (let i = 0; i < concurrentRequests; i++) {
        const promise = request(app.getHttpServer())
          .post('/api/auth/register')
          .send({
            email: `test${i}@example.com`,
            password: 'password123',
            fullName: `Test User ${i}`,
          });
        
        promises.push(promise);
      }

      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Count successful registrations
      const successful = results.filter(
        (result) => result.status === 'fulfilled' && result.value.status === 201
      ).length;

      console.log(`Registration Load Test Results:`);
      console.log(`- Total requests: ${concurrentRequests}`);
      console.log(`- Successful: ${successful}`);
      console.log(`- Failed: ${concurrentRequests - successful}`);
      console.log(`- Duration: ${duration}ms`);
      console.log(`- Average response time: ${duration / concurrentRequests}ms`);

      // At least 80% should be successful
      expect(successful).toBeGreaterThanOrEqual(concurrentRequests * 0.8);
      
      // Should complete within reasonable time (10 seconds)
      expect(duration).toBeLessThan(10000);
    }, 60000);
  });

  describe('Login Load Test', () => {
    beforeEach(async () => {
      // Create test users for login
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/api/auth/register')
            .send({
              email: `logintest${i}@example.com`,
              password: 'password123',
              fullName: `Login Test User ${i}`,
            })
        );
      }
      await Promise.all(promises);

      // Verify all users
      const users = await prisma.user.findMany({
        where: {
          email: {
            startsWith: 'logintest',
          },
        },
      });

      await prisma.user.updateMany({
        where: {
          email: {
            startsWith: 'logintest',
          },
        },
        data: {
          isEmailVerified: true,
        },
      });
    });

    it('should handle 50 concurrent logins', async () => {
      const concurrentRequests = 50;
      const promises: Promise<any>[] = [];

      const startTime = Date.now();

      for (let i = 0; i < concurrentRequests; i++) {
        const promise = request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: `logintest${i}@example.com`,
            password: 'password123',
          });
        
        promises.push(promise);
      }

      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Count successful logins
      const successful = results.filter(
        (result) => result.status === 'fulfilled' && result.value.status === 200
      ).length;

      console.log(`Login Load Test Results:`);
      console.log(`- Total requests: ${concurrentRequests}`);
      console.log(`- Successful: ${successful}`);
      console.log(`- Failed: ${concurrentRequests - successful}`);
      console.log(`- Duration: ${duration}ms`);
      console.log(`- Average response time: ${duration / concurrentRequests}ms`);

      // At least 90% should be successful
      expect(successful).toBeGreaterThanOrEqual(concurrentRequests * 0.9);
      
      // Should complete within reasonable time (5 seconds)
      expect(duration).toBeLessThan(5000);
    }, 60000);
  });

  describe('Mixed Auth Operations Load Test', () => {
    it('should handle mixed auth operations under load', async () => {
      const totalRequests = 100;
      const promises: Promise<any>[] = [];

      const startTime = Date.now();

      for (let i = 0; i < totalRequests; i++) {
        let promise;
        
        if (i % 3 === 0) {
          // Registration
          promise = request(app.getHttpServer())
            .post('/api/auth/register')
            .send({
              email: `mixed${i}@example.com`,
              password: 'password123',
              fullName: `Mixed Test User ${i}`,
            });
        } else if (i % 3 === 1) {
          // Forgot password
          promise = request(app.getHttpServer())
            .post('/api/auth/forgot-password')
            .send({
              email: `nonexistent${i}@example.com`,
            });
        } else {
          // Login attempt (will fail but tests the endpoint)
          promise = request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
              email: `nonexistent${i}@example.com`,
              password: 'wrongpassword',
            });
        }
        
        promises.push(promise);
      }

      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Count results by type
      const registrations = results.slice(0, Math.ceil(totalRequests / 3));
      const forgotPasswords = results.slice(Math.ceil(totalRequests / 3), Math.ceil(2 * totalRequests / 3));
      const logins = results.slice(Math.ceil(2 * totalRequests / 3));

      const successfulRegistrations = registrations.filter(
        (result) => result.status === 'fulfilled' && result.value.status === 201
      ).length;

      console.log(`Mixed Auth Load Test Results:`);
      console.log(`- Total requests: ${totalRequests}`);
      console.log(`- Successful registrations: ${successfulRegistrations}/${registrations.length}`);
      console.log(`- Duration: ${duration}ms`);
      console.log(`- Average response time: ${duration / totalRequests}ms`);

      // Should complete within reasonable time
      expect(duration).toBeLessThan(15000);
      
      // At least 70% of registrations should be successful
      expect(successfulRegistrations).toBeGreaterThanOrEqual(registrations.length * 0.7);
    }, 60000);
  });
});