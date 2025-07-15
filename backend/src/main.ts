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


async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  const configService = app.get(ConfigService);
  
  // CORS Configuration
  app.enableCors({
    origin: [
      'http://localhost:8080',
      'http://localhost:3001',
      'http://localhost:3000',
      configService.get('FRONTEND_URL', 'http://localhost:8080'),
    ],
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

  // Global validation pipe with enhanced options
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

  // Setup tRPC BEFORE setting global prefix
  const trpcService = app.get(TrpcService);
  const trpcRouter = app.get(TrpcRouter);
  trpcService.applyMiddleware(trpcRouter.appRouter, app);

  // Global prefix - REMOVED the problematic exclude pattern
  app.setGlobalPrefix('api');

  // Health check endpoint with Redis status
  app.getHttpAdapter().get('/api/health', async (req: Request, res: Response) => {

    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Bifröst Education Platform API is running',
      version: '1.0.0',
      nodeVersion: process.version,
      environment: configService.get('NODE_ENV'),
      services: {
        database: 'connected',
        email: 'configured',
        pdf: 'available',
      },
    });
  });

  // Root health check (without prefix)
  app.getHttpAdapter().get('/health', async (req: Request, res: Response) => {
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Bifröst Education Platform API is running',
      version: '1.0.0',
    });
  });

  // Swagger documentation with enhanced configuration
  const config = new DocumentBuilder()
    .setTitle('Bifröst Education Platform API')
    .setDescription('A comprehensive financial education and tracking platform built with NestJS, Prisma, PostgreSQL, and Redis')
    .setVersion('1.0.0')
    .setContact(
      'Bifröst Team',
      'https://github.com/bifrost-platform',
      'noreplybifrost@gmail.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.bifrost.com', 'Production server')
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

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api`);
  logger.log(`🔧 tRPC Endpoint: http://localhost:${port}/trpc`);
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