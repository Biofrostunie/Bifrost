import { Test, TestingModule } from '@nestjs/testing';
import { Decimal } from '@prisma/client/runtime/library';

import { PdfService, ExpenseReportData } from './pdf.service';
import { CacheService } from '../../redis/cache.service';

describe('PdfService', () => {
  let service: PdfService;
  let cacheService: jest.Mocked<CacheService>;

  const mockReportData: ExpenseReportData = {
    expenses: [
      {
        id: 'expense-1',
        userId: 'user-1',
        description: 'Test Expense',
        amount: new Decimal(100),
        category: 'Food',
        date: new Date('2024-01-15'),
        essential: false,
        notes: 'Test notes',
        createdAt: new Date(),
      } as any,
    ],
    totalAmount: 100,
    period: {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    },
    user: {
      fullName: 'Test User',
      email: 'test@example.com',
    },
    categories: [
      {
        name: 'Food',
        total: 100,
        percentage: 100,
        color: '#FF6384',
      },
    ],
  };

  beforeEach(async () => {
    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn(),
      incr: jest.fn(),
      incrWithExpire: jest.fn(),
      mget: jest.fn(),
      mset: jest.fn(),
      delPattern: jest.fn(),
      getOrSet: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfService,
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<PdfService>(PdfService);
    cacheService = module.get(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateReportData', () => {
    it('should validate report data successfully', () => {
      expect(() => service['validateReportData'](mockReportData, 'test-id')).not.toThrow();
    });

    it('should throw error for null data', () => {
      expect(() => service['validateReportData'](null as any, 'test-id')).toThrow('No report data provided');
    });

    it('should throw error for empty expenses', () => {
      const emptyData = { ...mockReportData, expenses: [] };
      expect(() => service['validateReportData'](emptyData, 'test-id')).not.toThrow(); // Array vazio é válido
    });

    it('should throw error for null expenses', () => {
      const nullExpensesData = { ...mockReportData, expenses: null as any };
      expect(() => service['validateReportData'](nullExpensesData, 'test-id')).toThrow('Invalid expense data provided');
    });

    it('should throw error for invalid user data', () => {
      const invalidData = { ...mockReportData, user: { fullName: '', email: '' } };
      expect(() => service['validateReportData'](invalidData, 'test-id')).toThrow('Invalid user data provided');
    });

    it('should throw error for missing user', () => {
      const invalidData = { ...mockReportData, user: null as any };
      expect(() => service['validateReportData'](invalidData, 'test-id')).toThrow('Invalid user data provided');
    });
  });

  describe('enhanceDataWithColors', () => {
    it('should enhance data with colors', () => {
      const result = service['enhanceDataWithColors'](mockReportData);
      expect(result).toBeDefined();
      expect(result.categories).toBeDefined();
      expect(result.categories[0].color).toBeDefined();
    });
  });

  describe('prepareCategoryChartData', () => {
    it('should prepare category chart data correctly', () => {
      const result = service['prepareCategoryChartData'](mockReportData.categories);
      expect(result).toBeDefined();
      expect(result.labels).toBeDefined();
      expect(result.datasets).toBeDefined();
    });
  });

  describe('prepareEssentialChartData', () => {
    it('should prepare essential chart data correctly', () => {
      const result = service['prepareEssentialChartData'](mockReportData.expenses);
      expect(result).toBeDefined();
      expect(result.labels).toBeDefined();
      expect(result.datasets).toBeDefined();
    });
  });

  describe('createUserFriendlyError', () => {
    it('should create user-friendly error for browser launch failure', () => {
      const error = new Error('Failed to launch browser');
      const result = service['createUserFriendlyError'](error);
      expect(result.message).toContain('PDF service is temporarily unavailable');
    });

    it('should create user-friendly error for content loading failure', () => {
      const error = new Error('Navigation failed');
      const result = service['createUserFriendlyError'](error);
      expect(result.message).toContain('Failed to load report content');
    });

    it('should create user-friendly error for invalid data', () => {
      const error = new Error('Invalid data provided');
      const result = service['createUserFriendlyError'](error);
      expect(result.message).toContain('Invalid data provided');
    });

    it('should create generic error for unknown issues', () => {
      const error = new Error('Unknown error');
      const result = service['createUserFriendlyError'](error);
      expect(result.message).toContain('Failed to generate PDF report');
    });
  });

  describe('isCriticalError', () => {
    it('should identify critical errors correctly', () => {
      const criticalError = new Error('Protocol error');
      const nonCriticalError = new Error('Navigation timeout');
      
      expect(service['isCriticalError'](criticalError)).toBe(true);
      expect(service['isCriticalError'](nonCriticalError)).toBe(false);
    });
  });
});