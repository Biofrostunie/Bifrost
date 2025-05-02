import { PrismaClient } from '@prisma/client';
import { 
  FinancialConceptInput, 
  FinancialConceptOutput, 
  FinancialConceptFilterParams,
  NotFoundError 
} from '../types';
import { EducationRepository } from '../repositories/education.repository';

export class EducationService {
  private educationRepository: EducationRepository;

  constructor(prisma: PrismaClient) {
    this.educationRepository = new EducationRepository(prisma);
  }

  /**
   * Create a new financial concept
   */
  async createFinancialConcept(data: FinancialConceptInput): Promise<FinancialConceptOutput> {
    return this.educationRepository.createFinancialConcept(data);
  }

  /**
   * Get financial concepts with optional filtering
   */
  async getFinancialConcepts(params: FinancialConceptFilterParams = {}): Promise<FinancialConceptOutput[]> {
    return this.educationRepository.getFinancialConcepts(params);
  }

  /**
   * Get a financial concept by ID
   */
  async getFinancialConceptById(id: string): Promise<FinancialConceptOutput> {
    const concept = await this.educationRepository.getFinancialConceptById(id);
    
    if (!concept) {
      throw new NotFoundError('Financial concept not found');
    }
    
    return concept;
  }

  /**
   * Update a financial concept
   */
  async updateFinancialConcept(
    id: string, 
    data: Partial<FinancialConceptInput>
  ): Promise<FinancialConceptOutput> {
    // Verify concept exists
    await this.getFinancialConceptById(id);
    
    return this.educationRepository.updateFinancialConcept(id, data);
  }

  /**
   * Delete a financial concept
   */
  async deleteFinancialConcept(id: string): Promise<{ message: string }> {
    // Verify concept exists
    await this.getFinancialConceptById(id);
    
    await this.educationRepository.deleteFinancialConcept(id);
    
    return {
      message: 'Financial concept deleted successfully',
    };
  }

  /**
   * Get all available tags
   */
  async getAllTags(): Promise<string[]> {
    return this.educationRepository.getAllTags();
  }
}