import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSimulationDto } from '../dto/create-simulation.dto';
import { UpdateSimulationDto } from '../dto/update-simulation.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class InvestmentSimulationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSimulationDto & { userId: string }) {
    return this.prisma.investmentSimulation.create({
      data: {
        ...data,
        initialAmount: new Decimal(data.initialAmount),
        monthlyContribution: data.monthlyContribution 
          ? new Decimal(data.monthlyContribution) 
          : null,
        annualReturnRate: new Decimal(data.annualReturnRate),
      },
    });
  }

  async findById(id: string) {
    return this.prisma.investmentSimulation.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.investmentSimulation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateSimulationDto) {
    const updateData: any = { ...data };
    
    if (data.initialAmount !== undefined) {
      updateData.initialAmount = new Decimal(data.initialAmount);
    }
    
    if (data.monthlyContribution !== undefined) {
      updateData.monthlyContribution = data.monthlyContribution 
        ? new Decimal(data.monthlyContribution) 
        : null;
    }
    
    if (data.annualReturnRate !== undefined) {
      updateData.annualReturnRate = new Decimal(data.annualReturnRate);
    }

    return this.prisma.investmentSimulation.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return this.prisma.investmentSimulation.delete({
      where: { id },
    });
  }
}