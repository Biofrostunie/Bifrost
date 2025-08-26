import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { InvestmentRatesController } from './controllers/investment-rates.controller';
import { InvestmentRatesService } from './services/investment-rates.service';
import { InvestmentRatesRepository } from './repositories/investment-rates.repository';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    RedisModule,
  ],
  controllers: [InvestmentRatesController],
  providers: [InvestmentRatesService, InvestmentRatesRepository],
  exports: [InvestmentRatesService, InvestmentRatesRepository],
})
export class InvestmentRatesModule {}