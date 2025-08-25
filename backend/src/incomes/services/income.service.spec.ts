import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

import { IncomesService } from './incomes.service';
import { IncomesRepository } from '../repositories/incomes.repository';

describe('IncomesService', () => {
  let service: IncomesService;
  let repository: jest.Mocked<IncomesRepository>;

  const mockIncome = {
    id: 'income-id',
    userId: 'user-id',
    source: 'Salary',
    amount: new Decimal(3000),
    recurrent: true,
    description: 'Monthly salary',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findRecurrentByUserId: jest.fn(),
      getTotalByUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncomesService,
        {
          provide: IncomesRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<IncomesService>(IncomesService);
    repository = module.get(IncomesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getIncomes', () => {
    it('should return user incomes', async () => {
      const incomes = [mockIncome];
      repository.findByUserId.mockResolvedValue(incomes);

      const result = await service.getIncomes('user-id');

      expect(repository.findByUserId).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(incomes);
    });

    it('should return empty array when no incomes found', async () => {
      repository.findByUserId.mockResolvedValue([]);

      const result = await service.getIncomes('user-id');

      expect(result).toEqual([]);
    });
  });

  describe('getTotalIncome', () => {
    it('should return total income', async () => {
      const total = new Decimal(5000);
      repository.getTotalByUserId.mockResolvedValue(total);

      const result = await service.getTotalIncome('user-id');

      expect(repository.getTotalByUserId).toHaveBeenCalledWith('user-id');
      expect(result).toEqual({ totalIncome: 5000 });
    });

    it('should return zero when no incomes', async () => {
      repository.getTotalByUserId.mockResolvedValue(new Decimal(0));

      const result = await service.getTotalIncome('user-id');

      expect(result).toEqual({ totalIncome: 0 });
    });
  });

  describe('getRecurrentIncomes', () => {
    it('should return recurrent incomes', async () => {
      const recurrentIncomes = [mockIncome];
      repository.findRecurrentByUserId.mockResolvedValue(recurrentIncomes);

      const result = await service.getRecurrentIncomes('user-id');

      expect(repository.findRecurrentByUserId).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(recurrentIncomes);
    });

    it('should return empty array when no recurrent incomes', async () => {
      repository.findRecurrentByUserId.mockResolvedValue([]);

      const result = await service.getRecurrentIncomes('user-id');

      expect(result).toEqual([]);
    });
  });

  describe('createIncome', () => {
    it('should create a new income', async () => {
      const createIncomeDto = {
        source: 'Freelance',
        amount: 1500,
        recurrent: false,
        description: 'Project payment',
      };

      repository.create.mockResolvedValue(mockIncome);

      const result = await service.createIncome('user-id', createIncomeDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createIncomeDto,
        userId: 'user-id',
      });
      expect(result).toEqual(mockIncome);
    });

    it('should create income with minimal data', async () => {
      const createIncomeDto = {
        source: 'Bonus',
        amount: 500,
      };

      const minimalIncome = {
        ...mockIncome,
        source: 'Bonus',
        amount: new Decimal(500),
        recurrent: false,
        description: null,
      };

      repository.create.mockResolvedValue(minimalIncome);

      const result = await service.createIncome('user-id', createIncomeDto);

      expect(result).toEqual(minimalIncome);
    });
  });

  describe('getIncomeById', () => {
    it('should return income by id', async () => {
      repository.findById.mockResolvedValue(mockIncome);

      const result = await service.getIncomeById('user-id', 'income-id');

      expect(repository.findById).toHaveBeenCalledWith('income-id');
      expect(result).toEqual(mockIncome);
    });

    it('should throw NotFoundException when income not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getIncomeById('user-id', 'nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own income', async () => {
      const otherUserIncome = {
        ...mockIncome,
        userId: 'other-user-id',
      };

      repository.findById.mockResolvedValue(otherUserIncome);

      await expect(service.getIncomeById('user-id', 'income-id')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateIncome', () => {
    it('should update income', async () => {
      const updateIncomeDto = {
        source: 'Updated Salary',
        amount: 3500,
      };

      const updatedIncome = {
        ...mockIncome,
        source: 'Updated Salary',
        amount: new Decimal(3500),
      };

      repository.findById.mockResolvedValue(mockIncome);
      repository.update.mockResolvedValue(updatedIncome);

      const result = await service.updateIncome('user-id', 'income-id', updateIncomeDto);

      expect(repository.update).toHaveBeenCalledWith('income-id', updateIncomeDto);
      expect(result).toEqual(updatedIncome);
    });

    it('should throw NotFoundException when income not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateIncome('user-id', 'nonexistent-id', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteIncome', () => {
    it('should delete income', async () => {
      repository.findById.mockResolvedValue(mockIncome);
      repository.delete.mockResolvedValue(mockIncome);

      const result = await service.deleteIncome('user-id', 'income-id');

      expect(repository.delete).toHaveBeenCalledWith('income-id');
      expect(result).toEqual(mockIncome);
    });

    it('should throw NotFoundException when income not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteIncome('user-id', 'nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});