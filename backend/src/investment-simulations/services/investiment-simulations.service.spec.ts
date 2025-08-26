import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

import { InvestmentSimulationsService } from './investment-simulations.service';
import { InvestmentSimulationsRepository } from '../repositories/investment-simulations.repository';
import { CacheService } from '../../redis/cache.service';

describe('InvestmentSimulationsService', () => {
  let service: InvestmentSimulationsService;
  let repository: jest.Mocked<InvestmentSimulationsRepository>;
  let cacheService: jest.Mocked<CacheService>;

  const mockSimulation = {
    id: 'simulation-id',
    userId: 'user-id',
    initialAmount: new Decimal(10000),
    monthlyContribution: new Decimal(500),
    annualReturnRate: new Decimal(8),
    timePeriodMonths: 120,
    simulationName: 'Retirement Fund',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      delPattern: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestmentSimulationsService,
        {
          provide: InvestmentSimulationsRepository,
          useValue: mockRepository,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<InvestmentSimulationsService>(InvestmentSimulationsService);
    repository = module.get(InvestmentSimulationsRepository);
    cacheService = module.get(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSimulations', () => {
    it('should return user simulations', async () => {
      const simulations = [mockSimulation];
      repository.findByUserId.mockResolvedValue(simulations);

      const result = await service.getSimulations('user-id');

      expect(repository.findByUserId).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(simulations);
    });

    it('should return empty array when no simulations found', async () => {
      repository.findByUserId.mockResolvedValue([]);

      const result = await service.getSimulations('user-id');

      expect(result).toEqual([]);
    });
  });

  describe('calculateInvestment', () => {
    it('should calculate investment with monthly contributions', () => {
      const calculateDto = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturnRate: 8,
        timePeriodMonths: 120,
      };

      const result = service.calculateInvestment(calculateDto);

      expect(result.futureValue).toBeGreaterThan(calculateDto.initialAmount);
      expect(result.totalContributions).toBe(70000); // 10000 + (500 * 120)
      expect(result.totalReturns).toBeGreaterThan(0);
      expect(result.roi).toBeGreaterThan(0);
      expect(result.timePeriodYears).toBe(10);
    });

    it('should calculate investment without monthly contributions', () => {
      const calculateDto = {
        initialAmount: 5000,
        monthlyContribution: 0,
        annualReturnRate: 6,
        timePeriodMonths: 60,
      };

      const result = service.calculateInvestment(calculateDto);

      expect(result.futureValue).toBeGreaterThan(calculateDto.initialAmount);
      expect(result.totalContributions).toBe(5000);
      expect(result.totalReturns).toBeGreaterThan(0);
      expect(result.timePeriodYears).toBe(5);
    });

    it('should handle zero return rate', () => {
      const calculateDto = {
        initialAmount: 1000,
        monthlyContribution: 100,
        annualReturnRate: 0,
        timePeriodMonths: 12,
      };

      const result = service.calculateInvestment(calculateDto);

      expect(result.futureValue).toBe(2200); // 1000 + (100 * 12)
      expect(result.totalContributions).toBe(2200);
      expect(result.totalReturns).toBe(0);
      expect(result.roi).toBe(0);
    });

    it('should handle high return rate', () => {
      const calculateDto = {
        initialAmount: 1000,
        monthlyContribution: 0,
        annualReturnRate: 20,
        timePeriodMonths: 12,
      };

      const result = service.calculateInvestment(calculateDto);

      expect(result.futureValue).toBeGreaterThan(1000);
      expect(result.totalReturns).toBeGreaterThan(0);
    });
  });

  describe('createSimulation', () => {
    it('should create a new simulation', async () => {
      const createSimulationDto = {
        simulationName: 'Emergency Fund',
        initialAmount: 5000,
        monthlyContribution: 300,
        annualReturnRate: 4,
        timePeriodMonths: 24,
      };

      repository.create.mockResolvedValue(mockSimulation);

      const result = await service.createSimulation('user-id', createSimulationDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createSimulationDto,
        userId: 'user-id',
      });
      expect(result).toEqual(mockSimulation);
    });

    it('should create simulation without name', async () => {
      const createSimulationDto = {
        initialAmount: 1000,
        annualReturnRate: 5,
        timePeriodMonths: 12,
      };

      const simulationWithoutName = {
        ...mockSimulation,
        simulationName: null,
      };

      repository.create.mockResolvedValue(simulationWithoutName);

      const result = await service.createSimulation('user-id', createSimulationDto);

      expect(result.simulationName).toBeNull();
    });
  });

  describe('getSimulationById', () => {
    it('should return simulation by id', async () => {
      repository.findById.mockResolvedValue(mockSimulation);

      const result = await service.getSimulationById('user-id', 'simulation-id');

      expect(repository.findById).toHaveBeenCalledWith('simulation-id');
      expect(result).toEqual(mockSimulation);
    });

    it('should throw NotFoundException when simulation not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getSimulationById('user-id', 'nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own simulation', async () => {
      const otherUserSimulation = {
        ...mockSimulation,
        userId: 'other-user-id',
      };

      repository.findById.mockResolvedValue(otherUserSimulation);

      await expect(service.getSimulationById('user-id', 'simulation-id')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateSimulation', () => {
    it('should update simulation', async () => {
      const updateSimulationDto = {
        simulationName: 'Updated Fund',
        initialAmount: 15000,
      };

      const updatedSimulation = {
        ...mockSimulation,
        simulationName: 'Updated Fund',
        initialAmount: new Decimal(15000),
      };

      repository.findById.mockResolvedValue(mockSimulation);
      repository.update.mockResolvedValue(updatedSimulation);

      const result = await service.updateSimulation('user-id', 'simulation-id', updateSimulationDto);

      expect(repository.update).toHaveBeenCalledWith('simulation-id', updateSimulationDto);
      expect(result).toEqual(updatedSimulation);
    });

    it('should throw NotFoundException when simulation not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateSimulation('user-id', 'nonexistent-id', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteSimulation', () => {
    it('should delete simulation', async () => {
      repository.findById.mockResolvedValue(mockSimulation);
      repository.delete.mockResolvedValue(mockSimulation);

      const result = await service.deleteSimulation('user-id', 'simulation-id');

      expect(repository.delete).toHaveBeenCalledWith('simulation-id');
      expect(result).toEqual(mockSimulation);
    });

    it('should throw NotFoundException when simulation not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteSimulation('user-id', 'nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getSimulationWithCalculation', () => {
    it('should return simulation with calculation', async () => {
      repository.findById.mockResolvedValue(mockSimulation);

      const result = await service.getSimulationWithCalculation('user-id', 'simulation-id');

      expect(result.id).toBe(mockSimulation.id);
      expect(result.calculation).toBeDefined();
      expect(result.calculation.futureValue).toBeGreaterThan(0);
      expect(result.calculation.totalContributions).toBeGreaterThan(0);
    });

    it('should handle simulation without monthly contribution', async () => {
      const simulationWithoutMonthly = {
        ...mockSimulation,
        monthlyContribution: null,
      };

      repository.findById.mockResolvedValue(simulationWithoutMonthly);

      const result = await service.getSimulationWithCalculation('user-id', 'simulation-id');

      expect(result.calculation).toBeDefined();
      expect(result.calculation.totalContributions).toBe(10000); // Only initial amount
    });

    it('should throw NotFoundException when simulation not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.getSimulationWithCalculation('user-id', 'nonexistent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});