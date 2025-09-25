import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Users (e2e)', () => {
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
    await prisma.userProfile.deleteMany();
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

    // Verify email
    await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    });

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

  describe('/api/users/profile (GET)', () => {
    it('should get user profile', () => {
      return request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.email).toBe('test@example.com');
          expect(res.body.data.fullName).toBe('Test User');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/api/users/profile')
        .expect(401);
    });
  });

  describe('/api/users/profile (PUT)', () => {
    it('should update user profile', () => {
      return request(app.getHttpServer())
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          monthlyIncome: 5000,
          financialGoals: ['retirement', 'house'],
          riskTolerance: 'moderate',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.monthlyIncome).toBeDefined();
          expect(res.body.data.financialGoals).toEqual(['retirement', 'house']);
          expect(res.body.data.riskTolerance).toBe('moderate');
        });
    });
  });

  describe('/api/users (PUT)', () => {
    it('should update user general data', () => {
      return request(app.getHttpServer())
        .put('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: 'Updated Name',
          phone: '+5511999999999',
          address: 'New Address, 123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.fullName).toBe('Updated Name');
          expect(res.body.data.phone).toBe('+5511999999999');
          expect(res.body.data.address).toBe('New Address, 123');
        });
    });
  });

  describe('/api/users/name (PUT)', () => {
    it('should update user name', () => {
      return request(app.getHttpServer())
        .put('/api/users/name')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: 'New Name',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.fullName).toBe('New Name');
        });
    });
  });

  describe('/api/users/email (PUT)', () => {
    it('should update user email', () => {
      return request(app.getHttpServer())
        .put('/api/users/email')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'newemail@example.com',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.email).toBe('newemail@example.com');
          expect(res.body.data.isEmailVerified).toBe(false);
        });
    });
  });

  describe('/api/users/phone (PUT)', () => {
    it('should update user phone', () => {
      return request(app.getHttpServer())
        .put('/api/users/phone')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phone: '+5511888888888',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.phone).toBe('+5511888888888');
        });
    });
  });

  describe('/api/users/address (PUT)', () => {
    it('should update user address', () => {
      return request(app.getHttpServer())
        .put('/api/users/address')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          address: 'Updated Address, 456',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.address).toBe('Updated Address, 456');
        });
    });
  });

  describe('/api/users (DELETE)', () => {
    it('should delete user account', () => {
      return request(app.getHttpServer())
        .delete('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.message).toBe('User deleted successfully');
        });
    });
  });
});