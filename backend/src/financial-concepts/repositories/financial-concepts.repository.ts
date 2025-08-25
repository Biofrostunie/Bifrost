import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConceptDto } from '../dto/create-concept.dto';
import { UpdateConceptDto } from '../dto/update-concept.dto';
import { GetConceptsQueryDto } from '../dto/get-concepts-query.dto';

@Injectable()
export class FinancialConceptsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateConceptDto) {
    return this.prisma.financialConcept.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.financialConcept.findUnique({
      where: { id },
      include: {
        interactions: {
          select: {
            interactionType: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
      },
    });
  }

  async findMany(query: GetConceptsQueryDto) {
    const { category, difficultyLevel } = query;
    
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (difficultyLevel) {
      where.difficultyLevel = difficultyLevel;
    }

    return this.prisma.financialConcept.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            interactions: true,
          },
        },
      },
    });
  }

  async findByCategory(category: string) {
    return this.prisma.financialConcept.findMany({
      where: { category },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByDifficultyLevel(difficultyLevel: string) {
    return this.prisma.financialConcept.findMany({
      where: { difficultyLevel },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateConceptDto) {
    return this.prisma.financialConcept.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.financialConcept.delete({
      where: { id },
    });
  }

  async getPopularConcepts(limit: number = 10) {
    return this.prisma.financialConcept.findMany({
      take: limit,
      orderBy: {
        interactions: {
          _count: 'desc',
        },
      },
      include: {
        _count: {
          select: {
            interactions: true,
          },
        },
      },
    });
  }
}