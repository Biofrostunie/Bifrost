import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('App (e2e)', () => {
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

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Health Check', () => {
    it('should return API documentation', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect(200);
    });
  });

  describe('tRPC Health Check', () => {
    it('should return health status via tRPC', () => {
      return request(app.getHttpServer())
        .get('/trpc/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.result.data.status).toBe('ok');
          expect(res.body.result.data.message).toBe('Financial Education Platform API is running');
        });
    });
  });
});