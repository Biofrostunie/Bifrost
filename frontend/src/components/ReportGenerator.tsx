import { useState } from "react";
import { Calendar, FileText, Download } from "lucide-react";
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
import html2canvas from "html2canvas";

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

    // Criar elemento HTML para o relatório
    const reportDiv = document.createElement('div');
    reportDiv.style.padding = '20px';
    reportDiv.style.fontFamily = 'Arial, sans-serif';
    reportDiv.style.maxWidth = '800px';
    reportDiv.style.margin = '0 auto';
    reportDiv.style.backgroundColor = 'white';
    reportDiv.style.color = 'black';
    
    // Cabeçalho do relatório
    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.marginBottom = '20px';
    header.innerHTML = `
      <h1 style="color: #667eea; margin-bottom: 10px; font-size: 24px;">RELATÓRIO DE GASTOS</h1>
      <p style="font-size: 16px; margin-bottom: 5px;">Período: ${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}</p>
      <p style="font-size: 14px; color: #666;">Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
    `;
    reportDiv.appendChild(header);
    
    // Resumo geral
    const summary = document.createElement('div');
    summary.style.marginBottom = '30px';
    summary.style.padding = '15px';
    summary.style.backgroundColor = '#f8f9fa';
    summary.style.borderRadius = '8px';
    summary.innerHTML = `
      <h2 style="color: #4a5568; margin-bottom: 15px; font-size: 18px;">RESUMO GERAL</h2>
      <p style="margin-bottom: 8px; font-size: 14px;"><strong>Total de despesas:</strong> ${filteredExpenses.length}</p>
      <p style="margin-bottom: 8px; font-size: 14px;"><strong>Valor total:</strong> ${formatCurrency(totalAmount)}</p>
      <p style="margin-bottom: 8px; font-size: 14px;"><strong>Gastos essenciais:</strong> ${formatCurrency(essentialTotal)}</p>
      <p style="margin-bottom: 8px; font-size: 14px;"><strong>Gastos não essenciais:</strong> ${formatCurrency(nonEssentialTotal)}</p>
    `;
    reportDiv.appendChild(summary);
    
    // Tabela de despesas
    const detailsTable = document.createElement('div');
    detailsTable.innerHTML = `
      <h2 style="color: #4a5568; margin-bottom: 15px; font-size: 18px;">DETALHES POR DESPESA</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background-color: #667eea; color: white;">
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Data</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Descrição</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Valor</th>
            <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Tipo</th>
          </tr>
        </thead>
        <tbody>
          ${filteredExpenses.map(expense => `
            <tr style="background-color: ${expense.essential ? '#f0fff4' : '#fff5f5'};">
              <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${new Date(expense.date).toLocaleDateString('pt-BR')}</td>
              <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${expense.description}</td>
              <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(expense.amount)}</td>
              <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">
                <span style="padding: 3px 8px; border-radius: 4px; font-size: 12px; background-color: ${expense.essential ? '#c6f6d5' : '#fed7d7'}; color: ${expense.essential ? '#22543d' : '#742a2a'};">
                  ${expense.essential ? 'Essencial' : 'Não Essencial'}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    reportDiv.appendChild(detailsTable);
    
    // Adicionar o elemento ao DOM temporariamente
    document.body.appendChild(reportDiv);
    
    // Converter para canvas e depois para imagem PNG (simulando PDF)
     toast.loading("Gerando relatório...");
     
     html2canvas(reportDiv, {
       scale: 2, // Melhor qualidade
       useCORS: true,
       logging: false,
       backgroundColor: '#ffffff'
     }).then(canvas => {
       // Remover o elemento do DOM
       document.body.removeChild(reportDiv);
       
       // Converter canvas para imagem
       const imgData = canvas.toDataURL('image/png');
       
       // Criar link para download
       const link = document.createElement('a');
       link.href = imgData;
       link.download = `relatorio-gastos-${startDate}-${endDate}.pdf`;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       
       toast.dismiss();
        toast.success("Relatório PDF gerado com sucesso!");
      }).catch(error => {
        document.body.removeChild(reportDiv);
        console.error("Erro ao gerar relatório:", error);
        toast.dismiss();
        toast.error("Erro ao gerar o relatório. Tente novamente.");
      });
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