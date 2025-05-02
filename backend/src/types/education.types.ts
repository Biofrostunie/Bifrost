export interface FinancialConceptInput {
  title: string;
  content: string;
  tags: string[];
}

export interface FinancialConceptOutput {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialConceptFilterParams {
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
}