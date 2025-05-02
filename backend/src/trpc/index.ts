import { router, publicProcedure, protectedProcedure } from '../config/trpc';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { FinanceService } from '../services/finance.service';
import { EducationService } from '../services/education.service';
import { CompoundingFrequency } from '../types/financial.types';

const prisma = new PrismaClient();
const authService = new AuthService(prisma);
const userService = new UserService(prisma);
const financeService = new FinanceService(prisma);
const educationService = new EducationService(prisma);

// Input validation schemas
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const incomeSchema = z.object({
  amount: z.number().positive(),
  description: z.string().nullable(),
  date: z.date(),
  categoryId: z.string().uuid(),
});

const expenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().nullable(),
  date: z.date(),
  categoryId: z.string().uuid(),
});

const investmentSimulationSchema = z.object({
  initialAmount: z.number().nonnegative(),
  monthlyContribution: z.number().nonnegative(),
  interestRate: z.number().nonnegative(),
  timeframeYears: z.number().int().positive(),
  compoundingFrequency: z.nativeEnum(CompoundingFrequency),
  name: z.string().nullable(),
});

// Define tRPC router
export const appRouter = router({
  // Auth routes
  register: publicProcedure
    .input(userSchema)
    .mutation(async ({ input }) => {
      return authService.register(input);
    }),

  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      return authService.login(input);
    }),

  // User routes
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      return userService.getProfile(ctx.user.userId);
    }),

  // Finance routes - Income
  createIncome: protectedProcedure
    .input(incomeSchema)
    .mutation(async ({ ctx, input }) => {
      return financeService.createIncome(ctx.user.userId, input);
    }),

  getUserIncomes: protectedProcedure
    .query(async ({ ctx }) => {
      return financeService.getUserIncomes(ctx.user.userId);
    }),

  // Finance routes - Expense
  createExpense: protectedProcedure
    .input(expenseSchema)
    .mutation(async ({ ctx, input }) => {
      return financeService.createExpense(ctx.user.userId, input);
    }),

  getUserExpenses: protectedProcedure
    .query(async ({ ctx }) => {
      return financeService.getUserExpenses(ctx.user.userId);
    }),

  // Finance routes - Investment Simulation
  createInvestmentSimulation: protectedProcedure
    .input(investmentSimulationSchema)
    .mutation(async ({ ctx, input }) => {
      return financeService.createInvestmentSimulation(ctx.user.userId, input);
    }),

  // Education routes
  getFinancialConcepts: publicProcedure
    .input(z.object({
      tags: z.array(z.string()).optional(),
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      return educationService.getFinancialConcepts(input);
    }),

  getFinancialConceptById: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      return educationService.getFinancialConceptById(input);
    }),
});

export type AppRouter = typeof appRouter;