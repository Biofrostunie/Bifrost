import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCreditCardDto } from '../dto/create-credit-card.dto';
import { UpdateCreditCardDto } from '../dto/update-credit-card.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CreditCardsRepository {
  private readonly logger = new Logger(CreditCardsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateCreditCardDto) {
    return this.prisma.creditCard.create({
      data: {
        userId,
        issuer: data.issuer,
        alias: data.alias,
        brand: data.brand,
        last4: data.last4,
        limit: data.limit !== undefined ? new Decimal(data.limit) : undefined,
        statementDay: data.statementDay,
        dueDay: data.dueDay,
        bankAccountId: data.bankAccountId,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.creditCard.findUnique({ where: { id } });
  }

  async findByUserId(userId: string) {
    return this.prisma.creditCard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateCreditCardDto) {
    const updateData: any = { ...data };
    if (data.limit !== undefined) updateData.limit = new Decimal(data.limit);
    if (data.currentBalance !== undefined) updateData.currentBalance = new Decimal(data.currentBalance);

    return this.prisma.creditCard.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return this.prisma.creditCard.delete({ where: { id } });
  }
}