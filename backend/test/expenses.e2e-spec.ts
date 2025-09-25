import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Expenses (e2e)', () => {
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

  describe('/api/expenses (POST)', () => {
    it('should create a new expense', () => {
      return request(app.getHttpServer())
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Lunch',
          amount: 25.50,
          category: 'Food',
          date: '2024-01-15',
          essential: false,
          notes: 'Restaurant lunch',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.description).toBe('Lunch');
          expect(parseFloat(res.body.data.amount)).toBe(25.50);
          expect(res.body.data.category).toBe('Food');
          expect(res.body.data.essential).toBe(false);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/expenses')
        .send({
          description: 'Lunch',
          amount: 25.50,
          category: 'Food',
          date: '2024-01-15',
        })
        .expect(401);
    });

    it('should fail with invalid amount', () => {
      return request(app.getHttpServer())
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Lunch',
          amount: -10,
          category: 'Food',
          date: '2024-01-15',
        })
        .expect(400);
    });
  });

  describe('/api/expenses (GET)', () => {
    beforeEach(async () => {
      // Create test expenses
      await request(app.getHttpServer())
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Lunch',
          amount: 25.50,
          category: 'Food',
          date: '2024-01-15',
          essential: false,
        });

      await request(app.getHttpServer())
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Rent',
          amount: 1200.00,
          category: 'Housing',
          date: '2024-01-01',
          essential: true,
        });
    });

    it('should get all user expenses', () => {
      return request(app.getHttpServer())
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveLength(2);
        });
    });

    it('should filter expenses by category', () => {
      return request(app.getHttpServer())
        .get('/api/expenses?category=Food')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].category).toBe('Food');
        });
    });

    it('should filter expenses by essential flag', () => {
      return request(app.getHttpServer())
        .get('/api/expenses?essential=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].essential).toBe(true);
        });
    });
  });
});