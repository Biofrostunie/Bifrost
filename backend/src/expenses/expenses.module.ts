import { Module } from '@nestjs/common';
import { ExpensesController } from './controllers/expenses.controller';
import { ExpensesService } from './services/expenses.service';
import { ExpensesRepository } from './repositories/expenses.repository';
import { PdfService } from '../common/services/pdf.service';
import { UsersModule } from '../users/users.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [UsersModule, RedisModule],
  controllers: [ExpensesController],
  providers: [ExpensesService, ExpensesRepository, PdfService],
  exports: [ExpensesService, ExpensesRepository],
})
export class ExpensesModule {}