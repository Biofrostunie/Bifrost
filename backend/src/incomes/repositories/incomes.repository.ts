import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIncomeDto } from '../dto/create-income.dto';
import { UpdateIncomeDto } from '../dto/update-income.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class IncomesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateIncomeDto & { userId: string }) {
    return this.prisma.income.create({
      data: {
        ...data,
        amount: new Decimal(data.amount),
      },
    });
  }

  async findById(id: string) {
    return this.prisma.income.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.income.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRecurrentByUserId(userId: string) {
    return this.prisma.income.findMany({
      where: { 
        userId,
        recurrent: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTotalByUserId(userId: string) {
    const result = await this.prisma.income.aggregate({
      where: { userId },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || new Decimal(0);
  }

  async update(id: string, data: UpdateIncomeDto) {
    const updateData: any = { ...data };
    
    if (data.amount !== undefined) {
      updateData.amount = new Decimal(data.amount);
    }

    return this.prisma.income.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return this.prisma.income.delete({
      where: { id },
    });
  }
}