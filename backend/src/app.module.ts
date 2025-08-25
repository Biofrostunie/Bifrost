import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

// Core modules
import { PrismaModule } from './prisma/prisma.module';
import { TrpcModule } from './trpc/trpc.module';

// Feature modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExpensesModule } from './expenses/expenses.module';
import { IncomesModule } from './incomes/incomes.module';
import { InvestmentSimulationsModule } from './investment-simulations/investment-simulations.module';
import { FinancialConceptsModule } from './financial-concepts/financial-concepts.module';

@Module({
  imports: [
    // Configuration with validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      expandVariables: true,
      validate: (config) => {
        const requiredVars = [
          'DATABASE_URL',
          'JWT_SECRET',
          'SMTP_HOST',
          'SMTP_USER',
          'SMTP_PASS',
          'EMAIL_FROM',
        ];
        
        for (const varName of requiredVars) {
          if (!config[varName]) {
            throw new Error(`Missing required environment variable: ${varName}`);
          }
        }
        
        return config;
      },
    }),

    // Rate limiting with enhanced configuration
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 1000, // 1000 requests per hour
      },
    ]),

    // Core modules
    PrismaModule,
    TrpcModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ExpensesModule,
    IncomesModule,
    InvestmentSimulationsModule,
    FinancialConceptsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}