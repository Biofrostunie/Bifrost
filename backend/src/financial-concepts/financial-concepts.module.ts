import { Module } from '@nestjs/common';
import { FinancialConceptsController } from './controllers/financial-concepts.controller';
import { FinancialConceptsService } from './services/financial-concepts.service';
import { FinancialConceptsRepository } from './repositories/financial-concepts.repository';
import { FinancialConceptsTrpcRouter } from './trpc/financial-concepts.router';

@Module({
  controllers: [FinancialConceptsController],
  providers: [FinancialConceptsService, FinancialConceptsRepository, FinancialConceptsTrpcRouter],
  exports: [FinancialConceptsService, FinancialConceptsRepository, FinancialConceptsTrpcRouter],
})
export class FinancialConceptsModule {}