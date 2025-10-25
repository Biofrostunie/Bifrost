import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBankAccountDto } from '../dto/create-bank-account.dto';
import { UpdateBankAccountDto } from '../dto/update-bank-account.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BankAccountsRepository {
  private readonly logger = new Logger(BankAccountsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateBankAccountDto) {
    return this.prisma.bankAccount.create({
      data: {
        userId,
        bankName: data.bankName,
        alias: data.alias,
        accountType: data.accountType,
        accountNumber: data.accountNumber,
        balance: new Decimal(data.balance),
        currency: data.currency ?? 'BRL',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.bankAccount.findUnique({ where: { id } });
  }

  async findByUserId(userId: string) {
    return this.prisma.bankAccount.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateBankAccountDto) {
    const updateData: any = { ...data };
    if (data.balance !== undefined) {
      updateData.balance = new Decimal(data.balance);
    }

    return this.prisma.bankAccount.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return this.prisma.bankAccount.delete({ where: { id } });
  }
}