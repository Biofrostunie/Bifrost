import { Module } from '@nestjs/common';
import { InvestmentSimulationsController } from './controllers/investment-simulations.controller';
import { InvestmentSimulationsService } from './services/investment-simulations.service';
import { InvestmentSimulationsRepository } from './repositories/investment-simulations.repository';

@Module({
  controllers: [InvestmentSimulationsController],
  providers: [InvestmentSimulationsService, InvestmentSimulationsRepository],
  exports: [InvestmentSimulationsService, InvestmentSimulationsRepository],
})
export class InvestmentSimulationsModule {}