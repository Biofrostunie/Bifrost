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
import { API_BASE_URL } from "@/lib/api";

interface ReportGeneratorProps {
  expenses: Expense[];
}

const ReportGenerator = ({ expenses }: ReportGeneratorProps) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Selecione as datas de início e fim do relatório");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("A data de início deve ser anterior à data de fim");
      return;
    }

    toast.loading("Gerando PDF...");

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.dismiss();
        toast.error("Você precisa estar autenticado para gerar o PDF.");
        return;
      }

      const params = new URLSearchParams({ startDate, endDate });
      const response = await fetch(`${API_BASE_URL}/expenses/report/pdf?${params.toString()}`, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let message = response.statusText;
        try {
          const data = await response.json();
          message = data?.message || data?.error || message;
        } catch {}
        throw new Error(message);
      }

      const blob = await response.blob();
      if (blob.type !== 'application/pdf') {
        try {
          const text = await blob.text();
          const data = JSON.parse(text);
          throw new Error(data?.message || data?.error || "Resposta inválida ao gerar PDF.");
        } catch {
          throw new Error("Resposta inválida ao gerar PDF.");
        }
      }

      const filename = `relatorio-gastos-${startDate}-${endDate}.pdf`;
      const url = URL.createObjectURL(blob);

      // Abrir em nova aba para visualização
      window.open(url);

      // Disparar download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("Relatório PDF gerado com sucesso!");
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : "Erro ao gerar o relatório.");
    }
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
              Gerar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportGenerator;