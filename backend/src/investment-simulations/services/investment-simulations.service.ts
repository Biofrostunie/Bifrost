import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InvestmentSimulationsRepository } from '../repositories/investment-simulations.repository';
import { CreateSimulationDto } from '../dto/create-simulation.dto';
import { UpdateSimulationDto } from '../dto/update-simulation.dto';
import { CalculateInvestmentDto } from '../dto/calculate-investment.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class InvestmentSimulationsService {
  constructor(
    private readonly simulationsRepository: InvestmentSimulationsRepository,
  ) {}

  async getSimulations(userId: string) {
    return this.simulationsRepository.findByUserId(userId);
  }

  calculateInvestment(calculateDto: CalculateInvestmentDto) {
    const { 
      initialAmount, 
      monthlyContribution = 0, 
      annualReturnRate, 
      timePeriodMonths 
    } = calculateDto;

    // Convert annual return to monthly return
    const monthlyReturn = annualReturnRate / 100 / 12;
    
    // Calculate future value with compound interest
    let futureValue = initialAmount;
    let totalContributions = initialAmount;

    // Apply compound interest month by month with monthly contributions
    for (let month = 0; month < timePeriodMonths; month++) {
      futureValue = futureValue * (1 + monthlyReturn) + monthlyContribution;
      totalContributions += monthlyContribution;
    }

    const totalReturns = futureValue - totalContributions;
    const roi = totalContributions > 0 ? (totalReturns / totalContributions) * 100 : 0;

    return {
      futureValue: Math.round(futureValue * 100) / 100,
      totalContributions: Math.round(totalContributions * 100) / 100,
      totalReturns: Math.round(totalReturns * 100) / 100,
      monthlyReturn: Math.round(monthlyReturn * 10000) / 100, // as percentage
      roi: Math.round(roi * 100) / 100, // ROI as percentage
      timePeriodYears: Math.round((timePeriodMonths / 12) * 100) / 100,
    };
  }

  async createSimulation(userId: string, createSimulationDto: CreateSimulationDto) {
    return this.simulationsRepository.create({
      ...createSimulationDto,
      userId,
    });
  }

  async getSimulationById(userId: string, simulationId: string) {
    const simulation = await this.simulationsRepository.findById(simulationId);

    if (!simulation) {
      throw new NotFoundException('Simulation not found');
    }

    if (simulation.userId !== userId) {
      throw new ForbiddenException('Access denied to this simulation');
    }

    return simulation;
  }

  async updateSimulation(
    userId: string,
    simulationId: string,
    updateSimulationDto: UpdateSimulationDto,
  ) {
    await this.getSimulationById(userId, simulationId); // Validates ownership

    return this.simulationsRepository.update(simulationId, updateSimulationDto);
  }

  async deleteSimulation(userId: string, simulationId: string) {
    await this.getSimulationById(userId, simulationId); // Validates ownership

    return this.simulationsRepository.delete(simulationId);
  }

  async getSimulationWithCalculation(userId: string, simulationId: string) {
    const simulation = await this.getSimulationById(userId, simulationId);
    
    const calculation = this.calculateInvestment({
      initialAmount: simulation.initialAmount.toNumber(),
      monthlyContribution: simulation.monthlyContribution?.toNumber() || 0,
      annualReturnRate: simulation.annualReturnRate.toNumber(),
      timePeriodMonths: simulation.timePeriodMonths,
    });

    return {
      ...simulation,
      calculation,
    };
  }
}