
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/formatters";
import { Calculator, TrendingUp, Target, PlusCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { calculateGoalInvestment, GoalSimulationResult } from "./calculationUtils";
import InvestmentChart from "./InvestmentChart";

const GoalSimulation = () => {
  const [goalName, setGoalName] = useState<string>("");
  const [goalAmount, setGoalAmount] = useState<string>("10000");
  const [goalInitialAmount, setGoalInitialAmount] = useState<string>("1000");
  const [goalMonthlyContribution, setGoalMonthlyContribution] = useState<string>("200");
  const [goalInterestRate, setGoalInterestRate] = useState<string>("10");
  const [goalSimulationResult, setGoalSimulationResult] = useState<GoalSimulationResult | null>(null);

  const calculateGoalInvestmentHandler = () => {
    if (!goalName || !goalAmount || !goalInitialAmount || !goalMonthlyContribution || !goalInterestRate) {
      toast.error("Preencha todos os campos para simular");
      return;
    }

    const result = calculateGoalInvestment(
      parseFloat(goalAmount),
      parseFloat(goalInitialAmount),
      parseFloat(goalMonthlyContribution),
      parseFloat(goalInterestRate)
    );

    if (result.monthsToReach === 0) {
      toast.info("Valor inicial já alcança a meta!");
    } else if (result.monthsToReach >= 600) {
      toast.warning("Meta muito distante. Considere aumentar os aportes ou a taxa de juros.");
    } else {
      const years = Math.floor(result.monthsToReach / 12);
      const months = result.monthsToReach % 12;
      toast.success(`Você alcançará sua meta em ${result.monthsToReach} meses (${years} anos e ${months} meses)!`);
    }
    
    setGoalSimulationResult(result);
  };

  return (
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
              onClick={calculateGoalInvestmentHandler} 
              className="w-full bg-finance-teal hover:bg-finance-teal/90"
            >
              Calcular Tempo para Meta
            </Button>

            {goalSimulationResult && (
              <div className="space-y-4">
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
              </div>
            )}
          </div>
          
          <InvestmentChart 
            data={goalSimulationResult} 
            type="goal"
            goalAmount={parseFloat(goalAmount)}
            goalName={goalName}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalSimulation;