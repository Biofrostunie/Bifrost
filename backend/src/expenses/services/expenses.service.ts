import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ExpensesRepository } from '../repositories/expenses.repository';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { GetExpensesQueryDto } from '../dto/get-expenses-query.dto';
import { PdfService, ExpenseReportData } from '../../common/services/pdf.service';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(
    private readonly expensesRepository: ExpensesRepository,
    private readonly pdfService: PdfService,
    private readonly usersService: UsersService,
  ) {}

  async getExpenses(userId: string, query: GetExpensesQueryDto) {
    this.logger.log(`Getting expenses for user: ${userId}`);
    return this.expensesRepository.findByUserId(userId, query);
  }

  async createExpense(userId: string, createExpenseDto: CreateExpenseDto) {
    this.logger.log(`Creating expense for user: ${userId}`);
    return this.expensesRepository.create({
      ...createExpenseDto,
      userId,
    });
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
    await this.getExpenseById(userId, expenseId); // Validates ownership

    return this.expensesRepository.update(expenseId, updateExpenseDto);
  }

  async deleteExpense(userId: string, expenseId: string) {
    await this.getExpenseById(userId, expenseId); // Validates ownership

    return this.expensesRepository.delete(expenseId);
  }

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
          this.logger.log(`[${requestId}] Sample expenses:`, allExpenses.slice(0, 3).map(e => ({
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

      // Calculate categories
      const categoryTotals = new Map<string, number>();
      validExpenses.forEach((expense) => {
        const current = categoryTotals.get(expense.category) || 0;
        categoryTotals.set(expense.category, current + expense.amount);
      });

      const categories = Array.from(categoryTotals.entries()).map(([name, total]) => ({
        name,
        total,
        percentage: totalAmount > 0 ? Math.round((total / totalAmount) * 100) : 0,
      }));

      this.logger.log(`[${requestId}] Generated ${categories.length} category summaries:`, categories);

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

      this.logger.log(`[${requestId}] Report data prepared:`, {
        expenseCount: reportData.expenses.length,
        totalAmount: reportData.totalAmount,
        categoryCount: reportData.categories.length,
        userEmail: reportData.user.email,
        userFullName: reportData.user.fullName,
        period: reportData.period,
      });

      // Generate PDF with enhanced error handling
      try {
        const pdfBuffer = await this.pdfService.generateExpenseReport(reportData);
        
        if (!pdfBuffer || pdfBuffer.length === 0) {
          throw new Error('PDF generation returned empty buffer');
        }

        this.logger.log(`[${requestId}] PDF generated successfully, size: ${pdfBuffer.length} bytes`);
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

  private convertToNumber(value: any): number {
    if (typeof value === 'number') {
      return value;
    }
    
    if (typeof value === 'object' && value !== null && typeof value.toNumber === 'function') {
      return value.toNumber();
    }
    
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      throw new Error(`Invalid amount value: ${value}`);
    }
    
    return parsed;
  }
}