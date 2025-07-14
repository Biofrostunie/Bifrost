import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { FinancialConceptsService } from './financial-concepts.service';
import { FinancialConceptsRepository } from '../repositories/financial-concepts.repository';

describe('FinancialConceptsService', () => {
  let service: FinancialConceptsService;
  let repository: jest.Mocked<FinancialConceptsRepository>;

  const mockConcept = {
    id: 'concept-id',
    title: 'Compound Interest',
    description: 'Interest calculated on the initial principal and accumulated interest',
    category: 'Investments',
    difficultyLevel: 'beginner',
    tags: ['investment', 'compound', 'interest'],
    createdAt: new Date(),
    interactions: [],
    _count: {
      interactions: 5,
    },
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      findByCategory: jest.fn(),
      findByDifficultyLevel: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getPopularConcepts: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialConceptsService,
        {
          provide: FinancialConceptsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<FinancialConceptsService>(FinancialConceptsService);
    repository = module.get(FinancialConceptsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConcepts', () => {
    it('should return all concepts', async () => {
      const concepts = [mockConcept];
      repository.findMany.mockResolvedValue(concepts);

      const result = await service.getConcepts({});

      expect(repository.findMany).toHaveBeenCalledWith({});
      expect(result).toEqual(concepts);
    });

    it('should return concepts filtered by category', async () => {
      const query = { category: 'Investments' };
      const concepts = [mockConcept];
      repository.findMany.mockResolvedValue(concepts);

      const result = await service.getConcepts(query);

      expect(repository.findMany).toHaveBeenCalledWith(query);
      expect(result).toEqual(concepts);
    });

    it('should return concepts filtered by difficulty level', async () => {
      const query = { difficultyLevel: 'beginner' as const };
      const concepts = [mockConcept];
      repository.findMany.mockResolvedValue(concepts);

      const result = await service.getConcepts(query);

      expect(repository.findMany).toHaveBeenCalledWith(query);
      expect(result).toEqual(concepts);
    });

    it('should return empty array when no concepts found', async () => {
      repository.findMany.mockResolvedValue([]);

      const result = await service.getConcepts({});

      expect(result).toEqual([]);
    });
  });

  describe('getConceptById', () => {
    it('should return concept by id', async () => {
      repository.findById.mockResolvedValue(mockConcept);

      const result = await service.getConceptById('concept-id');

      expect(repository.findById).toHaveBeenCalledWith('concept-id');
      expect(result).toEqual(mockConcept);
    });

    it('should throw NotFoundException when concept not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getConceptById('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createConcept', () => {
    it('should create a new concept', async () => {
      const createConceptDto = {
        title: 'Diversification',
        description: 'Risk management strategy',
        category: 'Risk Management',
        difficultyLevel: 'intermediate' as const,
        tags: ['risk', 'portfolio'],
      };

      repository.create.mockResolvedValue(mockConcept);

      const result = await service.createConcept(createConceptDto);

      expect(repository.create).toHaveBeenCalledWith(createConceptDto);
      expect(result).toEqual(mockConcept);
    });

    it('should create concept with minimal data', async () => {
      const createConceptDto = {
        title: 'Basic Concept',
        description: 'Simple description',
        category: 'General',
      };

      const minimalConcept = {
        ...mockConcept,
        title: 'Basic Concept',
        description: 'Simple description',
        category: 'General',
        difficultyLevel: null,
        tags: [],
      };

      repository.create.mockResolvedValue(minimalConcept);

      const result = await service.createConcept(createConceptDto);

      expect(result).toEqual(minimalConcept);
    });
  });

  describe('updateConcept', () => {
    it('should update concept', async () => {
      const updateConceptDto = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const updatedConcept = {
        ...mockConcept,
        title: 'Updated Title',
        description: 'Updated description',
      };

      repository.findById.mockResolvedValue(mockConcept);
      repository.update.mockResolvedValue(updatedConcept);

      const result = await service.updateConcept('concept-id', updateConceptDto);

      expect(repository.findById).toHaveBeenCalledWith('concept-id');
      expect(repository.update).toHaveBeenCalledWith('concept-id', updateConceptDto);
      expect(result).toEqual(updatedConcept);
    });

    it('should throw NotFoundException when concept not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateConcept('nonexistent-id', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteConcept', () => {
    it('should delete concept', async () => {
      repository.findById.mockResolvedValue(mockConcept);
      repository.delete.mockResolvedValue(mockConcept);

      const result = await service.deleteConcept('concept-id');

      expect(repository.findById).toHaveBeenCalledWith('concept-id');
      expect(repository.delete).toHaveBeenCalledWith('concept-id');
      expect(result).toEqual(mockConcept);
    });

    it('should throw NotFoundException when concept not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteConcept('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getConceptsByCategory', () => {
    it('should return concepts by category', async () => {
      const concepts = [mockConcept];
      repository.findByCategory.mockResolvedValue(concepts);

      const result = await service.getConceptsByCategory('Investments');

      expect(repository.findByCategory).toHaveBeenCalledWith('Investments');
      expect(result).toEqual(concepts);
    });

    it('should return empty array for non-existent category', async () => {
      repository.findByCategory.mockResolvedValue([]);

      const result = await service.getConceptsByCategory('NonExistent');

      expect(result).toEqual([]);
    });
  });

  describe('getConceptsByDifficultyLevel', () => {
    it('should return concepts by difficulty level', async () => {
      const concepts = [mockConcept];
      repository.findByDifficultyLevel.mockResolvedValue(concepts);

      const result = await service.getConceptsByDifficultyLevel('beginner');

      expect(repository.findByDifficultyLevel).toHaveBeenCalledWith('beginner');
      expect(result).toEqual(concepts);
    });

    it('should return empty array for difficulty level with no concepts', async () => {
      repository.findByDifficultyLevel.mockResolvedValue([]);

      const result = await service.getConceptsByDifficultyLevel('advanced');

      expect(result).toEqual([]);
    });
  });

  describe('getPopularConcepts', () => {
    it('should return popular concepts with default limit', async () => {
      const popularConcepts = [mockConcept];
      repository.getPopularConcepts.mockResolvedValue(popularConcepts);

      const result = await service.getPopularConcepts();

      expect(repository.getPopularConcepts).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(popularConcepts);
    });

    it('should return popular concepts with custom limit', async () => {
      const popularConcepts = [mockConcept];
      repository.getPopularConcepts.mockResolvedValue(popularConcepts);

      const result = await service.getPopularConcepts(5);

      expect(repository.getPopularConcepts).toHaveBeenCalledWith(5);
      expect(result).toEqual(popularConcepts);
    });

    it('should return empty array when no popular concepts', async () => {
      repository.getPopularConcepts.mockResolvedValue([]);

      const result = await service.getPopularConcepts();

      expect(result).toEqual([]);
    });
  });
});