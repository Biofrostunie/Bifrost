import { Module } from '@nestjs/common';
import { BankAccountsController } from './controllers/bank-accounts.controller';
import { BankAccountsService } from './services/bank-accounts.service';
import { BankAccountsRepository } from './repositories/bank-accounts.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BankAccountsController],
  providers: [BankAccountsService, BankAccountsRepository],
  exports: [BankAccountsService, BankAccountsRepository],
})
export class BankAccountsModule {}