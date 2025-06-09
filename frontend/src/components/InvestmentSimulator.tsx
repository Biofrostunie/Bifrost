import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/formatters";
import { Calculator, TrendingUp, Calendar, PlusCircle, Target, Clock } from "lucide-react";
import { toast } from "sonner";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SimulationResult {
  finalAmount: number;
  totalInvested: number;
  totalInterest: number;
  monthlyBreakdown: { month: number; value: number; interest: number; invested: number }[];
}

interface GoalSimulationResult {
  monthsToReach: number;
  finalAmount: number;
  totalInvested: number;
  totalInterest: number;
  monthlyBreakdown: { month: number; value: number; interest: number; invested: number }[];
}

const InvestmentSimulator = () => {
  // Standard investment simulation state
  const [initialAmount, setInitialAmount] = useState<string>("1000");
  const [monthlyContribution, setMonthlyContribution] = useState<string>("200");
  const [interestRate, setInterestRate] = useState<string>("10");
  const [investmentPeriod, setInvestmentPeriod] = useState<string>("12");
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  
  // Goal-based investment simulation state
  const [goalName, setGoalName] = useState<string>("");
  const [goalAmount, setGoalAmount] = useState<string>("10000");
  const [goalInitialAmount, setGoalInitialAmount] = useState<string>("1000");
  const [goalMonthlyContribution, setGoalMonthlyContribution] = useState<string>("200");
  const [goalInterestRate, setGoalInterestRate] = useState<string>("10");
  const [goalSimulationResult, setGoalSimulationResult] = useState<GoalSimulationResult | null>(null);

  const calculateInvestment = () => {
    if (!initialAmount || !monthlyContribution || !interestRate || !investmentPeriod) {
      toast.error("Preencha todos os campos para simular");
      return;
    }

    const initial = parseFloat(initialAmount);
    const monthly = parseFloat(monthlyContribution);
    const rate = parseFloat(interestRate) / 100 / 12; // Convert annual rate to monthly
    const period = parseInt(investmentPeriod);
    
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
    
    setSimulationResult({
      finalAmount: currentAmount,
      totalInvested,
      totalInterest: currentAmount - totalInvested,
      monthlyBreakdown
    });
    
    toast.success("Simulação realizada com sucesso!");
  };

  const calculateGoalInvestment = () => {
    if (!goalName || !goalAmount || !goalInitialAmount || !goalMonthlyContribution || !goalInterestRate) {
      toast.error("Preencha todos os campos para simular");
      return;
    }

    const target = parseFloat(goalAmount);
    const initial = parseFloat(goalInitialAmount);
    const monthly = parseFloat(goalMonthlyContribution);
    const rate = parseFloat(goalInterestRate) / 100 / 12; // Convert annual rate to monthly
    
    if (initial >= target) {
      toast.info("Valor inicial já alcança a meta!");
      setGoalSimulationResult({
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
      });
      return;
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
    
    if (month >= MAX_MONTHS) {
      toast.warning("Meta muito distante. Considere aumentar os aportes ou a taxa de juros.");
    } else {
      toast.success(`Você alcançará sua meta em ${month} meses (${Math.floor(month/12)} anos e ${month%12} meses)!`);
    }
    
    setGoalSimulationResult({
      monthsToReach: month,
      finalAmount: currentAmount,
      totalInvested,
      totalInterest: currentAmount - totalInvested,
      monthlyBreakdown
    });
  };

  // Function to format chart data for months - ensuring it returns a string
  const formatXAxis = (value: number): string => {
    if (!simulationResult?.monthlyBreakdown.length && !goalSimulationResult?.monthlyBreakdown.length) {
      return value.toString();
    }
    
    const dataLength = simulationResult?.monthlyBreakdown.length || goalSimulationResult?.monthlyBreakdown.length || 0;
    
    // Show fewer tick values when we have many months
    const tickThreshold = 30;
    if (dataLength > tickThreshold) {
      // Show only a selection of months for better readability
      if (value % Math.ceil(dataLength / 6) !== 0) {
        return '';
      }
    }
    
    return `${value}m`;
  };

  // Format Y axis to show values in currency - ensuring it returns a string
  const formatYAxis = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } 
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  // Custom tooltip component that doesn't block the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-600 rounded shadow-lg text-xs max-w-[200px]">
          <p className="font-medium">{`Mês: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name === 'value' ? 'Valor Total' : 
                 entry.name === 'invested' ? 'Total Investido' : 
                 entry.name === 'goal' ? 'Meta' : entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="standard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="standard" className="text-sm sm:text-base">
            <Calculator className="h-4 w-4 mr-2" /> Simulação Padrão
          </TabsTrigger>
          <TabsTrigger value="goal" className="text-sm sm:text-base">
            <Target className="h-4 w-4 mr-2" /> Simulação com Meta
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="standard">
          <Card className="bg-gradient-to-br from-finance-light to-[#F2FCE2] dark:from-gray-800 dark:to-gray-900">
            <CardHeader>
              <CardTitle className="text-finance-dark dark:text-white flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-finance-teal" />
                Simulador de Investimentos Recorrentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="initial-amount" className="flex items-center gap-1 text-finance-dark dark:text-white font-medium">
                      <Calculator className="h-4 w-4" /> Valor Inicial (R$)
                    </Label>
                    <Input
                      id="initial-amount"
                      type="number"
                      value={initialAmount}
                      onChange={(e) => setInitialAmount(e.target.value)}
                      placeholder="1000"
                      min="0"
                      step="100"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="monthly-contribution" className="flex items-center gap-1 text-finance-dark dark:text-white font-medium">
                      <PlusCircle className="h-4 w-4" /> Contribuição Mensal (R$)
                    </Label>
                    <Input
                      id="monthly-contribution"
                      type="number"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(e.target.value)}
                      placeholder="200"
                      min="0"
                      step="50"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="interest-rate" className="flex items-center gap-1 text-finance-dark dark:text-white font-medium">
                      <TrendingUp className="h-4 w-4" /> Taxa de Juros ao Ano (%)
                    </Label>
                    <div className="space-y-2">
                      <Input
                        id="interest-rate"
                        type="number"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        placeholder="10"
                        min="0"
                        max="100"
                        step="0.1"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <Slider
                        value={[parseFloat(interestRate) || 0]}
                        min={0}
                        max={20}
                        step={0.1}
                        onValueChange={(value) => setInterestRate(value[0].toString())}
                        className="py-2"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="investment-period" className="flex items-center gap-1 text-finance-dark dark:text-white font-medium">
                      <Calendar className="h-4 w-4" /> Período de Investimento (meses)
                    </Label>
                    <div className="space-y-2">
                      <Input
                        id="investment-period"
                        type="number"
                        value={investmentPeriod}
                        onChange={(e) => setInvestmentPeriod(e.target.value)}
                        placeholder="12"
                        min="1"
                        max="480"
                        step="1"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <Slider
                        value={[parseInt(investmentPeriod) || 12]}
                        min={1}
                        max={60}
                        step={1}
                        onValueChange={(value) => setInvestmentPeriod(value[0].toString())}
                        className="py-2"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={calculateInvestment} 
                    className="w-full bg-finance-teal hover:bg-finance-teal/90"
                  >
                    Simular Investimento
                  </Button>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 shadow-sm min-h-[400px] overflow-hidden">
                  {simulationResult ? (
                    <div className="space-y-4 h-full">
                      <h3 className="text-xl font-semibold text-finance-dark dark:text-white">Resultado da Simulação</h3>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-[#F2FCE2] dark:bg-gray-700 p-3 rounded-md">
                          <p className="text-sm text-finance-gray dark:text-gray-300">Valor Final</p>
                          <p className="text-2xl font-bold text-finance-teal">
                            {formatCurrency(simulationResult.finalAmount)}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-finance-light dark:bg-gray-700 p-3 rounded-md">
                            <p className="text-sm text-finance-gray dark:text-gray-300">Total Investido</p>
                            <p className="text-lg font-semibold dark:text-white">
                              {formatCurrency(simulationResult.totalInvested)}
                            </p>
                          </div>
                          
                          <div className="bg-finance-light dark:bg-gray-700 p-3 rounded-md">
                            <p className="text-sm text-finance-gray dark:text-gray-300">Juros Acumulados</p>
                            <p className="text-lg font-semibold text-finance-blue">
                              {formatCurrency(simulationResult.totalInterest)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-h-0">
                        <h4 className="text-sm font-medium text-finance-gray dark:text-gray-300 mb-2">
                          Evolução do Investimento
                        </h4>
                        <div className="w-full h-48 overflow-visible relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={simulationResult.monthlyBreakdown}
                              margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="month" 
                                tickFormatter={formatXAxis}
                                fontSize={12}
                              />
                              <YAxis 
                                tickFormatter={formatYAxis} 
                                fontSize={12}
                              />
                              <Tooltip
                                content={<CustomTooltip />}
                                position={{ x: 0, y: 0 }}
                                wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }}
                              />
                              <Legend 
                                verticalAlign="top" 
                                height={36}
                                iconType="line"
                                wrapperStyle={{ paddingBottom: '10px' }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="invested" 
                                stackId="1"
                                stroke="#2196F3" 
                                fill="#2196F3" 
                                name="Total Investido"
                              />
                              <Area 
                                type="monotone" 
                                dataKey="value" 
                                stackId="2"
                                stroke="#4CAF50" 
                                fill="#4CAF50" 
                                name="Valor Total"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-finance-gray dark:text-gray-300 p-4 text-center">
                      <div>
                        <TrendingUp size={40} className="mx-auto text-finance-teal/40 mb-2" />
                        <p>Preencha os dados ao lado e clique em "Simular Investimento" para ver os resultados</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="goal">
          <Card className="bg-gradient-to-br from-finance-light to-[#F2FCE2] dark:from-gray-800 dark:to-gray-900">
            <CardHeader>
              <CardTitle className="text-finance-dark dark:text-white flex items-center gap-2">
                <Target className="h-6 w-6 text-finance-teal" />
                Simulador de Metas Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goal-name" className="flex items-center gap-1 text-finance-dark dark:text-white font-medium">
                      <Target className="h-4 w-4" /> Nome da Meta
                    </Label>
                    <Input
                      id="goal-name"
                      type="text"
                      value={goalName}
                      onChange={(e) => setGoalName(e.target.value)}
                      placeholder="Ex: Viagem, Casa, Carro..."
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                
                  <div>
                    <Label htmlFor="goal-amount" className="flex items-center gap-1 text-finance-dark dark:text-white font-medium">
                      <Target className="h-4 w-4" /> Valor da Meta (R$)
                    </Label>
                    <Input
                      id="goal-amount"
                      type="number"
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(e.target.value)}
                      placeholder="10000"
                      min="0"
                      step="1000"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="goal-initial-amount" className="flex items-center gap-1 text-finance-dark dark:text-white font-medium">
                      <Calculator className="h-4 w-4" /> Valor Inicial (R$)
                    </Label>
                    <Input
                      id="goal-initial-amount"
                      type="number"
                      value={goalInitialAmount}
                      onChange={(e) => setGoalInitialAmount(e.target.value)}
                      placeholder="1000"
                      min="0"
                      step="100"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="goal-monthly-contribution" className="flex items-center gap-1 text-finance-dark dark:text-white font-medium">
                      <PlusCircle className="h-4 w-4" /> Contribuição Mensal (R$)
                    </Label>
                    <Input
                      id="goal-monthly-contribution"
                      type="number"
                      value={goalMonthlyContribution}
                      onChange={(e) => setGoalMonthlyContribution(e.target.value)}
                      placeholder="200"
                      min="0"
                      step="50"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="goal-interest-rate" className="flex items-center gap-1 text-finance-dark dark:text-white font-medium">
                      <TrendingUp className="h-4 w-4" /> Taxa de Juros ao Ano (%)
                    </Label>
                    <div className="space-y-2">
                      <Input
                        id="goal-interest-rate"
                        type="number"
                        value={goalInterestRate}
                        onChange={(e) => setGoalInterestRate(e.target.value)}
                        placeholder="10"
                        min="0"
                        max="100"
                        step="0.1"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <Slider
                        value={[parseFloat(goalInterestRate) || 0]}
                        min={0}
                        max={20}
                        step={0.1}
                        onValueChange={(value) => setGoalInterestRate(value[0].toString())}
                        className="py-2"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={calculateGoalInvestment} 
                    className="w-full bg-finance-teal hover:bg-finance-teal/90"
                  >
                    Calcular Tempo para Meta
                  </Button>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 shadow-sm min-h-[400px] overflow-hidden">
                  {goalSimulationResult ? (
                    <div className="space-y-4 h-full">
                      <h3 className="text-xl font-semibold text-finance-dark dark:text-white">
                        Resultado para {goalName || "sua meta"}
                      </h3>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-[#F2FCE2] dark:bg-gray-700 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-finance-gray dark:text-gray-300">Tempo para alcançar</p>
                              <p className="text-xl font-bold text-finance-teal">
                                {Math.floor(goalSimulationResult.monthsToReach/12)} anos e {goalSimulationResult.monthsToReach%12} meses
                              </p>
                            </div>
                            <Clock className="h-8 w-8 text-finance-teal/40" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-finance-light dark:bg-gray-700 p-3 rounded-md">
                            <p className="text-sm text-finance-gray dark:text-gray-300">Total Investido</p>
                            <p className="text-sm font-semibold dark:text-white">
                              {formatCurrency(goalSimulationResult.totalInvested)}
                            </p>
                          </div>
                          
                          <div className="bg-finance-light dark:bg-gray-700 p-3 rounded-md">
                            <p className="text-sm text-finance-gray dark:text-gray-300">Juros Acumulados</p>
                            <p className="text-sm font-semibold text-finance-blue">
                              {formatCurrency(goalSimulationResult.totalInterest)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-finance-blue/10 dark:bg-finance-blue/20 p-3 rounded-md">
                          <p className="text-sm text-finance-gray dark:text-gray-300">Valor da Meta</p>
                          <p className="text-lg font-semibold text-finance-blue">
                            {formatCurrency(parseFloat(goalAmount))}
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                            <div 
                              className="bg-finance-blue h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min(100, (parseFloat(goalInitialAmount) / parseFloat(goalAmount)) * 100)}%` 
                              }}
                            />
                          </div>
                          <p className="text-xs text-finance-gray dark:text-gray-300 mt-1">
                            Você já tem {((parseFloat(goalInitialAmount) / parseFloat(goalAmount)) * 100).toFixed(1)}% da meta
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-h-0">
                        <h4 className="text-sm font-medium text-finance-gray dark:text-gray-300 mb-2">
                          Evolução até a Meta
                        </h4>
                        <div className="w-full h-48 overflow-visible relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={goalSimulationResult.monthlyBreakdown}
                              margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="month" 
                                tickFormatter={formatXAxis}
                                fontSize={12}
                              />
                              <YAxis 
                                tickFormatter={formatYAxis} 
                                fontSize={12}
                              />
                              <Tooltip
                                content={<CustomTooltip />}
                                position={{ x: 0, y: 0 }}
                                wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }}
                              />
                              <Legend 
                                verticalAlign="top" 
                                height={36}
                                iconType="line"
                                wrapperStyle={{ paddingBottom: '10px' }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="invested" 
                                stackId="1"
                                stroke="#2196F3" 
                                fill="#2196F3" 
                                name="Total Investido"
                              />
                              <Area 
                                type="monotone" 
                                dataKey="value" 
                                stackId="2"
                                stroke="#4CAF50" 
                                fill="#4CAF50" 
                                name="Valor Total"
                              />
                              <Area
                                type="monotone"
                                dataKey={() => parseFloat(goalAmount)}
                                name="Meta"
                                stroke="#F97316"
                                strokeDasharray="5 5"
                                fill="none"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-finance-gray dark:text-gray-300 p-4 text-center">
                      <div>
                        <Target size={40} className="mx-auto text-finance-teal/40 mb-2" />
                        <p>Preencha os dados da sua meta e clique em "Calcular Tempo para Meta" para ver os resultados</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestmentSimulator;