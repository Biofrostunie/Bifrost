import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { router, publicProcedure } from './trpc.service';
import { FinancialConceptsTrpcRouter } from '../financial-concepts/trpc/financial-concepts.router';
import { UsersService } from '../users/services/users.service';
import { ExpensesService } from '../expenses/services/expenses.service';

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly conceptsRouter: FinancialConceptsTrpcRouter,
    private readonly usersService: UsersService,
    private readonly expensesService: ExpensesService,
  ) {}

  appRouter = router({
    health: publicProcedure.query(() => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Bifröst Education Platform API is running',
        version: '1.0.0',
      };
    }),

    getUser: publicProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ input }) => {
        const user = await this.usersService.findById(input.id);
        if (!user) {
          throw new Error('User not found');
        }
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }),

    getUserProfile: publicProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ input }) => {
        const userProfile = await this.usersService.getProfile(input.id);
        return userProfile;
      }),

    generateExpenseReportPdf: publicProcedure
      .input(
        z.object({
          userId: z.string().uuid(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          category: z.string().optional(),
          essential: z.boolean().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { userId, ...query } = input;
        const pdfBuffer = await this.expensesService.generateExpenseReportPdf(userId, query);
        
        // Convert buffer to base64 for tRPC transmission
        return {
          pdf: pdfBuffer.toString('base64'),
          filename: `expense-report-${new Date().toISOString().split('T')[0]}.pdf`,
          contentType: 'application/pdf',
        };
      }),

    financialConcepts: this.conceptsRouter.createRouter(),
  });
}

export type AppRouter = TrpcRouter['appRouter'];