
import { useState } from "react";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import ExpenseSummary from "@/components/ExpenseSummary";
import { AppLayout } from "@/components/AppLayout";

// Define expense type to match the one in ExpenseForm
export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  essential: boolean; // Adding the missing property
  notes?: string; // Optional property needed for ExpenseList
};

const ExpenseCalculator = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = {
      ...expense,
      id: crypto.randomUUID(),
    };
    setExpenses([...expenses, newExpense]);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  return (
    <AppLayout title="Calculadora de Gastos">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-finance-dark dark:text-white">
          Calculadora de Gastos
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-700/60 rounded-lg p-6 border border-gray-200 dark:border-slate-500/50">
              <ExpenseForm onAddExpense={addExpense} />
            </div>
            {expenses.length > 0 && (
              <div className="bg-white dark:bg-slate-700/60 rounded-lg p-6 border border-gray-200 dark:border-slate-500/50">
                <ExpenseList expenses={expenses} onRemoveExpense={removeExpense} />
              </div>
            )}
          </div>
          
          {expenses.length > 0 && (
            <div className="bg-white dark:bg-slate-700/60 rounded-lg p-6 border border-gray-200 dark:border-slate-500/50">
              <ExpenseSummary expenses={expenses} />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ExpenseCalculator;
