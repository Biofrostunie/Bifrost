import { Injectable, Logger } from '@nestjs/common';
import { InvestmentRatesRepository } from '../repositories/investment-rates.repository';
import { RedisService } from '../../redis/redis.service';
import { RateType, InvestmentRate, InvestmentRatesResponse } from '../interfaces/investment-rate.interface';
import { SERIES_CONFIG } from '../config/series.config';

@Injectable()
export class InvestmentRatesService {
  private readonly logger = new Logger(InvestmentRatesService.name);
  private readonly cacheKeyPrefix = 'investment_rates:';
  private readonly cacheTTL = 3600; // 1 hora em segundos

  constructor(
    private readonly repository: InvestmentRatesRepository,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Retorna todas as taxas de investimento disponíveis
   */
  async getAllRates(): Promise<InvestmentRatesResponse> {
    const allRateTypes = Object.keys(SERIES_CONFIG) as RateType[];
    this.logger.debug(`Buscando todas as taxas: ${allRateTypes.join(', ')}`);

    // Tenta buscar do cache primeiro
    const cachedRates = await this.getCachedRates(allRateTypes);
    if (cachedRates.length === allRateTypes.length) {
      this.logger.debug('Retornando taxas do cache');
      return this.buildResponse(cachedRates);
    }

    // Busca as taxas do Banco Central
    const freshRates = await this.repository.fetchMultipleRates(allRateTypes);
    
    // Salva no cache
    await this.cacheRates(freshRates);

    this.logger.debug(`Retornando ${freshRates.length} taxas atualizadas`);
    return this.buildResponse(freshRates);
  }

  /**
   * Busca taxas do cache
   */
  private async getCachedRates(rateTypes: RateType[]): Promise<InvestmentRate[]> {
    const cachedRates: InvestmentRate[] = [];
    const redisClient = this.redisService.getClient();

    for (const rateType of rateTypes) {
      try {
        const cached = await redisClient.get(`${this.cacheKeyPrefix}${rateType}`);
        if (cached) {
          const rateData = JSON.parse(cached) as InvestmentRate;
          cachedRates.push(rateData);
        }
      } catch (error) {
        this.logger.warn(`Erro ao buscar cache para ${rateType}:`, error);
      }
    }

    return cachedRates;
  }

  /**
   * Salva taxas no cache
   */
  private async cacheRates(rates: InvestmentRate[]): Promise<void> {
    const redisClient = this.redisService.getClient();

    for (const rate of rates) {
      try {
        const cacheKey = `${this.cacheKeyPrefix}${rate.rateType}`;
        await redisClient.setex(cacheKey, this.cacheTTL, JSON.stringify(rate));
        this.logger.debug(`Taxa ${rate.rateType} salva no cache`);
      } catch (error) {
        this.logger.warn(`Erro ao salvar cache para ${rate.rateType}:`, error);
      }
    }
  }

  /**
   * Constrói a resposta padronizada
   */
  private buildResponse(rates: InvestmentRate[]): InvestmentRatesResponse {
    return {
      success: true,
      data: rates
    };
  }
}
