import { Injectable, NotFoundException, ForbiddenException, Logger, BadRequestException } from '@nestjs/common';
import { ExpensesRepository } from '../repositories/expenses.repository';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { GetExpensesQueryDto } from '../dto/get-expenses-query.dto';
import { PdfService, ExpenseReportData } from '../../common/services/pdf.service';
import { UsersService } from '../../users/services/users.service';
import { CacheService } from '../../redis/cache.service';
import { Cache } from '../../redis/decorators/cache.decorator';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(
    private readonly expensesRepository: ExpensesRepository,
    private readonly pdfService: PdfService,
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
  ) {}

  @Cache({ ttl: 300, prefix: 'expenses' }) // Cache for 5 minutes
  async getExpenses(userId: string, query: GetExpensesQueryDto) {
    this.logger.log(`Getting expenses for user: ${userId}`);
    return this.expensesRepository.findByUserId(userId, query);
  }

  async createExpense(userId: string, createExpenseDto: CreateExpenseDto) {
    this.logger.log(`Creating expense for user: ${userId}`);

    // Validate payment method ties
    if (createExpenseDto.paymentMethod === PaymentMethod.CREDIT_CARD && !createExpenseDto.creditCardId) {
      throw new BadRequestException('creditCardId is required when paymentMethod is CREDIT_CARD');
    }
    if (
      (createExpenseDto.paymentMethod === PaymentMethod.BANK_ACCOUNT) &&
      !createExpenseDto.bankAccountId
    ) {
      throw new BadRequestException('bankAccountId is required when paymentMethod is BANK_ACCOUNT');
    }
    
    const expense = await this.expensesRepository.create({
      ...createExpenseDto,
      userId,
    });

    // Invalidate cache for this user
    await this.invalidateUserExpenseCache(userId);

    return expense;
  }

  async getExpenseById(userId: string, expenseId: string) {
    const expense = await this.expensesRepository.findById(expenseId);

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (expense.userId !== userId) {
      throw new ForbiddenException('Access denied to this expense');
    }

    return expense;
  }

  async updateExpense(
    userId: string,
    expenseId: string,
    updateExpenseDto: UpdateExpenseDto,
  ) {
    const existing = await this.getExpenseById(userId, expenseId); // Validates ownership

    // Validate ties based on effective values
    const effectivePaymentMethod = updateExpenseDto.paymentMethod ?? existing.paymentMethod;
    const effectiveCreditCardId = updateExpenseDto.creditCardId ?? (existing as any).creditCardId;
    const effectiveBankAccountId = updateExpenseDto.bankAccountId ?? (existing as any).bankAccountId;

    if (effectivePaymentMethod === PaymentMethod.CREDIT_CARD && !effectiveCreditCardId) {
      throw new BadRequestException('creditCardId is required when paymentMethod is CREDIT_CARD');
    }
    if (
      (effectivePaymentMethod === PaymentMethod.BANK_ACCOUNT) &&
      !effectiveBankAccountId
    ) {
      throw new BadRequestException('bankAccountId is required when paymentMethod is BANK_ACCOUNT');
    }

    const updatedExpense = await this.expensesRepository.update(expenseId, updateExpenseDto);

    // Invalidate cache for this user
    await this.invalidateUserExpenseCache(userId);

    return updatedExpense;
  }

  async deleteExpense(userId: string, expenseId: string) {
    await this.getExpenseById(userId, expenseId); // Validates ownership

    const deletedExpense = await this.expensesRepository.delete(expenseId);

    // Invalidate cache for this user
    await this.invalidateUserExpenseCache(userId);

    return deletedExpense;
  }

  @Cache({ ttl: 600, prefix: 'expense_totals' }) // Cache for 10 minutes
  async getTotalExpensesByCategory(userId: string, startDate?: Date, endDate?: Date) {
    return this.expensesRepository.getTotalByCategory(userId, startDate, endDate);
  }

  async generateExpenseReportPdf(
    userId: string,
    query: GetExpensesQueryDto,
  ): Promise<Buffer> {
    const requestId = Math.random().toString(36).substring(7);
    this.logger.log(`[${requestId}] Starting PDF generation for user: ${userId}`);
    this.logger.log(`[${requestId}] Query parameters:`, query);

    try {
      // Check cache first with enhanced key
      const cacheKey = `pdf_report:${userId}:${JSON.stringify(query)}:${Date.now().toString().slice(0, -5)}`;
      const cachedPdf = await this.cacheService.get<string>(cacheKey);
      
      if (cachedPdf) {
        this.logger.log(`[${requestId}] PDF found in cache`);
        return Buffer.from(cachedPdf, 'base64');
      }

      // Validate user exists first
      const user = await this.usersService.findById(userId);
      if (!user) {
        this.logger.error(`[${requestId}] User not found: ${userId}`);
        throw new NotFoundException('User not found');
      }

      this.logger.log(`[${requestId}] User found: ${user.email} (${user.fullName || 'No name'})`);

      // Debug user expenses first
      await this.expensesRepository.debugUserExpenses(userId);

      // Get expenses with detailed logging
      this.logger.log(`[${requestId}] Fetching expenses with query:`, {
        userId,
        startDate: query.startDate,
        endDate: query.endDate,
        category: query.category,
        essential: query.essential,
      });

      const expenses = await this.expensesRepository.findByUserId(userId, query);
      this.logger.log(`[${requestId}] Found ${expenses.length} expenses for report generation`);

      // If no expenses found with filters, try without filters for debugging
      if (expenses.length === 0) {
        this.logger.warn(`[${requestId}] No expenses found with filters, checking without filters...`);
        const allExpenses = await this.expensesRepository.findByUserId(userId, {});
        this.logger.log(`[${requestId}] User has ${allExpenses.length} total expenses`);
        
        if (allExpenses.length > 0) {
          this.logger.log(`[${requestId}] Sample expenses:`, allExpenses.slice(0, 3).map((e: any) => ({
            description: e.description,
            amount: e.amount.toString(),
            category: e.category,
            date: e.date.toISOString(),
            essential: e.essential,
          })));
        }
      }

      // Process expenses and calculate totals
      let totalAmount = 0;
      const validExpenses = [];

      for (const expense of expenses) {
        try {
          const amount = this.convertToNumber(expense.amount);
          totalAmount += amount;
          validExpenses.push({
            ...expense,
            amount,
          });
        } catch (error) {
          this.logger.warn(`[${requestId}] Error processing expense ${expense.id}:`, error);
          // Skip invalid expenses but continue processing
        }
      }

      this.logger.log(`[${requestId}] Processed ${validExpenses.length} valid expenses, total: R$ ${totalAmount.toFixed(2)}`);

      // Calculate categories with colors
      const categoryTotals = new Map<string, number>();
      validExpenses.forEach((expense) => {
        const current = categoryTotals.get(expense.category) || 0;
        categoryTotals.set(expense.category, current + expense.amount);
      });

      // Predefined colors for categories
      const categoryColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
        '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
      ];

      const categories = Array.from(categoryTotals.entries()).map(([name, total], index) => ({
        name,
        total,
        percentage: totalAmount > 0 ? Math.round((total / totalAmount) * 100) : 0,
        color: categoryColors[index % categoryColors.length],
      }));

      this.logger.log(`[${requestId}] Generated ${categories.length} category summaries with colors:`, categories);

      // Prepare report data
      const reportData: ExpenseReportData = {
        expenses: validExpenses as any,
        totalAmount,
        period: {
          startDate: query.startDate || 'Início',
          endDate: query.endDate || 'Fim',
        },
        user: {
          fullName: user.fullName || 'Usuário',
          email: user.email,
        },
        categories,
      };

      this.logger.log(`[${requestId}] Report data prepared with enhanced features:`, {
        expenseCount: reportData.expenses.length,
        totalAmount: reportData.totalAmount,
        categoryCount: reportData.categories.length,
        userEmail: reportData.user.email,
        userFullName: reportData.user.fullName,
        period: reportData.period,
        hasChartData: reportData.categories.length > 0,
      });

      // Generate PDF with enhanced error handling
      try {
        const pdfBuffer = await this.pdfService.generateExpenseReport(reportData);
        
        if (!pdfBuffer || pdfBuffer.length === 0) {
          throw new Error('PDF generation returned empty buffer');
        }

        // Cache the PDF for 30 minutes with shorter TTL for dynamic content
        await this.cacheService.set(cacheKey, pdfBuffer.toString('base64'), { ttl: 1800 });

        this.logger.log(`[${requestId}] Enhanced PDF with charts generated successfully, size: ${pdfBuffer.length} bytes`);
        return pdfBuffer;
        
      } catch (pdfError) {
        this.logger.error(`[${requestId}] PDF generation failed:`, {
          error: pdfError instanceof Error ? pdfError.message : 'Unknown PDF error',
          stack: pdfError instanceof Error ? pdfError.stack : undefined,
        });
        
        // Re-throw with more specific error message
        throw new Error(`PDF generation failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
      }

    } catch (error) {
      this.logger.error(`[${requestId}] Error in generateExpenseReportPdf:`, {
        userId,
        query,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Re-throw with context
      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to generate expense report: ${errorMessage}`);
    }
  }

  private async invalidateUserExpenseCache(userId: string): Promise<void> {
    try {
      const cacheKeys = [`expenses:${userId}`, `expense_totals:${userId}`];
      await Promise.all(cacheKeys.map((key) => this.cacheService.del(key)));
      this.logger.log(`Invalidated expense cache for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate cache for user ${userId}:`, error);
    }
  }

  private convertToNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value);
    if (value && typeof value === 'object' && 'toNumber' in value) return value.toNumber();
    throw new Error(`Cannot convert value to number: ${value}`);
  }
}