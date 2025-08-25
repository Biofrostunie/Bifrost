import { useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { SimulationResult, GoalSimulationResult } from "./calculationUtils";

interface InvestmentChartProps {
  data: SimulationResult | GoalSimulationResult | null;
  type: 'standard' | 'goal';
  goalAmount?: number;
  goalName?: string;
}

const InvestmentChart = ({ data, type, goalAmount, goalName }: InvestmentChartProps) => {
  const chartContentRef = useRef<HTMLDivElement>(null);

  const saveSimulation = async () => {
    if (!chartContentRef.current || !data) {
      toast.error("Nenhuma simulação encontrada para salvar");
      return;
    }

    try {
      // Import html2canvas dynamically
      const html2canvas = await import('html2canvas');

      // Wait for chart to render
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create canvas from the chart content container (without the button)
      const canvas = await html2canvas.default(chartContentRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 1200,
        height: 800,
        onclone: (clonedDoc) => {
          // Ensure styles are applied in the cloned document
          const clonedElement = clonedDoc.querySelector('[data-chart-content]');
          if (clonedElement) {
            clonedElement.setAttribute('style', 'background: white; padding: 20px;');
          }
        }
      });

      // Create a new canvas with additional information
      const finalCanvas = document.createElement('canvas');
      const ctx = finalCanvas.getContext('2d');

      if (!ctx) {
        toast.error("Erro ao gerar imagem");
        return;
      }

      finalCanvas.width = 1400;
      finalCanvas.height = 1000;

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

      // Title
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      const title = type === 'standard' ? 'SIMULAÇÃO DE INVESTIMENTOS' : `META: ${(goalName || 'Simulação com Meta').toUpperCase()}`;
      ctx.fillText(title, finalCanvas.width / 2, 50);

      // Subtitle
      ctx.font = '18px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('Simulação baseada em renda fixa com juros compostos', finalCanvas.width / 2, 80);

      // Main results section
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('RESULTADOS DA SIMULAÇÃO:', 50, 130);

      // Results info with better formatting
      ctx.font = '20px Arial';
      ctx.fillStyle = '#059669'; // Green for positive values
      ctx.fillText(`💰 Valor Final: ${formatCurrency(data.finalAmount)}`, 70, 170);

      ctx.fillStyle = '#2563eb'; // Blue for invested amount
      ctx.fillText(`💳 Total Investido: ${formatCurrency(data.totalInvested)}`, 70, 200);

      ctx.fillStyle = '#dc2626'; // Red for interest (earnings)
      ctx.fillText(`📈 Juros Acumulados: ${formatCurrency(data.totalInterest)}`, 70, 230);

      // Calculate additional metrics
      const profitability = data.totalInvested > 0 ? ((data.totalInterest / data.totalInvested) * 100) : 0;
      ctx.fillStyle = '#7c3aed'; // Purple for percentage
      ctx.fillText(`📊 Rentabilidade Total: ${profitability.toFixed(2)}%`, 70, 260);

      // Time information
      if (type === 'goal' && 'monthsToReach' in data) {
        const months = data.monthsToReach;
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        ctx.fillStyle = '#ea580c'; // Orange for time
        ctx.fillText(`⏱️ Tempo para Meta: ${years} anos e ${remainingMonths} meses`, 70, 290);

        if (goalAmount) {
          ctx.fillStyle = '#059669';
          ctx.fillText(`🎯 Meta Definida: ${formatCurrency(goalAmount)}`, 70, 320);
        }
      } else {
        // For standard simulation, show the period
        const totalMonths = data.monthlyBreakdown.length;
        const years = Math.floor(totalMonths / 12);
        const remainingMonths = totalMonths % 12;
        ctx.fillStyle = '#ea580c';
        ctx.fillText(`⏱️ Período da Simulação: ${years} anos e ${remainingMonths} meses`, 70, 290);
      }

      // Additional details section
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('DETALHES ADICIONAIS:', 50, 360);

      ctx.font = '16px Arial';
      ctx.fillStyle = '#4b5563';

      // Monthly contribution (if available from first data point)
      if (data.monthlyBreakdown.length > 1) {
        const monthlyContribution = data.monthlyBreakdown[1].invested - data.monthlyBreakdown[0].invested;
        if (monthlyContribution > 0) {
          ctx.fillText(`• Aporte Mensal: ${formatCurrency(monthlyContribution)}`, 70, 390);
        }
      }

      // Growth information
      const monthlyGrowth = data.monthlyBreakdown.length > 1 ?
        ((data.finalAmount / data.monthlyBreakdown[0].value) ** (1 / (data.monthlyBreakdown.length - 1)) - 1) * 100 : 0;
      ctx.fillText(`• Crescimento Médio Mensal: ${monthlyGrowth.toFixed(2)}%`, 70, 420);

      // Final amount breakdown
      const initialAmount = data.monthlyBreakdown[0]?.value || 0;
      if (initialAmount > 0) {
        ctx.fillText(`• Valor Inicial: ${formatCurrency(initialAmount)}`, 70, 450);
        const finalMultiplier = data.finalAmount / initialAmount;
        ctx.fillText(`• Multiplicador do Investimento: ${finalMultiplier.toFixed(2)}x`, 70, 480);
      }

      // Draw the captured chart
      ctx.drawImage(canvas, 100, 520, 1200, 400);

      // Important disclaimer
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ AVISO IMPORTANTE:', finalCanvas.width / 2, 950);

      ctx.font = '12px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('Esta simulação é baseada em renda fixa e serve apenas para fins educacionais.', finalCanvas.width / 2, 970);
      ctx.fillText('Rentabilidades passadas não garantem resultados futuros.', finalCanvas.width / 2, 985);

      // Footer with date
      const currentDate = new Date().toLocaleDateString('pt-BR');
      ctx.font = '12px Arial';
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'left';
      ctx.fillText(`Gerado em: ${currentDate}`, 50, finalCanvas.height - 30);

      ctx.textAlign = 'right';
      ctx.fillText('Bifrost - Simulador de Investimentos', finalCanvas.width - 50, finalCanvas.height - 30);

      // Download the image
      finalCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `simulacao-completa-${type}-${new Date().getTime()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast.success("Simulação completa salva com sucesso!");
        }
      }, 'image/png');

    } catch (error) {
      console.error('Error saving simulation:', error);

      // Fallback method - save without chart capture but with all info
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        toast.error("Erro ao gerar imagem");
        return;
      }

      canvas.width = 1400;
      canvas.height = 800;

      // Background
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Title
      context.fillStyle = '#1f2937';
      context.font = 'bold 32px Arial';
      context.textAlign = 'center';
      const title = type === 'standard' ? 'SIMULAÇÃO DE INVESTIMENTOS' : `META: ${(goalName || 'Simulação com Meta').toUpperCase()}`;
      context.fillText(title, canvas.width / 2, 50);

      // All the detailed information (same as above but without chart)
      context.font = '18px Arial';
      context.fillStyle = '#6b7280';
      context.fillText('Simulação baseada em renda fixa com juros compostos', canvas.width / 2, 80);

      context.fillStyle = '#1f2937';
      context.font = 'bold 24px Arial';
      context.textAlign = 'left';
      context.fillText('RESULTADOS DA SIMULAÇÃO:', 50, 130);

      context.font = '20px Arial';
      context.fillStyle = '#059669';
      context.fillText(`💰 Valor Final: ${formatCurrency(data.finalAmount)}`, 70, 170);

      context.fillStyle = '#2563eb';
      context.fillText(`💳 Total Investido: ${formatCurrency(data.totalInvested)}`, 70, 200);

      context.fillStyle = '#dc2626';
      context.fillText(`📈 Juros Acumulados: ${formatCurrency(data.totalInterest)}`, 70, 230);

      const profitability = data.totalInvested > 0 ? ((data.totalInterest / data.totalInvested) * 100) : 0;
      context.fillStyle = '#7c3aed';
      context.fillText(`📊 Rentabilidade Total: ${profitability.toFixed(2)}%`, 70, 260);

      if (type === 'goal' && 'monthsToReach' in data) {
        const months = data.monthsToReach;
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        context.fillStyle = '#ea580c';
        context.fillText(`⏱️ Tempo para Meta: ${years} anos e ${remainingMonths} meses`, 70, 290);

        if (goalAmount) {
          context.fillStyle = '#059669';
          context.fillText(`🎯 Meta Definida: ${formatCurrency(goalAmount)}`, 70, 320);
        }
      }

      // Chart unavailable message
      context.font = '18px Arial';
      context.fillStyle = '#dc2626';
      context.textAlign = 'center';
      context.fillText('(Gráfico não disponível - dados completos salvos acima)', canvas.width / 2, 450);

      // Footer
      const currentDate = new Date().toLocaleDateString('pt-BR');
      context.font = '12px Arial';
      context.fillStyle = '#9ca3af';
      context.textAlign = 'left';
      context.fillText(`Gerado em: ${currentDate}`, 50, canvas.height - 30);

      context.textAlign = 'right';
      context.fillText('Bifrost - Simulador de Investimentos', canvas.width - 50, canvas.height - 30);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `simulacao-completa-${type}-${new Date().getTime()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast.warning("Simulação completa salva (gráfico não capturado)");
        }
      }, 'image/png');
    }
  };

  const formatXAxis = (value: number): string => {
    if (!data?.monthlyBreakdown.length) {
      return value.toString();
    }

    const dataLength = data.monthlyBreakdown.length;
    const tickThreshold = 30;
    if (dataLength > tickThreshold) {
      if (value % Math.ceil(dataLength / 6) !== 0) {
        return '';
      }
    }

    return `${value}m`;
  };

  const formatYAxis = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded shadow-lg text-xs max-w-[250px] pointer-events-none">
          <p className="font-medium mb-2">{`Mês: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="mb-1">
              {`${entry.name === 'value' ? 'Valor Total' :
                entry.name === 'invested' ? 'Total Investido' :
                  entry.name === 'goal' ? 'Meta' : entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 shadow-sm min-h-[400px] overflow-hidden">
      {data && (
        <div className="flex justify-end mb-2">
          <Button
            onClick={saveSimulation}
            className="bg-red-500 hover:bg-red-600 text-white"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Salvar Simulação
          </Button>
        </div>
      )}

      <div
        ref={chartContentRef}
        data-chart-content
        className="space-y-4 h-full"
      >
        {data ? (
          <div className="flex-1 min-h-0">
            <div className="w-full h-64 overflow-visible relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.monthlyBreakdown}
                  margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={formatXAxis}
                    fontSize={12}
                  />
                  <YAxis
                    tickFormatter={formatYAxis}
                    fontSize={12}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    position={{ x: 0, y: 0 }}
                    wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="line"
                    wrapperStyle={{ paddingBottom: '10px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    stackId="1"
                    stroke="#2196F3"
                    fill="#2196F3"
                    name="Total Investido"
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stackId="2"
                    stroke="#4CAF50"
                    fill="#4CAF50"
                    name="Valor Total"
                  />
                  {type === 'goal' && goalAmount && (
                    <Area
                      type="monotone"
                      dataKey={() => goalAmount}
                      name="Meta"
                      stroke="#F97316"
                      strokeDasharray="5 5"
                      fill="none"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-finance-gray dark:text-gray-300 p-4 text-center">
            <div>
              <p>Configure os parâmetros para ver o gráfico da simulação</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentChart;