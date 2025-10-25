export type RateType = 'selic' | 'ipca' | 'poupanca' | 'cdi';

export interface InvestmentRate {
  rateType: RateType;
  value: number;
  date: string;
  // Variação em relação ao ponto anterior (dia/registro anterior)
  change: number;
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