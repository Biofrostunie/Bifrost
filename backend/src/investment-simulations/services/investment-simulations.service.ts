import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InvestmentSimulationsRepository } from '../repositories/investment-simulations.repository';
import { CreateSimulationDto } from '../dto/create-simulation.dto';
import { UpdateSimulationDto } from '../dto/update-simulation.dto';
import { CalculateInvestmentDto } from '../dto/calculate-investment.dto';
import { CacheService } from '../../redis/cache.service';

@Injectable()
export class InvestmentSimulationsService {
  private readonly logger = new Logger(InvestmentSimulationsService.name);
  private readonly CACHE_PREFIX = 'simulation:calculation';

  constructor(
    private readonly simulationsRepository: InvestmentSimulationsRepository,
    private readonly cacheService: CacheService,
  ) {}

  async getSimulations(userId: string) {
    return this.simulationsRepository.findByUserId(userId);
  }

  calculateInvestment(calculateDto: CalculateInvestmentDto) {
    const {
      initialAmount,
      monthlyContribution = 0,
      annualReturnRate,
      timePeriodMonths,
    } = calculateDto;

    const monthlyReturn = annualReturnRate / 100 / 12;

    let futureValue = initialAmount;
    let totalContributions = initialAmount;

    for (let month = 0; month < timePeriodMonths; month++) {
      futureValue = futureValue * (1 + monthlyReturn) + monthlyContribution;
      totalContributions += monthlyContribution;
    }

    const totalReturns = futureValue - totalContributions;
    const roi =
      totalContributions > 0 ? (totalReturns / totalContributions) * 100 : 0;

    return {
      futureValue: Math.round(futureValue * 100) / 100,
      totalContributions: Math.round(totalContributions * 100) / 100,
      totalReturns: Math.round(totalReturns * 100) / 100,
      monthlyReturn: Math.round(monthlyReturn * 10000) / 100,
      roi: Math.round(roi * 100) / 100,
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
    await this.getSimulationById(userId, simulationId);
    await this.invalidateSimulationCache(simulationId);

    return this.simulationsRepository.update(simulationId, updateSimulationDto);
  }

  async deleteSimulation(userId: string, simulationId: string) {
    await this.getSimulationById(userId, simulationId);
    await this.invalidateSimulationCache(simulationId);

    return this.simulationsRepository.delete(simulationId);
  }

  async getSimulationWithCalculation(userId: string, simulationId: string) {
    const cacheKey = `${userId}:${simulationId}`;
    const cached = await this.cacheService.get<any>(cacheKey, this.CACHE_PREFIX);

    if (cached) {
      this.logger.debug(`Cache HIT for simulation ${cacheKey}`);
      return cached;
    }

    const simulation = await this.getSimulationById(userId, simulationId);

    const calculation = this.calculateInvestment({
      initialAmount: simulation.initialAmount.toNumber(),
      monthlyContribution: simulation.monthlyContribution?.toNumber() || 0,
      annualReturnRate: simulation.annualReturnRate.toNumber(),
      timePeriodMonths: simulation.timePeriodMonths,
    });

    const result = {
      ...simulation,
      calculation,
    };

    await this.cacheService.set(cacheKey, result, {
      ttl: 3600, // 1 hour
      prefix: this.CACHE_PREFIX,
    });

    this.logger.debug(`Cache SET for simulation ${cacheKey}`);
    return result;
  }

  private async invalidateSimulationCache(simulationId: string) {
    await this.cacheService.delPattern(`*:${simulationId}`, this.CACHE_PREFIX);
    this.logger.debug(`Cache invalidated for simulationId ${simulationId}`);
  }
}
