import { Test, TestingModule } from '@nestjs/testing';
import { Decimal } from '@prisma/client/runtime/library';

import { ExpensesRepository } from './expenses.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('ExpensesRepository', () => {
  let repository: ExpensesRepository;
  let prisma: jest.Mocked<PrismaService>;

  const mockExpense = {
    id: 'expense-id',
    userId: 'user-id',
    description: 'Test Expense',
    amount: new Decimal(100),
    category: 'Food',
    date: new Date('2024-01-15'),
    essential: false,
    notes: 'Test notes',
    createdAt: new Date(),
    user: {
      id: 'user-id',
      email: 'test@example.com',
      fullName: 'Test User',
    },
  };

  beforeEach(async () => {
    const mockPrismaService = {
      expense: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
        groupBy: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<ExpensesRepository>(ExpensesRepository);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create an expense', async () => {
      const createData = {
        userId: 'user-id',
        description: 'Test Expense',
        amount: 100,
        category: 'Food',
        date: '2024-01-15',
        essential: false,
      };

      (prisma.expense.create as jest.Mock).mockResolvedValue(mockExpense);

      const result = await repository.create(createData);

      expect(prisma.expense.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          amount: new Decimal(100),
          date: new Date('2024-01-15'),
        },
      });
      expect(result).toEqual(mockExpense);
    });
  });

  describe('findById', () => {
    it('should find expense by id', async () => {
      (prisma.expense.findUnique as jest.Mock).mockResolvedValue(mockExpense);

      const result = await repository.findById('expense-id');

      expect(prisma.expense.findUnique).toHaveBeenCalledWith({
        where: { id: 'expense-id' },
      });
      expect(result).toEqual(mockExpense);
    });

    it('should return null if expense not found', async () => {
      (prisma.expense.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find expenses by user id', async () => {
      const expenses = [mockExpense];
      (prisma.expense.findMany as jest.Mock).mockResolvedValue(expenses);

      const result = await repository.findByUserId('user-id', {});

      expect(prisma.expense.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        orderBy: { date: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });
      expect(result).toEqual(expenses);
    });

    it('should filter by date range', async () => {
      const query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      (prisma.expense.findMany as jest.Mock).mockResolvedValue([mockExpense]);

      await repository.findByUserId('user-id', query);

      expect(prisma.expense.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          date: {
            gte: new Date('2024-01-01'),
            lte: expect.any(Date), // End date with time set to end of day
          },
        },
        orderBy: { date: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });
    });

    it('should filter by category', async () => {
      const query = { category: 'Food' };

      (prisma.expense.findMany as jest.Mock).mockResolvedValue([mockExpense]);

      await repository.findByUserId('user-id', query);

      expect(prisma.expense.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          category: {
            equals: 'Food',
            mode: 'insensitive',
          },
        },
        orderBy: { date: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });
    });

    it('should filter by essential flag', async () => {
      const query = { essential: true };

      (prisma.expense.findMany as jest.Mock).mockResolvedValue([mockExpense]);

      await repository.findByUserId('user-id', query);

      expect(prisma.expense.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          essential: true,
        },
        orderBy: { date: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });
    });

    it('should handle multiple filters', async () => {
      const query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        category: 'Food',
        essential: false,
      };

      (prisma.expense.findMany as jest.Mock).mockResolvedValue([mockExpense]);

      await repository.findByUserId('user-id', query);

      expect(prisma.expense.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          date: {
            gte: new Date('2024-01-01'),
            lte: expect.any(Date),
          },
          category: {
            equals: 'Food',
            mode: 'insensitive',
          },
          essential: false,
        },
        orderBy: { date: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });
    });
  });

  describe('update', () => {
    it('should update expense', async () => {
      const updateData = {
        description: 'Updated Expense',
        amount: 150,
      };

      const updatedExpense = {
        ...mockExpense,
        description: 'Updated Expense',
        amount: new Decimal(150),
      };

      (prisma.expense.update as jest.Mock).mockResolvedValue(updatedExpense);

      const result = await repository.update('expense-id', updateData);

      expect(prisma.expense.update).toHaveBeenCalledWith({
        where: { id: 'expense-id' },
        data: {
          description: 'Updated Expense',
          amount: new Decimal(150),
        },
      });
      expect(result).toEqual(updatedExpense);
    });

    it('should handle date update', async () => {
      const updateData = {
        date: '2024-02-01',
      };

      (prisma.expense.update as jest.Mock).mockResolvedValue(mockExpense);

      await repository.update('expense-id', updateData);

      expect(prisma.expense.update).toHaveBeenCalledWith({
        where: { id: 'expense-id' },
        data: {
          date: new Date('2024-02-01'),
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete expense', async () => {
      (prisma.expense.delete as jest.Mock).mockResolvedValue(mockExpense);

      const result = await repository.delete('expense-id');

      expect(prisma.expense.delete).toHaveBeenCalledWith({
        where: { id: 'expense-id' },
      });
      expect(result).toEqual(mockExpense);
    });
  });

  describe('getTotalByCategory', () => {
    it('should get total by category', async () => {
      const categoryTotals = [
        { category: 'Food', _sum: { amount: new Decimal(200) } },
        { category: 'Transport', _sum: { amount: new Decimal(100) } },
      ];

      (prisma.expense.groupBy as jest.Mock).mockResolvedValue(categoryTotals);

      const result = await repository.getTotalByCategory('user-id');

      expect(prisma.expense.groupBy).toHaveBeenCalledWith({
        by: ['category'],
        where: { userId: 'user-id' },
        _sum: {
          amount: true,
        },
      });
      expect(result).toEqual(categoryTotals);
    });

    it('should get total by category with date filters', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const categoryTotals = [
        { category: 'Food', _sum: { amount: new Decimal(150) } },
      ];

      (prisma.expense.groupBy as jest.Mock).mockResolvedValue(categoryTotals);

      const result = await repository.getTotalByCategory('user-id', startDate, endDate);

      expect(prisma.expense.groupBy).toHaveBeenCalledWith({
        by: ['category'],
        where: {
          userId: 'user-id',
          date: {
            gte: startDate,
            lte: expect.any(Date), // End date with time adjusted
          },
        },
        _sum: {
          amount: true,
        },
      });
      expect(result).toEqual(categoryTotals);
    });
  });

  describe('getMonthlyTotals', () => {
    it('should get monthly totals', async () => {
      const monthlyTotals = [
        { month: 1, total: new Decimal(500), count: 10 },
        { month: 2, total: new Decimal(600), count: 12 },
      ];

      (prisma.$queryRaw as jest.Mock).mockResolvedValue(monthlyTotals);

      const result = await repository.getMonthlyTotals('user-id', 2024);

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(result).toEqual(monthlyTotals);
    });
  });

  describe('debugUserExpenses', () => {
    it('should debug user expenses', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        fullName: 'Test User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.expense.count as jest.Mock).mockResolvedValue(5);
      (prisma.expense.findMany as jest.Mock).mockResolvedValue([mockExpense]);
      (prisma.expense.aggregate as jest.Mock).mockResolvedValue({
        _min: { date: new Date('2024-01-01') },
        _max: { date: new Date('2024-01-31') },
      });
      (prisma.expense.groupBy as jest.Mock).mockResolvedValue([
        { category: 'Food', _count: { category: 3 } },
      ]);

      await repository.debugUserExpenses('user-id');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        select: { id: true, email: true, fullName: true },
      });
      expect(prisma.expense.count).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
      });
    });

    it('should handle user not found in debug', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await repository.debugUserExpenses('nonexistent-user');

      expect(prisma.user.findUnique).toHaveBeenCalled();
      expect(prisma.expense.count).not.toHaveBeenCalled();
    });
  });
});