import { Injectable, NotFoundException } from '@nestjs/common';
import { FinancialConceptsRepository } from '../repositories/financial-concepts.repository';
import { CreateConceptDto } from '../dto/create-concept.dto';
import { UpdateConceptDto } from '../dto/update-concept.dto';
import { GetConceptsQueryDto } from '../dto/get-concepts-query.dto';

@Injectable()
export class FinancialConceptsService {
  constructor(private readonly conceptsRepository: FinancialConceptsRepository) {}

  async getConcepts(query: GetConceptsQueryDto) {
    return this.conceptsRepository.findMany(query);
  }

  async getConceptById(id: string) {
    const concept = await this.conceptsRepository.findById(id);

    if (!concept) {
      throw new NotFoundException('Financial concept not found');
    }

    return concept;
  }

  async createConcept(createConceptDto: CreateConceptDto) {
    return this.conceptsRepository.create(createConceptDto);
  }

  async updateConcept(id: string, updateConceptDto: UpdateConceptDto) {
    const concept = await this.getConceptById(id); // Ensures concept exists

    return this.conceptsRepository.update(id, updateConceptDto);
  }

  async deleteConcept(id: string) {
    const concept = await this.getConceptById(id); // Ensures concept exists

    return this.conceptsRepository.delete(id);
  }

  async getConceptsByCategory(category: string) {
    return this.conceptsRepository.findByCategory(category);
  }

  async getConceptsByDifficultyLevel(difficultyLevel: string) {
    return this.conceptsRepository.findByDifficultyLevel(difficultyLevel);
  }

  async getPopularConcepts(limit?: number) {
    return this.conceptsRepository.getPopularConcepts(limit);
  }
}