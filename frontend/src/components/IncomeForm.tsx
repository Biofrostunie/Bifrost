
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export interface Income {
  id: string;
  source: string;
  amount: number;
  recurrent: boolean;
}

interface IncomeFormProps {
  onAddIncome: (income: Income) => void;
}

const IncomeForm = ({ onAddIncome }: IncomeFormProps) => {
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [recurrent, setRecurrent] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!source || !amount) {
      toast.error("Preencha todos os campos");
      return;
    }

    const newIncome: Income = {
      id: Date.now().toString(),
      source,
      amount: parseFloat(amount),
      recurrent,
    };

    onAddIncome(newIncome);
    setSource("");
    setAmount("");
    toast.success("Renda adicionada com sucesso!");
  };

  return (
    <Card className="p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Renda Mensal</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="source">Fonte de Renda</Label>
          <Input
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Ex: Salário, Freelance, Investimentos"
          />
        </div>
        
        <div>
          <Label htmlFor="income-amount">Valor (R$)</Label>
          <Input
            id="income-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="recurrent"
            checked={recurrent}
            onChange={(e) => setRecurrent(e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="recurrent" className="text-sm">Renda Recorrente</Label>
        </div>
        
        <Button type="submit" className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Renda
        </Button>
      </form>
    </Card>
  );
};

export default IncomeForm;
