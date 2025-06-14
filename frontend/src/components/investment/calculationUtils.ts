
export interface SimulationResult {
    finalAmount: number;
    totalInvested: number;
    totalInterest: number;
    monthlyBreakdown: { month: number; value: number; interest: number; invested: number }[];
  }
  
  export interface GoalSimulationResult {
    monthsToReach: number;
    finalAmount: number;
    totalInvested: number;
    totalInterest: number;
    monthlyBreakdown: { month: number; value: number; interest: number; invested: number }[];
  }
  
  export const calculateStandardInvestment = (
    initialAmount: number,
    monthlyContribution: number,
    interestRate: number,
    investmentPeriod: number
  ): SimulationResult => {
    const initial = initialAmount;
    const monthly = monthlyContribution;
    const rate = interestRate / 100 / 12; // Convert annual rate to monthly
    const period = investmentPeriod;
    
    let currentAmount = initial;
    let totalInvested = initial;
    const monthlyBreakdown = [];
    
    for (let month = 1; month <= period; month++) {
      const interestEarned = currentAmount * rate;
      currentAmount += interestEarned + monthly;
      totalInvested += monthly;
      
      monthlyBreakdown.push({
        month,
        value: currentAmount,
        interest: interestEarned,
        invested: totalInvested
      });
    }
    
    return {
      finalAmount: currentAmount,
      totalInvested,
      totalInterest: currentAmount - totalInvested,
      monthlyBreakdown
    };
  };
  
  export const calculateGoalInvestment = (
    goalAmount: number,
    initialAmount: number,
    monthlyContribution: number,
    interestRate: number
  ): GoalSimulationResult => {
    const target = goalAmount;
    const initial = initialAmount;
    const monthly = monthlyContribution;
    const rate = interestRate / 100 / 12; // Convert annual rate to monthly
    
    if (initial >= target) {
      return {
        monthsToReach: 0,
        finalAmount: initial,
        totalInvested: initial,
        totalInterest: 0,
        monthlyBreakdown: [{
          month: 0,
          value: initial,
          interest: 0,
          invested: initial
        }]
      };
    }
    
    let currentAmount = initial;
    let totalInvested = initial;
    const monthlyBreakdown = [{
      month: 0,
      value: initial,
      interest: 0,
      invested: initial
    }];
    
    let month = 0;
    const MAX_MONTHS = 600; // 50 years as safety limit
    
    while (currentAmount < target && month < MAX_MONTHS) {
      month++;
      const interestEarned = currentAmount * rate;
      currentAmount += interestEarned + monthly;
      totalInvested += monthly;
      
      monthlyBreakdown.push({
        month,
        value: currentAmount,
        interest: interestEarned,
        invested: totalInvested
      });
    }
    
    return {
      monthsToReach: month,
      finalAmount: currentAmount,
      totalInvested,
      totalInterest: currentAmount - totalInvested,
      monthlyBreakdown
    };
  };