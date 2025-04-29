
export interface FinancialConcept {
  id: string;
  title: string;
  description: string;
  details: string;
  recommendations: {
    title: string;
    url: string;
    platform: 'youtube' | 'article' | 'podcast' | 'book';
  }[];
  riskLevel?: 'Baixo' | 'Médio' | 'Alto';
  expectedReturn?: string;
  timeframe?: string;
  type: 'index' | 'fixedIncome' | 'retirement' | 'other';
}
