import { PrismaClient } from '@prisma/client';
import { FinancialConceptInput, FinancialConceptOutput, FinancialConceptFilterParams } from '../types';

export class EducationRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new financial concept
   */
  async createFinancialConcept(data: FinancialConceptInput): Promise<FinancialConceptOutput> {
    return this.prisma.financialConcept.create({
      data,
    });
  }

  /**
   * Get all financial concepts with optional filtering
   */
  async getFinancialConcepts(params: FinancialConceptFilterParams = {}): Promise<FinancialConceptOutput[]> {
    const { tags, search, page = 1, limit = 10 } = params;
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    // Filter by tags if provided
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }
    
    // Search in title and content if search term is provided
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          content: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      ];
    }
    
    return this.prisma.financialConcept.findMany({
      where,
      skip,
      take: limit,
      orderBy: { title: 'asc' },
    });
  }

  /**
   * Get a single financial concept by ID
   */
  async getFinancialConceptById(id: string): Promise<FinancialConceptOutput | null> {
    return this.prisma.financialConcept.findUnique({
      where: { id },
    });
  }

  /**
   * Update a financial concept
   */
  async updateFinancialConcept(id: string, data: Partial<FinancialConceptInput>): Promise<FinancialConceptOutput> {
    return this.prisma.financialConcept.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a financial concept
   */
  async deleteFinancialConcept(id: string): Promise<void> {
    await this.prisma.financialConcept.delete({
      where: { id },
    });
  }

  /**
   * Get all unique tags
   */
  async getAllTags(): Promise<string[]> {
    const concepts = await this.prisma.financialConcept.findMany({
      select: {
        tags: true,
      },
    });
    
    // Extract and flatten all tags
    const allTags = concepts.flatMap(concept => concept.tags);
    
    // Remove duplicates and sort
    return [...new Set(allTags)].sort();
  }
}