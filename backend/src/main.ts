import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TrpcService } from './trpc/trpc.service';
import { TrpcRouter } from './trpc/trpc.router';
import { RedisService } from './redis/redis.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: true, // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Processing-Time',
      'Content-Disposition',
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: configService.get('NODE_ENV') === 'production',
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Setup tRPC
  const trpcService = app.get(TrpcService);
  const trpcRouter = app.get(TrpcRouter);
  trpcService.applyMiddleware(trpcRouter.appRouter, app);

  // Global prefix
  app.setGlobalPrefix('api');

  // Resolve backend base URL from env (no trailing slash)
  const port = configService.get('PORT') || 3000;
  const rawBackendUrl = configService.get<string>('BACKEND_URL');
  const backendBaseUrl = (rawBackendUrl?.replace(/\/+$/,'')) || `http://localhost:${port}`;

  // Health check endpoint with Redis status
  app.getHttpAdapter().get('/api/health', async (req: Request, res: Response) => {
    const redisService = app.get(RedisService);
    const redisHealthy = await redisService.isHealthy();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Bifröst Education Platform API is running',
      version: '1.0.0',
      nodeVersion: require('process').version,
      environment: configService.get('NODE_ENV'),
      services: {
        database: 'connected',
        redis: redisHealthy ? 'connected' : 'disconnected',
        email: 'configured',
        pdf: 'available',
      },
    });
  });

  // Root health check
  app.getHttpAdapter().get('/health', async (req: Request, res: Response) => {
    const redisService = app.get(RedisService);
    const redisHealthy = await redisService.isHealthy();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Bifröst Education Platform API is running',
      version: '1.0.0',
      services: {
        redis: redisHealthy ? 'connected' : 'disconnected',
      },
    });
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Bifröst Education Platform API')
    .setDescription('A comprehensive financial education and tracking platform built with NestJS, Prisma, PostgreSQL, and Redis')
    .setVersion('1.0.0')
    .setContact(
      'Bifröst Team',
      'https://github.com/Biofrostunie/Bifrost',
      'noreplybifrost@gmail.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer(backendBaseUrl, 'Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Users', 'User profile management')
    .addTag('Expenses', 'Expense tracking and management')
    .addTag('Incomes', 'Income tracking and management')
    .addTag('Investment Simulations', 'Investment calculation and simulation')
    .addTag('Financial Concepts', 'Educational financial content')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
    },
    customSiteTitle: 'Bifröst API Documentation',
  });

  await app.listen(port);

  logger.log(`🚀 Application is running on: ${backendBaseUrl}`);
  logger.log(`📚 API Documentation: ${backendBaseUrl}/api`);
  logger.log(`🔧 tRPC Endpoint: ${backendBaseUrl}/trpc`);
  logger.log(`📊 Database: PostgreSQL with Prisma ORM`);
  logger.log(`🔴 Cache: Redis for caching and sessions`);
  logger.log(`🔐 Authentication: JWT with Passport.js`);
  logger.log(`📧 Email Service: SMTP configured`);
  logger.log(`📄 PDF Generation: Puppeteer enabled`);
  logger.log(`🏷️  API Version: v1`);
  logger.log(`🌍 Environment: ${configService.get('NODE_ENV')}`);
}

bootstrap().catch((error) => {
  console.error('❌ Error starting application:', error);
  process.exit(1);
});
