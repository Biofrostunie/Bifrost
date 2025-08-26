export type RateType = 'selic' | 'ipca' | 'poupanca' | 'cdi';

export interface InvestmentRate {
  rateType: RateType;
  value: number;
  date: string;
}

export interface InvestmentRatesResponse {
  success: boolean;
  data: InvestmentRate[];
}

export interface BCBResponse {
  data: string;
  valor: string;
}

export interface SeriesConfig {
  code: number;
  name: string;
  description: string;
  requiresDateRange: boolean;
} 