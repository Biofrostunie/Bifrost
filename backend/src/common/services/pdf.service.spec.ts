import { Test, TestingModule } from '@nestjs/testing';
import * as puppeteer from 'puppeteer';
import { Decimal } from '@prisma/client/runtime/library';

import { PdfService, ExpenseReportData } from './pdf.service';

describe('PdfService', () => {
  let service: PdfService;
  let mockBrowser: jest.Mocked<any>;
  let mockPage: jest.Mocked<any>;
  let puppeteerLaunchSpy: jest.SpyInstance;

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
      },
    ],
  };

  beforeEach(async () => {
    mockPage = {
      setViewport: jest.fn().mockResolvedValue(undefined),
      setUserAgent: jest.fn().mockResolvedValue(undefined),
      setRequestInterception: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      setDefaultTimeout: jest.fn(),
      setDefaultNavigationTimeout: jest.fn(),
      setContent: jest.fn().mockResolvedValue(undefined),
      evaluate: jest.fn().mockResolvedValue(undefined),
      pdf: jest.fn().mockResolvedValue(Buffer.from('fake-pdf-content')),
      close: jest.fn().mockResolvedValue(undefined),
      isClosed: jest.fn().mockReturnValue(false),
    };

    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn().mockResolvedValue(undefined),
      isConnected: jest.fn().mockReturnValue(true),
      on: jest.fn(),
    };

    // Use jest.spyOn instead of direct assignment
    puppeteerLaunchSpy = jest.spyOn(puppeteer, 'launch').mockResolvedValue(mockBrowser);

    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfService],
    }).compile();

    service = module.get<PdfService>(PdfService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    if (puppeteerLaunchSpy) {
      puppeteerLaunchSpy.mockRestore();
    }
    await service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateExpenseReport', () => {
    it('should generate PDF successfully', async () => {
      const result = await service.generateExpenseReport(mockReportData);

      expect(puppeteerLaunchSpy).toHaveBeenCalled();
      expect(mockBrowser.newPage).toHaveBeenCalled();
      expect(mockPage.setViewport).toHaveBeenCalled();
      expect(mockPage.setContent).toHaveBeenCalled();
      expect(mockPage.pdf).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty expenses list', async () => {
      const emptyReportData = {
        ...mockReportData,
        expenses: [],
        totalAmount: 0,
        categories: [],
      };

      const result = await service.generateExpenseReport(emptyReportData);

      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle browser launch failure', async () => {
      puppeteerLaunchSpy.mockRejectedValue(new Error('Browser launch failed'));

      await expect(service.generateExpenseReport(mockReportData)).rejects.toThrow(
        'PDF service is temporarily unavailable. Please try again later.',
      );
    });

    it('should handle page creation failure', async () => {
      mockBrowser.newPage = jest.fn().mockRejectedValue(new Error('Page creation failed'));

      await expect(service.generateExpenseReport(mockReportData)).rejects.toThrow(
        'Failed to generate PDF report. Please try again or contact support if the problem persists.',
      );
    });

    it('should handle PDF generation failure', async () => {
      mockPage.pdf = jest.fn().mockRejectedValue(new Error('PDF generation failed'));

      await expect(service.generateExpenseReport(mockReportData)).rejects.toThrow(
        'Failed to generate PDF report. Please try again or contact support if the problem persists.',
      );
    });

    it('should validate report data', async () => {
      await expect(service.generateExpenseReport(null as any)).rejects.toThrow(
        'Invalid data provided for report generation.',
      );
    });

    it('should handle invalid user data', async () => {
      const invalidReportData = {
        ...mockReportData,
        user: null as any,
      };

      await expect(service.generateExpenseReport(invalidReportData)).rejects.toThrow(
        'Invalid data provided for report generation.',
      );
    });

    it('should close page after generation', async () => {
      await service.generateExpenseReport(mockReportData);

      expect(mockPage.close).toHaveBeenCalled();
    });

    it('should reuse browser instance', async () => {
      await service.generateExpenseReport(mockReportData);
      await service.generateExpenseReport(mockReportData);

      expect(puppeteerLaunchSpy).toHaveBeenCalledTimes(1);
      expect(mockBrowser.newPage).toHaveBeenCalledTimes(2);
    });

    it('should handle browser disconnection', async () => {
      mockBrowser.isConnected = jest.fn().mockReturnValue(false);

      await service.generateExpenseReport(mockReportData);

      expect(puppeteerLaunchSpy).toHaveBeenCalledTimes(2); // First call + retry
    });

    it('should set correct PDF options', async () => {
      await service.generateExpenseReport(mockReportData);

      expect(mockPage.pdf).toHaveBeenCalledWith({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
        displayHeaderFooter: false,
        timeout: 30000,
        omitBackground: false,
        tagged: false,
      });
    });

    it('should handle timeout errors', async () => {
      mockPage.pdf = jest.fn().mockRejectedValue(new Error('Navigation timeout'));

      await expect(service.generateExpenseReport(mockReportData)).rejects.toThrow(
        'PDF generation timed out. Please try again with fewer expenses or a smaller date range.',
      );
    });

    it('should handle critical browser errors', async () => {
      mockPage.setContent = jest.fn().mockRejectedValue(new Error('Protocol error'));

      await expect(service.generateExpenseReport(mockReportData)).rejects.toThrow(
        'Browser communication error. Please try again.',
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('should close browser on module destroy', async () => {
      await service.generateExpenseReport(mockReportData);
      await service.onModuleDestroy();

      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle browser close error gracefully', async () => {
      mockBrowser.close = jest.fn().mockRejectedValue(new Error('Close failed'));

      await service.generateExpenseReport(mockReportData);
      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });
  });

  describe('HTML generation', () => {
    it('should generate valid HTML template', async () => {
      await service.generateExpenseReport(mockReportData);

      const setContentCall = mockPage.setContent.mock.calls[0][0];
      expect(setContentCall).toContain('<!DOCTYPE html>');
      expect(setContentCall).toContain('Test User');
      expect(setContentCall).toContain('test@example.com');
      expect(setContentCall).toContain('Test Expense');
      expect(setContentCall).toContain('Food');
    });

    it('should handle missing user name', async () => {
      const reportDataWithoutName = {
        ...mockReportData,
        user: {
          fullName: '',
          email: 'test@example.com',
        },
      };

      await service.generateExpenseReport(reportDataWithoutName);

      const setContentCall = mockPage.setContent.mock.calls[0][0];
      expect(setContentCall).toContain('Usuário');
    });

    it('should format currency correctly', async () => {
      await service.generateExpenseReport(mockReportData);

      const setContentCall = mockPage.setContent.mock.calls[0][0];
      expect(setContentCall).toContain('100,00');
    });

    it('should format dates correctly', async () => {
      await service.generateExpenseReport(mockReportData);

      const setContentCall = mockPage.setContent.mock.calls[0][0];
      expect(setContentCall).toContain('15/01/2024');
    });
  });
});