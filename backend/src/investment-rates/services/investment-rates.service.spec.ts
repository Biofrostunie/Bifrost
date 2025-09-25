import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { InvestmentRatesService } from './investment-rates.service';
import { InvestmentRatesRepository } from '../repositories/investment-rates.repository';
import { RedisService } from '../../redis/redis.service';
import { RateType, InvestmentRate, InvestmentRatesResponse } from '../interfaces/investment-rate.interface';
import { SERIES_CONFIG } from '../config/series.config';

describe('InvestmentRatesService', () => {
  let service: InvestmentRatesService;
  let repository: jest.Mocked<InvestmentRatesRepository>;
  let redisService: jest.Mocked<RedisService>;
  let mockRedisClient: any;

  const mockRates: InvestmentRate[] = [
    {
      rateType: 'selic',
      value: 13.75,
      date: '2024-01-15'
    },
    {
      rateType: 'ipca',
      value: 0.56,
      date: '2024-01-15'
    },
    {
      rateType: 'poupanca',
      value: 0.5,
      date: '2024-01-15'
    },
    {
      rateType: 'cdi',
      value: 13.65,
      date: '2024-01-15'
    }
  ];

  beforeEach(async () => {
    mockRedisClient = {
      get: jest.fn(),
      setex: jest.fn(),
    };

    const mockRepository = {
      fetchMultipleRates: jest.fn(),
    };

    const mockRedisService = {
      getClient: jest.fn().mockReturnValue(mockRedisClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestmentRatesService,
        {
          provide: InvestmentRatesRepository,
          useValue: mockRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<InvestmentRatesService>(InvestmentRatesService);
    repository = module.get(InvestmentRatesRepository);
    redisService = module.get(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllRates', () => {
    it('should return all rates with success response', async () => {
      const allRateTypes = Object.keys(SERIES_CONFIG) as RateType[];
      
      // Mock cache miss
      mockRedisClient.get.mockResolvedValue(null);
      
      // Mock repository response
      repository.fetchMultipleRates.mockResolvedValue(mockRates);
      
      // Mock cache set
      mockRedisClient.setex.mockResolvedValue('OK');

      const result = await service.getAllRates();

      expect(result).toEqual({
        success: true,
        data: mockRates
      });
      
      expect(repository.fetchMultipleRates).toHaveBeenCalledWith(allRateTypes);
      expect(mockRedisClient.setex).toHaveBeenCalledTimes(4);
    });

    it('should return cached rates when available', async () => {
      const allRateTypes = Object.keys(SERIES_CONFIG) as RateType[];
      
      // Mock cache hit for all rates
      mockRedisClient.get
        .mockResolvedValueOnce(JSON.stringify(mockRates[0]))
        .mockResolvedValueOnce(JSON.stringify(mockRates[1]))
        .mockResolvedValueOnce(JSON.stringify(mockRates[2]))
        .mockResolvedValueOnce(JSON.stringify(mockRates[3]));

      const result = await service.getAllRates();

      expect(result).toEqual({
        success: true,
        data: mockRates
      });
      
      expect(repository.fetchMultipleRates).not.toHaveBeenCalled();
      expect(mockRedisClient.setex).not.toHaveBeenCalled();
    });

    it('should handle partial cache hits', async () => {
      const allRateTypes = Object.keys(SERIES_CONFIG) as RateType[];
      
      // Mock cache hit for some rates, miss for others
      mockRedisClient.get
        .mockResolvedValueOnce(JSON.stringify(mockRates[0])) // selic - hit
        .mockResolvedValueOnce(null) // ipca - miss
        .mockResolvedValueOnce(JSON.stringify(mockRates[2])) // poupanca - hit
        .mockResolvedValueOnce(null); // cdi - miss

      // Mock repository response for missing rates
      const missingRates = [mockRates[1], mockRates[3]];
      repository.fetchMultipleRates.mockResolvedValue(missingRates);
      
      // Mock cache set for new rates
      mockRedisClient.setex.mockResolvedValue('OK');

      const result = await service.getAllRates();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data).toEqual(missingRates);
      
      expect(repository.fetchMultipleRates).toHaveBeenCalledWith(['selic', 'ipca', 'poupanca', 'cdi']);
      expect(mockRedisClient.setex).toHaveBeenCalledTimes(2);
    });

    it('should handle empty rates array', async () => {
      const allRateTypes = Object.keys(SERIES_CONFIG) as RateType[];
      
      // Mock cache miss
      mockRedisClient.get.mockResolvedValue(null);
      
      // Mock repository response with empty array
      repository.fetchMultipleRates.mockResolvedValue([]);

      const result = await service.getAllRates();

      expect(result).toEqual({
        success: true,
        data: []
      });
      
      expect(repository.fetchMultipleRates).toHaveBeenCalledWith(allRateTypes);
    });

    it('should handle cache errors gracefully', async () => {
      const allRateTypes = Object.keys(SERIES_CONFIG) as RateType[];
      
      // Mock cache error
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));
      
      // Mock repository response
      repository.fetchMultipleRates.mockResolvedValue(mockRates);
      
      // Mock cache set
      mockRedisClient.setex.mockResolvedValue('OK');

      const result = await service.getAllRates();

      expect(result).toEqual({
        success: true,
        data: mockRates
      });
      
      expect(repository.fetchMultipleRates).toHaveBeenCalledWith(allRateTypes);
    });

    it('should handle cache set errors gracefully', async () => {
      const allRateTypes = Object.keys(SERIES_CONFIG) as RateType[];
      
      // Mock cache miss
      mockRedisClient.get.mockResolvedValue(null);
      
      // Mock repository response
      repository.fetchMultipleRates.mockResolvedValue(mockRates);
      
      // Mock cache set error
      mockRedisClient.setex.mockRejectedValue(new Error('Redis set error'));

      const result = await service.getAllRates();

      expect(result).toEqual({
        success: true,
        data: mockRates
      });
      
      expect(repository.fetchMultipleRates).toHaveBeenCalledWith(allRateTypes);
    });
  });

  describe('private methods', () => {
    it('should build response correctly', async () => {
      repository.fetchMultipleRates.mockResolvedValue(mockRates);
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.setex.mockResolvedValue('OK');

      const result = await service.getAllRates();
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should use correct cache key prefix and TTL', async () => {
      repository.fetchMultipleRates.mockResolvedValue([mockRates[0]]);
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.setex.mockResolvedValue('OK');

      await service.getAllRates();

      // Verify cache key format and TTL
      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        'investment_rates:selic',
        3600, // 1 hour TTL
        expect.any(String)
      );
    });
  });

  describe('logging', () => {
    it('should log debug messages for rate fetching', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'debug');
      
      repository.fetchMultipleRates.mockResolvedValue(mockRates);
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.setex.mockResolvedValue('OK');

      await service.getAllRates();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Buscando todas as taxas:')
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Retornando 4 taxas atualizadas')
      );
    });

    it('should log debug message when returning cached rates', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'debug');
      
      mockRedisClient.get
        .mockResolvedValueOnce(JSON.stringify(mockRates[0]))
        .mockResolvedValueOnce(JSON.stringify(mockRates[1]))
        .mockResolvedValueOnce(JSON.stringify(mockRates[2]))
        .mockResolvedValueOnce(JSON.stringify(mockRates[3]));

      await service.getAllRates();

      expect(loggerSpy).toHaveBeenCalledWith('Retornando taxas do cache');
    });

    it('should log cache operations', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'debug');
      
      repository.fetchMultipleRates.mockResolvedValue([mockRates[0]]);
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.setex.mockResolvedValue('OK');

      await service.getAllRates();

      expect(loggerSpy).toHaveBeenCalledWith('Taxa selic salva no cache');
    });

    it('should log warnings for cache errors', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');
      
      repository.fetchMultipleRates.mockResolvedValue(mockRates);
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));
      mockRedisClient.setex.mockResolvedValue('OK');

      await service.getAllRates();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao buscar cache para selic:'),
        expect.any(Error)
      );
    });
  });
});
