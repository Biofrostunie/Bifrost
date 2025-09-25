import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Authentication Extended (e2e)', () => {
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

  describe('/api/auth/verify-email (POST)', () => {
    it('should verify email with valid token', async () => {
      // First register a user
      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'verify@example.com',
          password: 'password123',
          fullName: 'Verify User',
        });

      expect(registerResponse.status).toBe(201);

      // Get the verification token from database
      const user = await prisma.user.findUnique({
        where: { email: 'verify@example.com' },
      });

      expect(user).toBeDefined();
      expect(user?.emailVerificationToken).toBeDefined();

      if (!user?.emailVerificationToken) {
        throw new Error('Email verification token not found');
      }

      // Verify email
      return request(app.getHttpServer())
        .post('/api/auth/verify-email')
        .send({
          token: user.emailVerificationToken,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.message).toBe('Email verified successfully');
          expect(res.body.data.user.isEmailVerified).toBe(true);
        });
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/verify-email')
        .send({
          token: 'invalid-token',
        })
        .expect(401);
    });
  });

  describe('/api/auth/forgot-password (POST)', () => {
    beforeEach(async () => {
      // Create a verified user
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'forgot@example.com',
          password: 'password123',
          fullName: 'Forgot User',
        });

      await prisma.user.update({
        where: { email: 'forgot@example.com' },
        data: { isEmailVerified: true },
      });
    });

    it('should send password reset code', () => {
      return request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({
          email: 'forgot@example.com',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.message).toBe('Password reset code sent to your email');
        });
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(401);
    });
  });

  describe('/api/auth/reset-password (POST)', () => {
    beforeEach(async () => {
      // Create a user and request password reset
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'reset@example.com',
          password: 'password123',
          fullName: 'Reset User',
        });

      await prisma.user.update({
        where: { email: 'reset@example.com' },
        data: { isEmailVerified: true },
      });

      await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({
          email: 'reset@example.com',
        });
    });

    it('should reset password with valid token', async () => {
      // Get the reset token from database
      const user = await prisma.user.findUnique({
        where: { email: 'reset@example.com' },
      });

      expect(user?.passwordResetToken).toBeDefined();

      if (!user?.passwordResetToken) {
        throw new Error('Password reset token not found');
      }

      return request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({
          token: user.passwordResetToken,
          newPassword: 'newpassword123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.message).toBe('Password reset successfully');
        });
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'newpassword123',
        })
        .expect(401);
    });

    it('should fail with expired token', async () => {
      // Set token as expired
      await prisma.user.update({
        where: { email: 'reset@example.com' },
        data: {
          passwordResetToken: '12345',
          passwordResetExpires: new Date(Date.now() - 3600000), // 1 hour ago
        },
      });

      return request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({
          token: '12345',
          newPassword: 'newpassword123',
        })
        .expect(401);
    });
  });

  describe('Complete Auth Flow', () => {
    it('should complete full registration, verification, and login flow', async () => {
      // 1. Register
      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'complete@example.com',
          password: 'password123',
          fullName: 'Complete User',
        });

      expect(registerResponse.status).toBe(201);

      // 2. Get verification token
      const user = await prisma.user.findUnique({
        where: { email: 'complete@example.com' },
      });

      if (!user?.emailVerificationToken) {
        throw new Error('Email verification token not found');
      }

      // 3. Verify email
      const verifyResponse = await request(app.getHttpServer())
        .post('/api/auth/verify-email')
        .send({
          token: user.emailVerificationToken,
        });

      expect(verifyResponse.status).toBe(200);

      // 4. Login
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'complete@example.com',
          password: 'password123',
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.data.access_token).toBeDefined();
    });
  });
});