
import { useState, useEffect } from "react";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import ExpenseSummary from "@/components/ExpenseSummary";
import ReportGenerator from "@/components/ReportGenerator";
import { AppLayout } from "@/components/AppLayout";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useExpenseStore } from "@/store";
import { toast } from "sonner";

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  essential: boolean;
  notes?: string;
};

const EXPENSES_PER_PAGE = 10;

const ExpenseCalculator = () => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const { 
    expenses, 
    loading, 
    error, 
    getExpenses, 
    addExpense, 
    removeExpense, 
    clearError 
  } = useExpenseStore();

  useEffect(() => {
    getExpenses();
  }, [getExpenses]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  console.log("ExpenseCalculator state - expenses:", expenses);

  const handleAddExpense = async (expense: Omit<Expense, "id">) => {
    try {
      await addExpense(expense);
      toast.success("Despesa adicionada com sucesso!");
    } catch (error) {
      // O erro já é tratado no store
    }
  };

  const handleRemoveExpense = async (id: string) => {
    console.log("Removing expense with id:", id);
    try {
      await removeExpense(id);
      toast.success("Despesa removida com sucesso!");
    } catch (error) {
      // O erro já é tratado no store
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(expenses.length / EXPENSES_PER_PAGE);
  const startIndex = (currentPage - 1) * EXPENSES_PER_PAGE;
  const endIndex = startIndex + EXPENSES_PER_PAGE;
  const currentExpenses = expenses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <AppLayout title="Calculadora de Gastos">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-finance-dark dark:text-white">
            Calculadora de Gastos
          </h1>
          {expenses.length > 0 && (
            <ReportGenerator expenses={expenses} />
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form and List */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-700/60 rounded-lg p-6 border border-gray-200 dark:border-slate-500/50">
              <ExpenseForm onAddExpense={handleAddExpense} />
            </div>
            
            {expenses.length > 0 && (
              <div className="bg-white dark:bg-slate-700/60 rounded-lg p-6 border border-gray-200 dark:border-slate-500/50">
                <ExpenseList expenses={currentExpenses} onRemoveExpense={handleRemoveExpense} />
                
                {/* Pagination */}
                {expenses.length > EXPENSES_PER_PAGE && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Right Column - Summary */}
          {expenses.length > 0 && (
            <div className="lg:sticky lg:top-6 lg:self-start">
              <ExpenseSummary expenses={expenses} />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ExpenseCalculator;