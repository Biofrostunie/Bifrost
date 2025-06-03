import { useState } from "react";
import { PlusCircle, Trash2, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

export interface FinancialEntry {
  id: string;
  description: string;
  amount: number;
}

interface UserFinancialInputProps {
  onUpdateIncomes: (incomes: FinancialEntry[]) => void;
  onUpdateExpenses: (expenses: FinancialEntry[]) => void;
}

const UserFinancialInput = ({ onUpdateIncomes, onUpdateExpenses }: UserFinancialInputProps) => {
  const [incomes, setIncomes] = useState<FinancialEntry[]>([
    { id: "1", description: "Salário", amount: 0 }
  ]);
  const [expenses, setExpenses] = useState<FinancialEntry[]>([
    { id: "1", description: "Aluguel", amount: 0 }
  ]);
  
  const [newIncomeDescription, setNewIncomeDescription] = useState("");
  const [newIncomeAmount, setNewIncomeAmount] = useState("");
  const [newExpenseDescription, setNewExpenseDescription] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");

  const handleAddIncome = () => {
    if (!newIncomeDescription || !newIncomeAmount || isNaN(Number(newIncomeAmount))) return;
    
    const newIncome = {
      id: Date.now().toString(),
      description: newIncomeDescription,
      amount: Number(newIncomeAmount)
    };
    
    const updatedIncomes = [...incomes, newIncome];
    setIncomes(updatedIncomes);
    onUpdateIncomes(updatedIncomes);
    setNewIncomeDescription("");
    setNewIncomeAmount("");
  };

  const handleAddExpense = () => {
    if (!newExpenseDescription || !newExpenseAmount || isNaN(Number(newExpenseAmount))) return;
    
    const newExpense = {
      id: Date.now().toString(),
      description: newExpenseDescription,
      amount: Number(newExpenseAmount)
    };
    
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    onUpdateExpenses(updatedExpenses);
    setNewExpenseDescription("");
    setNewExpenseAmount("");
  };

  const handleRemoveIncome = (id: string) => {
    const updatedIncomes = incomes.filter(income => income.id !== id);
    setIncomes(updatedIncomes);
    onUpdateIncomes(updatedIncomes);
  };

  const handleRemoveExpense = (id: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);
    onUpdateExpenses(updatedExpenses);
  };

  const handleUpdateIncomeAmount = (id: string, value: string) => {
    const amount = Number(value);
    if (isNaN(amount)) return;
    
    const updatedIncomes = incomes.map(income => 
      income.id === id ? { ...income, amount } : income
    );
    setIncomes(updatedIncomes);
    onUpdateIncomes(updatedIncomes);
  };

  const handleUpdateIncomeDescription = (id: string, description: string) => {
    const updatedIncomes = incomes.map(income => 
      income.id === id ? { ...income, description } : income
    );
    setIncomes(updatedIncomes);
    onUpdateIncomes(updatedIncomes);
  };

  const handleUpdateExpenseAmount = (id: string, value: string) => {
    const amount = Number(value);
    if (isNaN(amount)) return;
    
    const updatedExpenses = expenses.map(expense => 
      expense.id === id ? { ...expense, amount } : expense
    );
    setExpenses(updatedExpenses);
    onUpdateExpenses(updatedExpenses);
  };

  const handleUpdateExpenseDescription = (id: string, description: string) => {
    const updatedExpenses = expenses.map(expense => 
      expense.id === id ? { ...expense, description } : expense
    );
    setExpenses(updatedExpenses);
    onUpdateExpenses(updatedExpenses);
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-8">
      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total de Receitas</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-full">
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">Total de Despesas</p>
              <p className="text-xl font-bold text-red-700 dark:text-red-300">{formatCurrency(totalExpense)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-full">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Saldo</p>
              <p className={`text-xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {formatCurrency(totalIncome - totalExpense)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Seção de Receitas */}
      <Card className="p-6 border-green-200 dark:border-green-700/50 bg-white dark:bg-slate-700/60">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-full">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-green-700 dark:text-green-300">Receitas Mensais</h3>
        </div>
        
        <div className="space-y-4">
          {incomes.map((income) => (
            <div key={income.id} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-700/50">
              <div className="flex-1">
                <Input
                  type="text"
                  value={income.description}
                  onChange={(e) => handleUpdateIncomeDescription(income.id, e.target.value)}
                  placeholder="Descrição da receita"
                  className="border-green-200 dark:border-green-600 focus:border-green-400 dark:focus:border-green-500 bg-white dark:bg-slate-600/80 text-gray-900 dark:text-white"
                />
              </div>
              <div className="relative w-36">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 dark:text-green-400 font-medium">
                  R$
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={income.amount || ""}
                  onChange={(e) => handleUpdateIncomeAmount(income.id, e.target.value)}
                  placeholder="0,00"
                  className="pl-10 border-green-200 dark:border-green-600 focus:border-green-400 dark:focus:border-green-500 bg-white dark:bg-slate-600/80 text-gray-900 dark:text-white"
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRemoveIncome(income.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))}
          
          {/* Formulário para nova receita */}
          <div className="p-4 border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg bg-green-25 dark:bg-green-900/20">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  value={newIncomeDescription}
                  onChange={(e) => setNewIncomeDescription(e.target.value)}
                  placeholder="Nova fonte de receita"
                  className="border-green-200 dark:border-green-600 focus:border-green-400 dark:focus:border-green-500 bg-white dark:bg-slate-600/80 text-gray-900 dark:text-white"
                />
              </div>
              <div className="relative w-36">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 dark:text-green-400 font-medium">
                  R$
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newIncomeAmount}
                  onChange={(e) => setNewIncomeAmount(e.target.value)}
                  placeholder="0,00"
                  className="pl-10 border-green-200 dark:border-green-600 focus:border-green-400 dark:focus:border-green-500 bg-white dark:bg-slate-600/80 text-gray-900 dark:text-white"
                />
              </div>
              <Button 
                onClick={handleAddIncome}
                variant="outline"
                className="flex items-center gap-2 text-green-600 dark:text-green-400 border-green-300 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-400 dark:hover:border-green-500"
              >
                <PlusCircle size={18} /> 
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Seção de Despesas */}
      <Card className="p-6 border-red-200 dark:border-red-700/50 bg-white dark:bg-slate-700/60">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-full">
            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-300">Despesas Mensais</h3>
        </div>
        
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-100 dark:border-red-700/50">
              <div className="flex-1">
                <Input
                  type="text"
                  value={expense.description}
                  onChange={(e) => handleUpdateExpenseDescription(expense.id, e.target.value)}
                  placeholder="Descrição da despesa"
                  className="border-red-200 dark:border-red-600 focus:border-red-400 dark:focus:border-red-500 bg-white dark:bg-slate-600/80 text-gray-900 dark:text-white"
                />
              </div>
              <div className="relative w-36">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600 dark:text-red-400 font-medium">
                  R$
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={expense.amount || ""}
                  onChange={(e) => handleUpdateExpenseAmount(expense.id, e.target.value)}
                  placeholder="0,00"
                  className="pl-10 border-red-200 dark:border-red-600 focus:border-red-400 dark:focus:border-red-500 bg-white dark:bg-slate-600/80 text-gray-900 dark:text-white"
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRemoveExpense(expense.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))}
          
          {/* Formulário para nova despesa */}
          <div className="p-4 border-2 border-dashed border-red-300 dark:border-red-600 rounded-lg bg-red-25 dark:bg-red-900/20">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  value={newExpenseDescription}
                  onChange={(e) => setNewExpenseDescription(e.target.value)}
                  placeholder="Nova despesa"
                  className="border-red-200 dark:border-red-600 focus:border-red-400 dark:focus:border-red-500 bg-white dark:bg-slate-600/80 text-gray-900 dark:text-white"
                />
              </div>
              <div className="relative w-36">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600 dark:text-red-400 font-medium">
                  R$
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  placeholder="0,00"
                  className="pl-10 border-red-200 dark:border-red-600 focus:border-red-400 dark:focus:border-red-500 bg-white dark:bg-slate-600/80 text-gray-900 dark:text-white"
                />
              </div>
              <Button 
                onClick={handleAddExpense}
                variant="outline"
                className="flex items-center gap-2 text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-500"
              >
                <PlusCircle size={18} /> 
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="text-sm text-gray-500 dark:text-gray-400 italic mt-6 p-4 bg-gray-50 dark:bg-slate-600/50 rounded-lg border border-gray-200 dark:border-slate-500/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
          <span>Todos os seus dados são salvos apenas no seu navegador e não são enviados a nenhum servidor.</span>
        </div>
      </div>
    </div>
  );
};

export default UserFinancialInput;
