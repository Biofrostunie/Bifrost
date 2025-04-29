
import { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Suas Entradas de Dinheiro</h3>
        <div className="space-y-4">
          {incomes.map((income) => (
            <div key={income.id} className="flex items-center gap-3">
              <Input
                type="text"
                value={income.description}
                onChange={(e) => handleUpdateIncomeDescription(income.id, e.target.value)}
                placeholder="Descrição da entrada"
                className="flex-grow"
              />
              <div className="relative w-32">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={income.amount || ""}
                  onChange={(e) => handleUpdateIncomeAmount(income.id, e.target.value)}
                  placeholder="0,00"
                  className="pl-6"
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRemoveIncome(income.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))}
          
          <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
            <Input
              type="text"
              value={newIncomeDescription}
              onChange={(e) => setNewIncomeDescription(e.target.value)}
              placeholder="Nova entrada de dinheiro"
              className="flex-grow"
            />
            <div className="relative w-32">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newIncomeAmount}
                onChange={(e) => setNewIncomeAmount(e.target.value)}
                placeholder="0,00"
                className="pl-6"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
            </div>
            <Button 
              onClick={handleAddIncome}
              variant="outline"
              className="flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50"
            >
              <PlusCircle size={18} /> Adicionar
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Suas Despesas</h3>
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center gap-3">
              <Input
                type="text"
                value={expense.description}
                onChange={(e) => handleUpdateExpenseDescription(expense.id, e.target.value)}
                placeholder="Descrição da despesa"
                className="flex-grow"
              />
              <div className="relative w-32">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={expense.amount || ""}
                  onChange={(e) => handleUpdateExpenseAmount(expense.id, e.target.value)}
                  placeholder="0,00"
                  className="pl-6"
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRemoveExpense(expense.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))}
          
          <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
            <Input
              type="text"
              value={newExpenseDescription}
              onChange={(e) => setNewExpenseDescription(e.target.value)}
              placeholder="Nova despesa"
              className="flex-grow"
            />
            <div className="relative w-32">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                placeholder="0,00"
                className="pl-6"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
            </div>
            <Button 
              onClick={handleAddExpense}
              variant="outline"
              className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
            >
              <PlusCircle size={18} /> Adicionar
            </Button>
          </div>
        </div>
      </Card>
      
      <div className="text-sm text-gray-500 italic mt-2">
        Todos os seus dados são salvos apenas no seu navegador e não são enviados a nenhum servidor.
      </div>
    </div>
  );
};

export default UserFinancialInput;
