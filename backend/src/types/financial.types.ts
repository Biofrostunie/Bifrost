// Income types
export interface IncomeInput {
  amount: number;
  description: string | null;
  date: Date;
  categoryId: string;
}

export interface IncomeOutput {
  id: string;
  amount: number;
  description: string | null;
  date: Date;
  userId: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IncomeCategoryInput {
  name: string;
  description: string | null;
}

export interface IncomeCategoryOutput {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Expense types
export interface ExpenseInput {
  amount: number;
  description: string | null;
  date: Date;
  categoryId: string;
}

export interface ExpenseOutput {
  id: string;
  amount: number;
  description: string | null;
  date: Date;
  userId: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseCategoryInput {
  name: string;
  description: string | null;
}

export interface ExpenseCategoryOutput {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Investment simulation types
export enum CompoundingFrequency {
  DAILY = 'daily',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually'
}

export interface InvestmentSimulationInput {
  initialAmount: number;
  monthlyContribution: number;
  interestRate: number;
  timeframeYears: number;
  compoundingFrequency: CompoundingFrequency;
  name: string | null;
}

export interface InvestmentSimulationOutput {
  id: string;
  userId: string;
  initialAmount: number;
  monthlyContribution: number;
  interestRate: number;
  timeframeYears: number;
  compoundingFrequency: CompoundingFrequency;
  name: string | null;
  finalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard types
export interface BalanceSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number | null;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface FinancialOverview {
  balance: BalanceSummary;
  incomeByCategory: CategoryBreakdown[];
  expensesByCategory: CategoryBreakdown[];
  recentTransactions: (IncomeOutput | ExpenseOutput)[];
}

// Database string type
export type DatabaseString = string | null;