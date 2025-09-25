import { SeriesConfig } from '../interfaces/investment-rate.interface';

export const SERIES_CONFIG: Record<string, SeriesConfig> = {
  selic: {
    code: 4189,
    name: 'SELIC Meta',
    description: 'Taxa SELIC Meta definida pelo Copom',
    requiresDateRange: false
  },
  ipca: {
    code: 433,
    name: 'IPCA',
    description: 'IPCA - Variação mensal',
    requiresDateRange: false
  },
  poupanca: {
    code: 196,
    name: 'Poupança',
    description: 'Taxa da poupança diária',
    requiresDateRange: true
  },
  cdi: {
    code: 12,
    name: 'CDI',
    description: 'CDI Diário',
    requiresDateRange: true
  }
}; 