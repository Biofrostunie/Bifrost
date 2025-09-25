import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { FinancialConceptsService } from '../services/financial-concepts.service';
import { publicProcedure, router } from '../../trpc/trpc.service';

@Injectable()
export class FinancialConceptsTrpcRouter {
  constructor(private readonly conceptsService: FinancialConceptsService) {}

  createRouter() {
    return router({
      getConcepts: publicProcedure
        .input(
          z.object({
            category: z.string().optional(),
            difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
          }),
        )
        .query(async ({ input }) => {
          return this.conceptsService.getConcepts(input);
        }),

      getConceptById: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ input }) => {
          return this.conceptsService.getConceptById(input.id);
        }),

      getConceptsByCategory: publicProcedure
        .input(z.object({ category: z.string() }))
        .query(async ({ input }) => {
          return this.conceptsService.getConceptsByCategory(input.category);
        }),

      getConceptsByDifficultyLevel: publicProcedure
        .input(z.object({ 
          difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']) 
        }))
        .query(async ({ input }) => {
          return this.conceptsService.getConceptsByDifficultyLevel(input.difficultyLevel);
        }),

      getPopularConcepts: publicProcedure
        .input(z.object({ limit: z.number().min(1).max(50).optional() }))
        .query(async ({ input }) => {
          return this.conceptsService.getPopularConcepts(input.limit);
        }),
    });
  }
}