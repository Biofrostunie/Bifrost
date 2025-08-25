import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IncomesRepository } from '../repositories/incomes.repository';
import { CreateIncomeDto } from '../dto/create-income.dto';
import { UpdateIncomeDto } from '../dto/update-income.dto';

@Injectable()
export class IncomesService {
  constructor(private readonly incomesRepository: IncomesRepository) {}

  async getIncomes(userId: string) {
    return this.incomesRepository.findByUserId(userId);
  }

  async getTotalIncome(userId: string) {
    const total = await this.incomesRepository.getTotalByUserId(userId);
    return { totalIncome: total.toNumber() };
  }

  async getRecurrentIncomes(userId: string) {
    return this.incomesRepository.findRecurrentByUserId(userId);
  }

  async createIncome(userId: string, createIncomeDto: CreateIncomeDto) {
    return this.incomesRepository.create({
      ...createIncomeDto,
      userId,
    });
  }

  async getIncomeById(userId: string, incomeId: string) {
    const income = await this.incomesRepository.findById(incomeId);

    if (!income) {
      throw new NotFoundException('Income not found');
    }

    if (income.userId !== userId) {
      throw new ForbiddenException('Access denied to this income');
    }

    return income;
  }

  async updateIncome(
    userId: string,
    incomeId: string,
    updateIncomeDto: UpdateIncomeDto,
  ) {
    await this.getIncomeById(userId, incomeId); // Validates ownership

    return this.incomesRepository.update(incomeId, updateIncomeDto);
  }

  async deleteIncome(userId: string, incomeId: string) {
    await this.getIncomeById(userId, incomeId); // Validates ownership

    return this.incomesRepository.delete(incomeId);
  }
}