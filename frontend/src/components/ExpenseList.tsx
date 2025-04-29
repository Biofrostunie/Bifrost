
import { Trash2, Calendar, FileText, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import { Expense } from "@/pages/ExpenseCalculator"; // Import from the page to ensure type consistency

interface ExpenseListProps {
  expenses: Expense[];
  onRemoveExpense: (id: string) => void; // Changed from onDeleteExpense
}

const ExpenseList = ({ expenses, onRemoveExpense }: ExpenseListProps) => {
  const getCategoryLabel = (categoryValue: string) => {
    const categories: Record<string, string> = {
      alimentacao: "Alimentação",
      transporte: "Transporte",
      moradia: "Moradia",
      saude: "Saúde",
      lazer: "Lazer",
      educacao: "Educação",
      outros: "Outros",
    };
    
    return categories[categoryValue] || categoryValue;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric" 
    };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-finance-gray">
        Nenhuma despesa cadastrada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <Card key={expense.id} className="p-4">
          <div className="flex justify-between">
            <div>
              <div className="flex items-center">
                <h3 className="font-medium">{expense.description}</h3>
                {expense.essential && (
                  <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                    Essencial
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2 text-sm text-finance-gray">
                <span className="flex items-center">
                  <Tag className="h-3 w-3 mr-1" />
                  {getCategoryLabel(expense.category)}
                </span>
                
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(expense.date)}
                </span>
                
                {expense.notes && (
                  <span className="flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    {expense.notes}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{formatCurrency(expense.amount)}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveExpense(expense.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ExpenseList;
