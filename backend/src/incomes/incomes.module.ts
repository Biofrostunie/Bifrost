import { Module } from '@nestjs/common';
import { IncomesController } from './controllers/incomes.controller';
import { IncomesService } from './services/incomes.service';
import { IncomesRepository } from './repositories/incomes.repository';

@Module({
  controllers: [IncomesController],
  providers: [IncomesService, IncomesRepository],
  exports: [IncomesService, IncomesRepository],
})
export class IncomesModule {}