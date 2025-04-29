
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Expense } from "./ExpenseForm";
import { Income } from "./IncomeForm";
import { formatCurrency } from "@/lib/formatters";
import { Progress } from "@/components/ui/progress";

interface FinancialSummaryProps {
  expenses: Expense[];
  incomes: Income[];
}

const FinancialSummary = ({ expenses, incomes }: FinancialSummaryProps) => {
  const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
  const totalIncome = incomes.reduce((acc, income) => acc + income.amount, 0);
  const balance = totalIncome - totalExpenses;
  const spendingPercentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const savingPercentage = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const hasNoData = expenses.length === 0 && incomes.length === 0;

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20 backdrop-blur-sm border-none shadow-lg">
      <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Análise Financeira Pessoal
      </h3>
      
      {hasNoData ? (
        <div className="text-center py-8 space-y-3">
          <Wallet className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Comece sua jornada financeira
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Adicione suas receitas e despesas para visualizar seu panorama financeiro
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-5 bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border-none">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mr-3">
                  <ArrowUpRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Entradas</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
              </div>
              <div className="h-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((totalIncome / (totalIncome || 1)) * 100, 100)}%` }}
                />
              </div>
            </Card>
            
            <Card className="p-5 bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border-none">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mr-3">
                  <ArrowDownRight className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Saídas</p>
                  <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
              </div>
              <div className="h-1 bg-rose-100 dark:bg-rose-900/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((totalExpenses / (totalIncome || 1)) * 100, 100)}%` }}
                />
              </div>
            </Card>
            
            <Card className="p-5 bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border-none">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                  <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Saldo</p>
                  <p className={`text-lg font-bold ${
                    balance >= 0 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>
              <div className="h-1 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.max(Math.min(savingPercentage, 100), 0)}%` }}
                />
              </div>
            </Card>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/70 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Saúde Financeira</h4>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {spendingPercentage > 100 
                    ? 'Atenção: Gastos excedem receita' 
                    : spendingPercentage > 80 
                      ? 'Alerta: Alto nível de gastos'
                      : 'Gastos sob controle'}
                </span>
              </div>
              <Progress 
                value={spendingPercentage > 100 ? 100 : spendingPercentage} 
                className="h-2"
              />
              <div className="flex justify-between text-xs mt-2">
                <span className="text-gray-500">0%</span>
                <span className={`font-medium ${
                  spendingPercentage > 80 
                    ? 'text-rose-500' 
                    : 'text-gray-500'
                }`}>
                  100%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/70 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Economia
                </h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {savingPercentage > 0 ? savingPercentage.toFixed(1) + '%' : '0%'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  da sua renda está sendo economizada
                </p>
              </div>

              <div className="bg-white/70 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comprometimento
                </h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {spendingPercentage > 0 ? spendingPercentage.toFixed(1) + '%' : '0%'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  da sua renda está comprometida
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default FinancialSummary;
