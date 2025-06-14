
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/formatters";
import { Calculator, TrendingUp, Calendar, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { calculateStandardInvestment, SimulationResult } from "./calculationUtils";
import InvestmentChart from "./InvestmentChart";

const StandardSimulation = () => {
  const [initialAmount, setInitialAmount] = useState<string>("1000");
  const [monthlyContribution, setMonthlyContribution] = useState<string>("200");
  const [interestRate, setInterestRate] = useState<string>("10");
  const [investmentPeriod, setInvestmentPeriod] = useState<string>("12");
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const calculateInvestment = () => {
    if (!initialAmount || !monthlyContribution || !interestRate || !investmentPeriod) {
      toast.error("Preencha todos os campos para simular");
      return;
    }

    const result = calculateStandardInvestment(
      parseFloat(initialAmount),
      parseFloat(monthlyContribution),
      parseFloat(interestRate),
      parseInt(investmentPeriod)
    );
    
    setSimulationResult(result);
    toast.success("Simulação realizada com sucesso!");
  };

  return (
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

            {simulationResult && (
              <div className="space-y-4">
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
              </div>
            )}
          </div>
          
          <InvestmentChart 
            data={simulationResult} 
            type="standard"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StandardSimulation;