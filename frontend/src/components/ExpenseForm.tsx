
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  essential: boolean;
}

interface ExpenseFormProps {
  onAddExpense: (expense: Expense) => void;
  categories?: Array<{ value: string; label: string }>;
}

const ExpenseForm = ({ onAddExpense, categories: customCategories }: ExpenseFormProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("outros");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [essential, setEssential] = useState(false);

  const defaultCategories = [
    { value: "alimentacao", label: "Alimentação" },
    { value: "transporte", label: "Transporte" },
    { value: "moradia", label: "Moradia" },
    { value: "saude", label: "Saúde" },
    { value: "lazer", label: "Lazer" },
    { value: "educacao", label: "Educação" },
    { value: "outros", label: "Outros" },
  ];
  
  const categories = customCategories || defaultCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      category,
      date,
      notes: notes || undefined,
      essential,
    };

    onAddExpense(newExpense);
    resetForm();
    toast.success("Despesa adicionada com sucesso!");
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCategory("outros");
    setDate(new Date().toISOString().split('T')[0]);
    setNotes("");
    setEssential(false);
  };

  return (
    <Card className="p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Adicionar Despesa</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="description">Descrição*</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Compras no supermercado"
          />
        </div>
        
        <div>
          <Label htmlFor="amount">Valor (R$)*</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="notes">Observações (opcional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detalhes adicionais sobre a despesa..."
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="essential"
            checked={essential}
            onChange={(e) => setEssential(e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="essential" className="text-sm">Despesa Essencial</Label>
        </div>
        
        <Button type="submit" className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Despesa
        </Button>
      </form>
    </Card>
  );
};

export default ExpenseForm;
