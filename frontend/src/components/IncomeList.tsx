
import { Trash2, Repeat, AlertCircle } from "lucide-react";
import { Income } from "./IncomeForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

interface IncomeListProps {
  incomes: Income[];
  onDeleteIncome: (id: string) => void;
}

const IncomeList = ({ incomes, onDeleteIncome }: IncomeListProps) => {
  if (incomes.length === 0) {
    return (
      <div className="text-center py-8 text-finance-gray">
        Nenhuma renda cadastrada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {incomes.map((income) => (
        <Card key={income.id} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{income.source}</h3>
              <div className="flex items-center text-sm text-finance-gray">
                {income.recurrent ? (
                  <span className="flex items-center">
                    <Repeat className="h-3 w-3 mr-1" /> Recorrente
                  </span>
                ) : (
                  <span className="flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" /> Única
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-finance-blue">{formatCurrency(income.amount)}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteIncome(income.id)}
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

export default IncomeList;
