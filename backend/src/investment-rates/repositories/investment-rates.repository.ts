import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { RateType, InvestmentRate, BCBResponse } from '../interfaces/investment-rate.interface';
import { SERIES_CONFIG } from '../config/series.config';

@Injectable()
export class InvestmentRatesRepository {
  private readonly logger = new Logger(InvestmentRatesRepository.name);
  private readonly bcbApiUrl = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs';

  /**
   * Busca o último valor da taxa informada no Banco Central
   * @param rateType Tipo da taxa (selic, ipca, poupanca, cdi)
   */
  async fetchLatestRate(rateType: RateType): Promise<InvestmentRate> {
    const seriesConfig = SERIES_CONFIG[rateType];
    if (!seriesConfig) {
      throw new Error(`Configuração não encontrada para taxa: ${rateType}`);
    }

    const url = this.buildApiUrl(seriesConfig);
    
    try {
      this.logger.debug(`Buscando taxa ${rateType} (código: ${seriesConfig.code})`);
      
      const response = await this.makeApiRequest(url);
      const data = response.data;

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(`Dados inválidos para ${rateType}: resposta vazia ou malformada`);
      }

      // Pega o último valor da série
      const latestData = data[data.length - 1] as BCBResponse;
      const { valor, data: date } = latestData;
      
      // Converte o valor para número (a API retorna como string)
      const numericValue = parseFloat(valor);
      
      if (isNaN(numericValue)) {
        throw new Error(`Valor inválido para ${rateType}: ${valor}`);
      }

      this.logger.debug(`Taxa ${rateType} obtida: ${numericValue} em ${date}`);
      
      return { 
        rateType, 
        value: numericValue, 
        date 
      };
    } catch (error: unknown) {
      this.logger.error(`Erro ao buscar taxa ${rateType}:`, error);
      this.handleApiError(error, rateType);
    }
  }

  /**
   * Busca múltiplas taxas simultaneamente
   * @param rateTypes Array de tipos de taxa para buscar
   */
  async fetchMultipleRates(rateTypes: RateType[]): Promise<InvestmentRate[]> {
    const promises = rateTypes.map(rateType => 
      this.fetchLatestRate(rateType).catch(error => {
        this.logger.warn(`Falha ao buscar taxa ${rateType}: ${error.message}`);
        return null;
      })
    );

    const results = await Promise.all(promises);
    return results.filter((result): result is InvestmentRate => result !== null);
  }

  /**
   * Constrói a URL da API baseada na configuração da série
   */
  private buildApiUrl(seriesConfig: any): string {
    let url = `${this.bcbApiUrl}.${seriesConfig.code}/dados?formato=json`;
    
    if (seriesConfig.requiresDateRange) {
      // Busca dados dos últimos 30 dias para séries diárias
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      
      const startDateStr = startDate.toLocaleDateString('pt-BR');
      const endDateStr = endDate.toLocaleDateString('pt-BR');
      
      url = `${this.bcbApiUrl}.${seriesConfig.code}/dados?formato=json&dataInicial=${startDateStr}&dataFinal=${endDateStr}`;
    }

    return url;
  }

  /**
   * Faz a requisição para a API do BCB
   */
  private async makeApiRequest(url: string) {
    return await axios.get(url, { 
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Bifrost-Backend/1.0'
      }
    });
  }

  /**
   * Trata erros da API de forma centralizada
   */
  private handleApiError(error: unknown, rateType: RateType): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 404) {
        throw new Error(`Taxa ${rateType} não encontrada no Banco Central`);
      } else if (status && status >= 500) {
        throw new Error(`Serviço do Banco Central indisponível para ${rateType}`);
      } else {
        throw new Error(`Erro HTTP ${status || 'unknown'} ao buscar ${rateType}: ${error.message}`);
      }
    } else if (error instanceof Error) {
      throw new Error(`Erro ao buscar ${rateType}: ${error.message}`);
    } else {
      throw new Error(`Erro desconhecido ao buscar taxa ${rateType}`);
    }
  }
}
