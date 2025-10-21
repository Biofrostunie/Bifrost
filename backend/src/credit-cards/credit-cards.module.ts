import { Module } from '@nestjs/common';
import { CreditCardsController } from './controllers/credit-cards.controller';
import { CreditCardsService } from './services/credit-cards.service';
import { CreditCardsRepository } from './repositories/credit-cards.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CreditCardsController],
  providers: [CreditCardsService, CreditCardsRepository],
  exports: [CreditCardsService, CreditCardsRepository],
})
export class CreditCardsModule {}