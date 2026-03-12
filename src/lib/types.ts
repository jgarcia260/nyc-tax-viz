export interface BudgetCategory {
  name: string;
  amount: number;
  percentage: number;
  children?: BudgetCategory[];
}

export interface FiscalYearBudget {
  fiscalYear: string;
  totalBudget: number;
  categories: BudgetCategory[];
  source: string;
  lastUpdated: string;
}

export interface DollarBreakdown {
  fiscalYear: string;
  comesFrom: { description: string; cents: number }[];
  goesTo: { description: string; cents: number }[];
}
