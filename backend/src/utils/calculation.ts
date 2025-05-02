import { CompoundingFrequency } from '../types';

/**
 * Calculate compound interest for investment simulation
 */
export const calculateCompoundInterest = (
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  years: number,
  compoundingFrequency: CompoundingFrequency
): number => {
  // Convert annual rate to decimal
  const rate = annualRate / 100;
  
  // Determine number of compounds per year
  let compoundsPerYear: number;
  switch (compoundingFrequency) {
    case CompoundingFrequency.DAILY:
      compoundsPerYear = 365;
      break;
    case CompoundingFrequency.MONTHLY:
      compoundsPerYear = 12;
      break;
    case CompoundingFrequency.QUARTERLY:
      compoundsPerYear = 4;
      break;
    case CompoundingFrequency.ANNUALLY:
      compoundsPerYear = 1;
      break;
    default:
      compoundsPerYear = 12; // default to monthly
  }
  
  // Calculate rate per period
  const ratePerPeriod = rate / compoundsPerYear;
  
  // Calculate total number of periods
  const totalPeriods = compoundsPerYear * years;
  
  // Calculate result for principal
  const principalComponent = principal * Math.pow(1 + ratePerPeriod, totalPeriods);
  
  // For monthly contributions, we need to calculate separately
  let contributionComponent = 0;
  if (monthlyContribution > 0) {
    // Adjust monthly contribution to match compounding frequency
    const contributionPerPeriod = monthlyContribution * (12 / compoundsPerYear);
    
    // Calculate compound interest for regular contributions
    contributionComponent = contributionPerPeriod * 
      ((Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod);
  }
  
  // Final amount is the sum of both components
  return principalComponent + contributionComponent;
};

/**
 * Calculate savings rate (income - expenses) / income
 */
export const calculateSavingsRate = (income: number, expenses: number): number => {
  if (income === 0) return 0;
  return ((income - expenses) / income) * 100;
};