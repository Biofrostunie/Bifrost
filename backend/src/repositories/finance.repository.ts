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
  BalanceSummary,
  CategoryBreakdown,
  FinancialOverview,
  CompoundingFrequency,
} from '../types';
import { calculateSavingsRate } from '../utils/calculation';

export class FinanceRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Income Category Methods
  async createIncomeCategory(data: IncomeCategoryInput): Promise<IncomeCategoryOutput> {
    return this.prisma.incomeCategory.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async getIncomeCategories(): Promise<IncomeCategoryOutput[]> {
    return this.prisma.incomeCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getIncomeCategoryById(id: string): Promise<IncomeCategoryOutput | null> {
    return this.prisma.incomeCategory.findUnique({
      where: { id },
    });
  }

  async updateIncomeCategory(id: string, data: IncomeCategoryInput): Promise<IncomeCategoryOutput> {
    return this.prisma.incomeCategory.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async deleteIncomeCategory(id: string): Promise<void> {
    await this.prisma.incomeCategory.delete({
      where: { id },
    });
  }

  // Income Methods
  async createIncome(userId: string, data: IncomeInput): Promise<IncomeOutput> {
    return this.prisma.income.create({
      data: {
        amount: data.amount,
        description: data.description,
        date: data.date,
        userId,
        categoryId: data.categoryId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getUserIncomes(userId: string): Promise<IncomeOutput[]> {
    return this.prisma.income.findMany({
      where: { userId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getIncomeById(id: string, userId: string): Promise<IncomeOutput | null> {
    return this.prisma.income.findFirst({
      where: { 
        id,
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateIncome(id: string, userId: string, data: Partial<IncomeInput>): Promise<IncomeOutput> {
    return this.prisma.income.update({
      where: { id },
      data: {
        amount: data.amount,
        description: data.description,
        date: data.date,
        categoryId: data.categoryId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteIncome(id: string, userId: string): Promise<void> {
    await this.prisma.income.delete({
      where: { id },
    });
  }

  // Expense Category Methods
  async createExpenseCategory(data: ExpenseCategoryInput): Promise<ExpenseCategoryOutput> {
    return this.prisma.expenseCategory.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async getExpenseCategories(): Promise<ExpenseCategoryOutput[]> {
    return this.prisma.expenseCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getExpenseCategoryById(id: string): Promise<ExpenseCategoryOutput | null> {
    return this.prisma.expenseCategory.findUnique({
      where: { id },
    });
  }

  async updateExpenseCategory(id: string, data: ExpenseCategoryInput): Promise<ExpenseCategoryOutput> {
    return this.prisma.expenseCategory.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async deleteExpenseCategory(id: string): Promise<void> {
    await this.prisma.expenseCategory.delete({
      where: { id },
    });
  }

  // Expense Methods
  async createExpense(userId: string, data: ExpenseInput): Promise<ExpenseOutput> {
    return this.prisma.expense.create({
      data: {
        amount: data.amount,
        description: data.description,
        date: data.date,
        userId,
        categoryId: data.categoryId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getUserExpenses(userId: string): Promise<ExpenseOutput[]> {
    return this.prisma.expense.findMany({
      where: { userId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getExpenseById(id: string, userId: string): Promise<ExpenseOutput | null> {
    return this.prisma.expense.findFirst({
      where: { 
        id,
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateExpense(id: string, userId: string, data: Partial<ExpenseInput>): Promise<ExpenseOutput> {
    return this.prisma.expense.update({
      where: { id },
      data: {
        amount: data.amount,
        description: data.description,
        date: data.date,
        categoryId: data.categoryId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteExpense(id: string, userId: string): Promise<void> {
    await this.prisma.expense.delete({
      where: { id },
    });
  }

  // Investment Simulation Methods
  async createInvestmentSimulation(
    userId: string, 
    data: InvestmentSimulationInput, 
    finalAmount: number
  ): Promise<InvestmentSimulationOutput> {
    const simulation = await this.prisma.investmentSimulation.create({
      data: {
        userId,
        initialAmount: data.initialAmount,
        monthlyContribution: data.monthlyContribution,
        interestRate: data.interestRate,
        timeframeYears: data.timeframeYears,
        compoundingFrequency: data.compoundingFrequency,
        name: data.name,
        finalAmount,
      },
    });

    return {
      ...simulation,
      compoundingFrequency: simulation.compoundingFrequency as CompoundingFrequency,
    };
  }

  async getUserInvestmentSimulations(userId: string): Promise<InvestmentSimulationOutput[]> {
    const simulations = await this.prisma.investmentSimulation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return simulations.map(sim => ({
      ...sim,
      compoundingFrequency: sim.compoundingFrequency as CompoundingFrequency,
    }));
  }

  async getInvestmentSimulationById(id: string, userId: string): Promise<InvestmentSimulationOutput | null> {
    const simulation = await this.prisma.investmentSimulation.findFirst({
      where: { 
        id,
        userId,
      },
    });

    if (!simulation) return null;

    return {
      ...simulation,
      compoundingFrequency: simulation.compoundingFrequency as CompoundingFrequency,
    };
  }

  async deleteInvestmentSimulation(id: string, userId: string): Promise<void> {
    await this.prisma.investmentSimulation.delete({
      where: { id },
    });
  }

  // Financial Overview Methods
  async getFinancialOverview(userId: string, startDate: Date, endDate: Date): Promise<FinancialOverview> {
    // Get total income for the period
    const incomeResult = await this.prisma.income.aggregate({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });
    const totalIncome = incomeResult._sum.amount || 0;

    // Get total expenses for the period
    const expensesResult = await this.prisma.expense.aggregate({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });
    const totalExpenses = expensesResult._sum.amount || 0;

    // Calculate balance summary
    const balance: BalanceSummary = {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      savingsRate: totalIncome > 0 ? calculateSavingsRate(totalIncome, totalExpenses) : null,
    };

    // Get income by category
    const incomeByCategory = await this.prisma.$queryRaw<CategoryBreakdown[]>`
      SELECT 
        ic.id as "categoryId", 
        ic.name as "categoryName", 
        COALESCE(SUM(i.amount), 0) as amount,
        CASE 
          WHEN SUM(total.total_amount) > 0 
          THEN (COALESCE(SUM(i.amount), 0) / SUM(total.total_amount)) * 100 
          ELSE 0 
        END as percentage
      FROM "incomes" i
      JOIN "income_categories" ic ON i."categoryId" = ic.id
      CROSS JOIN (
        SELECT COALESCE(SUM(amount), 0) as total_amount 
        FROM "incomes" 
        WHERE "userId" = ${userId}
        AND date >= ${startDate}
        AND date <= ${endDate}
      ) total
      WHERE i."userId" = ${userId}
      AND i.date >= ${startDate}
      AND i.date <= ${endDate}
      GROUP BY ic.id, ic.name
      ORDER BY amount DESC
    `;

    // Get expenses by category
    const expensesByCategory = await this.prisma.$queryRaw<CategoryBreakdown[]>`
      SELECT 
        ec.id as "categoryId", 
        ec.name as "categoryName", 
        COALESCE(SUM(e.amount), 0) as amount,
        CASE 
          WHEN SUM(total.total_amount) > 0 
          THEN (COALESCE(SUM(e.amount), 0) / SUM(total.total_amount)) * 100 
          ELSE 0 
        END as percentage
      FROM "expenses" e
      JOIN "expense_categories" ec ON e."categoryId" = ec.id
      CROSS JOIN (
        SELECT COALESCE(SUM(amount), 0) as total_amount 
        FROM "expenses" 
        WHERE "userId" = ${userId}
        AND date >= ${startDate}
        AND date <= ${endDate}
      ) total
      WHERE e."userId" = ${userId}
      AND e.date >= ${startDate}
      AND e.date <= ${endDate}
      GROUP BY ec.id, ec.name
      ORDER BY amount DESC
    `;

    // Get recent transactions
    const recentIncomes = await this.prisma.income.findMany({
      where: {
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 5,
    });

    const recentExpenses = await this.prisma.expense.findMany({
      where: {
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 5,
    });

    // Combine and sort by date
    const recentTransactions = [...recentIncomes, ...recentExpenses]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);

    return {
      balance,
      incomeByCategory,
      expensesByCategory,
      recentTransactions,
    };
  }
}