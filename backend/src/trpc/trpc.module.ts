import { Module } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { TrpcRouter } from './trpc.router';
import { FinancialConceptsModule } from '../financial-concepts/financial-concepts.module';
import { UsersModule } from '../users/users.module';
import { ExpensesModule } from '../expenses/expenses.module';

@Module({
  imports: [FinancialConceptsModule, UsersModule, ExpensesModule],
  providers: [TrpcService, TrpcRouter],
  exports: [TrpcService, TrpcRouter],
})
export class TrpcModule {}