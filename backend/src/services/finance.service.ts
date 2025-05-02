import { PrismaClient } from '@prisma/client';
import {
  IncomeInput,
  IncomeOutput,
  IncomeCategoryInput,
  IncomeCategoryOutput,
  ExpenseInput,
  ExpenseOutput,
  ExpenseCategoryInput,
  ExpenseCategoryOutput,
  InvestmentSimulationInput,
  InvestmentSimulationOutput,
  FinancialOverview,
  NotFoundError,
  ForbiddenError,
} from '../types';
import { FinanceRepository } from '../repositories/finance.repository';
import { calculateCompoundInterest } from '../utils/calculation';

export class FinanceService {
  private financeRepository: FinanceRepository;

  constructor(prisma: PrismaClient) {
    this.financeRepository = new FinanceRepository(prisma);
  }

  // Income Category Methods
  async createIncomeCategory(data: IncomeCategoryInput): Promise<IncomeCategoryOutput> {
    return this.financeRepository.createIncomeCategory(data);
  }

  async getIncomeCategories(): Promise<IncomeCategoryOutput[]> {
    return this.financeRepository.getIncomeCategories();
  }

  async getIncomeCategoryById(id: string): Promise<IncomeCategoryOutput> {
    const category = await this.financeRepository.getIncomeCategoryById(id);
    
    if (!category) {
      throw new NotFoundError('Income category not found');
    }
    
    return category;
  }

  async updateIncomeCategory(id: string, data: IncomeCategoryInput): Promise<IncomeCategoryOutput> {
    await this.getIncomeCategoryById(id);
    return this.financeRepository.updateIncomeCategory(id, data);
  }

  async deleteIncomeCategory(id: string): Promise<{ message: string }> {
    await this.getIncomeCategoryById(id);
    await this.financeRepository.deleteIncomeCategory(id);
    
    return {
      message: 'Income category deleted successfully',
    };
  }

  // Income Methods
  async createIncome(userId: string, data: IncomeInput): Promise<IncomeOutput> {
    // Verify category exists
    await this.getIncomeCategoryById(data.categoryId);
    
    return this.financeRepository.createIncome(userId, data);
  }

  async getUserIncomes(userId: string): Promise<IncomeOutput[]> {
    return this.financeRepository.getUserIncomes(userId);
  }

  async getIncomeById(id: string, userId: string): Promise<IncomeOutput> {
    const income = await this.financeRepository.getIncomeById(id, userId);
    
    if (!income) {
      throw new NotFoundError('Income not found');
    }
    
    if (income.userId !== userId) {
      throw new ForbiddenError('Not authorized to access this income');
    }
    
    return income;
  }

  async updateIncome(id: string, userId: string, data: Partial<IncomeInput>): Promise<IncomeOutput> {
    // Verify income exists and belongs to user
    await this.getIncomeById(id, userId);
    
    // If category is being updated, verify it exists
    if (data.categoryId) {
      await this.getIncomeCategoryById(data.categoryId);
    }
    
    return this.financeRepository.updateIncome(id, userId, data);
  }

  async deleteIncome(id: string, userId: string): Promise<{ message: string }> {
    // Verify income exists and belongs to user
    await this.getIncomeById(id, userId);
    
    await this.financeRepository.deleteIncome(id, userId);
    
    return {
      message: 'Income deleted successfully',
    };
  }

  // Expense Category Methods
  async createExpenseCategory(data: ExpenseCategoryInput): Promise<ExpenseCategoryOutput> {
    return this.financeRepository.createExpenseCategory(data);
  }

  async getExpenseCategories(): Promise<ExpenseCategoryOutput[]> {
    return this.financeRepository.getExpenseCategories();
  }

  async getExpenseCategoryById(id: string): Promise<ExpenseCategoryOutput> {
    const category = await this.financeRepository.getExpenseCategoryById(id);
    
    if (!category) {
      throw new NotFoundError('Expense category not found');
    }
    
    return category;
  }

  async updateExpenseCategory(id: string, data: ExpenseCategoryInput): Promise<ExpenseCategoryOutput> {
    await this.getExpenseCategoryById(id);
    return this.financeRepository.updateExpenseCategory(id, data);
  }

  async deleteExpenseCategory(id: string): Promise<{ message: string }> {
    await this.getExpenseCategoryById(id);
    await this.financeRepository.deleteExpenseCategory(id);
    
    return {
      message: 'Expense category deleted successfully',
    };
  }

  // Expense Methods
  async createExpense(userId: string, data: ExpenseInput): Promise<ExpenseOutput> {
    // Verify category exists
    await this.getExpenseCategoryById(data.categoryId);
    
    return this.financeRepository.createExpense(userId, data);
  }

  async getUserExpenses(userId: string): Promise<ExpenseOutput[]> {
    return this.financeRepository.getUserExpenses(userId);
  }

  async getExpenseById(id: string, userId: string): Promise<ExpenseOutput> {
    const expense = await this.financeRepository.getExpenseById(id, userId);
    
    if (!expense) {
      throw new NotFoundError('Expense not found');
    }
    
    if (expense.userId !== userId) {
      throw new ForbiddenError('Not authorized to access this expense');
    }
    
    return expense;
  }

  async updateExpense(id: string, userId: string, data: Partial<ExpenseInput>): Promise<ExpenseOutput> {
    // Verify expense exists and belongs to user
    await this.getExpenseById(id, userId);
    
    // If category is being updated, verify it exists
    if (data.categoryId) {
      await this.getExpenseCategoryById(data.categoryId);
    }
    
    return this.financeRepository.updateExpense(id, userId, data);
  }

  async deleteExpense(id: string, userId: string): Promise<{ message: string }> {
    // Verify expense exists and belongs to user
    await this.getExpenseById(id, userId);
    
    await this.financeRepository.deleteExpense(id, userId);
    
    return {
      message: 'Expense deleted successfully',
    };
  }

  // Investment Simulation Methods
  async createInvestmentSimulation(
    userId: string, 
    data: InvestmentSimulationInput
  ): Promise<InvestmentSimulationOutput> {
    // Calculate the final amount
    const finalAmount = calculateCompoundInterest(
      data.initialAmount,
      data.monthlyContribution,
      data.interestRate,
      data.timeframeYears,
      data.compoundingFrequency
    );
    
    return this.financeRepository.createInvestmentSimulation(userId, data, finalAmount);
  }

  async getUserInvestmentSimulations(userId: string): Promise<InvestmentSimulationOutput[]> {
    return this.financeRepository.getUserInvestmentSimulations(userId);
  }

  async getInvestmentSimulationById(id: string, userId: string): Promise<InvestmentSimulationOutput> {
    const simulation = await this.financeRepository.getInvestmentSimulationById(id, userId);
    
    if (!simulation) {
      throw new NotFoundError('Investment simulation not found');
    }
    
    if (simulation.userId !== userId) {
      throw new ForbiddenError('Not authorized to access this simulation');
    }
    
    return simulation;
  }

  async deleteInvestmentSimulation(id: string, userId: string): Promise<{ message: string }> {
    // Verify simulation exists and belongs to user
    await this.getInvestmentSimulationById(id, userId);
    
    await this.financeRepository.deleteInvestmentSimulation(id, userId);
    
    return {
      message: 'Investment simulation deleted successfully',
    };
  }

  // Dashboard Methods
  async getFinancialOverview(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<FinancialOverview> {
    return this.financeRepository.getFinancialOverview(userId, startDate, endDate);
  }
}