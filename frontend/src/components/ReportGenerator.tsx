import { useState } from "react";
import { Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Expense } from "@/pages/ExpenseCalculator";
import { formatCurrency } from "@/lib/formatters";

interface ReportGeneratorProps {
  expenses: Expense[];
}

const ReportGenerator = ({ expenses }: ReportGeneratorProps) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const generateReport = () => {
    if (!startDate || !endDate) {
      toast.error("Selecione as datas de início e fim do relatório");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("A data de início deve ser anterior à data de fim");
      return;
    }

    // Filter expenses by date range
    const filteredExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return expenseDate >= start && expenseDate <= end;
    });

    if (filteredExpenses.length === 0) {
      toast.warning("Nenhuma despesa encontrada no período selecionado");
      return;
    }

    // Calculate totals
    const totalAmount = filteredExpenses.reduce((acc, expense) => acc + expense.amount, 0);
    const essentialTotal = filteredExpenses
      .filter(expense => expense.essential)
      .reduce((acc, expense) => acc + expense.amount, 0);
    const nonEssentialTotal = totalAmount - essentialTotal;

    // Generate report content
    const reportContent = `
RELATÓRIO DE GASTOS
Período: ${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}

RESUMO GERAL:
Total de despesas: ${filteredExpenses.length}
Valor total: ${formatCurrency(totalAmount)}
Gastos essenciais: ${formatCurrency(essentialTotal)}
Gastos não essenciais: ${formatCurrency(nonEssentialTotal)}

DETALHES POR DESPESA:
${filteredExpenses.map(expense => 
  `${new Date(expense.date).toLocaleDateString('pt-BR')} - ${expense.description} - ${formatCurrency(expense.amount)} (${expense.essential ? 'Essencial' : 'Não Essencial'})`
).join('\n')}
    `;

    // Create and download file
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-gastos-${startDate}-${endDate}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Relatório gerado com sucesso!");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="destructive" 
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <FileText className="mr-2 h-4 w-4" />
          Gerar Relatório
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerar Relatório de Gastos
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="start-date" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Data de Início
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="end-date" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Data de Fim
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={generateReport}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <FileText className="mr-2 h-4 w-4" />
              Gerar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportGenerator;