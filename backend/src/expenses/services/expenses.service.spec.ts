import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

import { ExpensesService } from './expenses.service';
import { ExpensesRepository } from '../repositories/expenses.repository';
import { PdfService } from '../../common/services/pdf.service';
import { UsersService } from '../../users/services/users.service';
import { CacheService } from '../../redis/cache.service';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let expensesRepository: jest.Mocked<ExpensesRepository>;
  let pdfService: jest.Mocked<PdfService>;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    fullName: 'Test User',
    passwordHash: 'hash',
    phone: null,
    address: null,
    isEmailVerified: true,
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockExpense = {
    id: 'expense-id',
    userId: 'user-id',
    description: 'Test Expense',
    amount: new Decimal(100),
    category: 'Food',
    date: new Date(),
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
    const mockExpensesRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getTotalByCategory: jest.fn(),
      debugUserExpenses: jest.fn(),
    };

    const mockPdfService = {
      generateExpenseReport: jest.fn(),
    };

    const mockUsersService = {
      findById: jest.fn(),
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      delPattern: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: ExpensesRepository,
          useValue: mockExpensesRepository,
        },
        {
          provide: PdfService,
          useValue: mockPdfService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    expensesRepository = module.get(ExpensesRepository);
    pdfService = module.get(PdfService);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getExpenses', () => {
    it('should return user expenses', async () => {
      const query = { category: 'Food' };
      const expenses = [mockExpense];

      expensesRepository.findByUserId.mockResolvedValue(expenses);

      const result = await service.getExpenses('user-id', query);

      expect(expensesRepository.findByUserId).toHaveBeenCalledWith('user-id', query);
      expect(result).toEqual(expenses);
    });

    it('should return empty array when no expenses found', async () => {
      expensesRepository.findByUserId.mockResolvedValue([]);

      const result = await service.getExpenses('user-id', {});

      expect(result).toEqual([]);
    });
  });

  describe('createExpense', () => {
    it('should create a new expense', async () => {
      const createExpenseDto = {
        description: 'New Expense',
        amount: 50,
        category: 'Transport',
        date: '2024-01-15',
        essential: true,
      };

      expensesRepository.create.mockResolvedValue(mockExpense);

      const result = await service.createExpense('user-id', createExpenseDto);

      expect(expensesRepository.create).toHaveBeenCalledWith({
        ...createExpenseDto,
        userId: 'user-id',
      });
      expect(result).toEqual(mockExpense);
    });

    it('should create expense with minimal data', async () => {
      const createExpenseDto = {
        description: 'Minimal Expense',
        amount: 25,
        category: 'Other',
        date: '2024-01-15',
      };

      const minimalExpense = {
        ...mockExpense,
        description: 'Minimal Expense',
        amount: new Decimal(25),
        category: 'Other',
        essential: false,
        notes: null,
      };

      expensesRepository.create.mockResolvedValue(minimalExpense);

      const result = await service.createExpense('user-id', createExpenseDto);

      expect(result).toEqual(minimalExpense);
    });
  });

  describe('getExpenseById', () => {
    it('should return expense by id', async () => {
      expensesRepository.findById.mockResolvedValue(mockExpense);

      const result = await service.getExpenseById('user-id', 'expense-id');

      expect(expensesRepository.findById).toHaveBeenCalledWith('expense-id');
      expect(result).toEqual(mockExpense);
    });

    it('should throw NotFoundException when expense not found', async () => {
      expensesRepository.findById.mockResolvedValue(null);

      await expect(service.getExpenseById('user-id', 'nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own expense', async () => {
      const otherUserExpense = {
        ...mockExpense,
        userId: 'other-user-id',
      };

      expensesRepository.findById.mockResolvedValue(otherUserExpense);

      await expect(service.getExpenseById('user-id', 'expense-id')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateExpense', () => {
    it('should update expense', async () => {
      const updateExpenseDto = {
        description: 'Updated Expense',
        amount: 75,
      };

      const updatedExpense = {
        ...mockExpense,
        description: 'Updated Expense',
        amount: new Decimal(75),
      };

      expensesRepository.findById.mockResolvedValue(mockExpense);
      expensesRepository.update.mockResolvedValue(updatedExpense);

      const result = await service.updateExpense('user-id', 'expense-id', updateExpenseDto);

      expect(expensesRepository.update).toHaveBeenCalledWith('expense-id', updateExpenseDto);
      expect(result).toEqual(updatedExpense);
    });

    it('should throw NotFoundException when expense not found', async () => {
      expensesRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateExpense('user-id', 'nonexistent-id', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteExpense', () => {
    it('should delete expense', async () => {
      expensesRepository.findById.mockResolvedValue(mockExpense);
      expensesRepository.delete.mockResolvedValue(mockExpense);

      const result = await service.deleteExpense('user-id', 'expense-id');

      expect(expensesRepository.delete).toHaveBeenCalledWith('expense-id');
      expect(result).toEqual(mockExpense);
    });

    it('should throw NotFoundException when expense not found', async () => {
      expensesRepository.findById.mockResolvedValue(null);

      await expect(service.deleteExpense('user-id', 'nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTotalExpensesByCategory', () => {
    it('should return total expenses by category', async () => {
      const categoryTotals = [
        { category: 'Food', _sum: { amount: new Decimal(200) } },
        { category: 'Transport', _sum: { amount: new Decimal(100) } },
      ];

      expensesRepository.getTotalByCategory.mockResolvedValue(categoryTotals);

      const result = await service.getTotalExpensesByCategory('user-id');

      expect(expensesRepository.getTotalByCategory).toHaveBeenCalledWith('user-id', undefined, undefined);
      expect(result).toEqual(categoryTotals);
    });

    it('should return totals with date filters', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const categoryTotals = [
        { category: 'Food', _sum: { amount: new Decimal(150) } },
      ];

      expensesRepository.getTotalByCategory.mockResolvedValue(categoryTotals);

      const result = await service.getTotalExpensesByCategory('user-id', startDate, endDate);

      expect(expensesRepository.getTotalByCategory).toHaveBeenCalledWith('user-id', startDate, endDate);
      expect(result).toEqual(categoryTotals);
    });
  });

  describe('generateExpenseReportPdf', () => {
    it('should generate PDF report', async () => {
      const query = { startDate: '2024-01-01', endDate: '2024-01-31' };
      const expenses = [
        {
          ...mockExpense,
          amount: new Decimal(100),
          user: {
            id: 'user-id',
            email: 'test@example.com',
            fullName: 'Test User',
          },
        },
      ];
      const pdfBuffer = Buffer.from('fake-pdf-content');

      usersService.findById.mockResolvedValue(mockUser);
      expensesRepository.debugUserExpenses.mockResolvedValue(undefined);
      expensesRepository.findByUserId.mockResolvedValue(expenses);
      pdfService.generateExpenseReport.mockResolvedValue(pdfBuffer);

      const result = await service.generateExpenseReportPdf('user-id', query);

      expect(usersService.findById).toHaveBeenCalledWith('user-id');
      expect(expensesRepository.findByUserId).toHaveBeenCalledWith('user-id', query);
      expect(pdfService.generateExpenseReport).toHaveBeenCalled();
      expect(result).toEqual(pdfBuffer);
    });

    it('should throw NotFoundException when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.generateExpenseReportPdf('nonexistent-user', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle empty expenses list', async () => {
      const query = {};
      const pdfBuffer = Buffer.from('empty-report-pdf');

      usersService.findById.mockResolvedValue(mockUser);
      expensesRepository.debugUserExpenses.mockResolvedValue(undefined);
      expensesRepository.findByUserId.mockResolvedValue([]);
      pdfService.generateExpenseReport.mockResolvedValue(pdfBuffer);

      const result = await service.generateExpenseReportPdf('user-id', query);

      expect(result).toEqual(pdfBuffer);
    });

    it('should handle PDF generation error', async () => {
      const query = {};
      const expenses = [mockExpense];

      usersService.findById.mockResolvedValue(mockUser);
      expensesRepository.debugUserExpenses.mockResolvedValue(undefined);
      expensesRepository.findByUserId.mockResolvedValue(expenses);
      pdfService.generateExpenseReport.mockRejectedValue(new Error('PDF generation failed'));

      await expect(service.generateExpenseReportPdf('user-id', query)).rejects.toThrow(
        'Failed to generate expense report: PDF generation failed',
      );
    });
  });

  describe('convertToNumber', () => {
    it('should convert Decimal to number', () => {
      const decimal = new Decimal(123.45);
      const result = (service as any).convertToNumber(decimal);
      expect(result).toBe(123.45);
    });

    it('should return number as is', () => {
      const result = (service as any).convertToNumber(100);
      expect(result).toBe(100);
    });

    it('should parse string to number', () => {
      const result = (service as any).convertToNumber('50.75');
      expect(result).toBe(50.75);
    });

    it('should throw error for invalid value', () => {
      expect(() => (service as any).convertToNumber('invalid')).toThrow('Invalid amount value: invalid');
    });
  });
});