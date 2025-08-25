import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Investment Simulations (e2e)', () => {
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
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      });

    userId = registerResponse.body.data.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.data.access_token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/api/investment-simulations/calculate (POST)', () => {
    it('should calculate investment projection', () => {
      return request(app.getHttpServer())
        .post('/api/investment-simulations/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          initialAmount: 10000,
          monthlyContribution: 500,
          annualReturnRate: 8,
          timePeriodMonths: 120, // 10 years
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.futureValue).toBeGreaterThan(10000);
          expect(res.body.data.totalContributions).toBe(70000); // 10000 + (500 * 120)
          expect(res.body.data.totalReturns).toBeGreaterThan(0);
          expect(res.body.data.roi).toBeGreaterThan(0);
        });
    });

    it('should calculate with only initial amount', () => {
      return request(app.getHttpServer())
        .post('/api/investment-simulations/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          initialAmount: 5000,
          annualReturnRate: 6,
          timePeriodMonths: 60, // 5 years
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.futureValue).toBeGreaterThan(5000);
          expect(res.body.data.totalContributions).toBe(5000);
        });
    });
  });

  describe('/api/investment-simulations (POST)', () => {
    it('should create a new simulation', () => {
      return request(app.getHttpServer())
        .post('/api/investment-simulations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          simulationName: 'Retirement Fund',
          initialAmount: 10000,
          monthlyContribution: 500,
          annualReturnRate: 8,
          timePeriodMonths: 360, // 30 years
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.simulationName).toBe('Retirement Fund');
          expect(parseFloat(res.body.data.initialAmount)).toBe(10000);
          expect(parseFloat(res.body.data.monthlyContribution)).toBe(500);
          expect(parseFloat(res.body.data.annualReturnRate)).toBe(8);
          expect(res.body.data.timePeriodMonths).toBe(360);
        });
    });

    it('should fail with invalid return rate', () => {
      return request(app.getHttpServer())
        .post('/api/investment-simulations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          initialAmount: 10000,
          annualReturnRate: 150, // Invalid: > 100%
          timePeriodMonths: 120,
        })
        .expect(400);
    });
  });

  describe('/api/investment-simulations (GET)', () => {
    beforeEach(async () => {
      // Create test simulations
      await request(app.getHttpServer())
        .post('/api/investment-simulations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          simulationName: 'Emergency Fund',
          initialAmount: 1000,
          monthlyContribution: 200,
          annualReturnRate: 4,
          timePeriodMonths: 24,
        });

      await request(app.getHttpServer())
        .post('/api/investment-simulations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          simulationName: 'House Down Payment',
          initialAmount: 5000,
          monthlyContribution: 800,
          annualReturnRate: 6,
          timePeriodMonths: 60,
        });
    });

    it('should get all user simulations', () => {
      return request(app.getHttpServer())
        .get('/api/investment-simulations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveLength(2);
        });
    });
  });
});