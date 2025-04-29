
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Expense } from "./ExpenseForm";
import { formatCurrency } from "@/lib/formatters";

interface ExpenseSummaryProps {
  expenses: Expense[];
}

const COLORS = ["#0EA5E9", "#14B8A6", "#F59E0B", "#EC4899", "#8B5CF6", "#10B981", "#64748B"];

const ExpenseSummary = ({ expenses }: ExpenseSummaryProps) => {
  if (expenses.length === 0) {
    return null;
  }

  const totalAmount = expenses.reduce((acc, expense) => acc + expense.amount, 0);
  
  // Get expenses by category
  const categorySummary = expenses.reduce((acc: Record<string, number>, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {});

  // Format data for pie chart
  const pieChartData = Object.entries(categorySummary).map(([category, amount], index) => {
    const categoryLabels: Record<string, string> = {
      alimentacao: "Alimentação",
      transporte: "Transporte",
      moradia: "Moradia",
      saude: "Saúde",
      lazer: "Lazer",
      educacao: "Educação",
      outros: "Outros",
    };

    return {
      name: categoryLabels[category] || category,
      value: amount,
      color: COLORS[index % COLORS.length],
    };
  });

  // Group expenses by date for the bar chart
  const expensesByDate = expenses.reduce((acc: Record<string, number>, expense) => {
    const dateKey = expense.date.substring(0, 10);
    if (!acc[dateKey]) {
      acc[dateKey] = 0;
    }
    acc[dateKey] += expense.amount;
    return acc;
  }, {});

  // Format data for bar chart - last 7 days or all days if less than 7
  const barChartData = Object.entries(expensesByDate)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-7)
    .map(([date, amount]) => {
      // Format date to DD/MM
      const formattedDate = new Date(date).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      
      return {
        date: formattedDate,
        amount,
      };
    });

  // Calculate essential vs non-essential expenses
  const essentialExpenses = expenses
    .filter(expense => expense.essential)
    .reduce((acc, expense) => acc + expense.amount, 0);
  
  const nonEssentialExpenses = expenses
    .filter(expense => !expense.essential)
    .reduce((acc, expense) => acc + expense.amount, 0);
  
  const essentialPieData = [
    { name: "Essencial", value: essentialExpenses, color: "#10B981" },
    { name: "Não Essencial", value: nonEssentialExpenses, color: "#F59E0B" },
  ].filter(item => item.value > 0);

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Resumo de Gastos</h3>
        <div className="text-xl font-bold">
          Total: {formatCurrency(totalAmount)}
        </div>
      </div>
      
      <Tabs defaultValue="category">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="category" className="flex-1">Por Categoria</TabsTrigger>
          <TabsTrigger value="timeline" className="flex-1">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="essential" className="flex-1">Essencial vs Não</TabsTrigger>
        </TabsList>

        <TabsContent value="category" className="h-72"> {/* Aumentei a altura aqui */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                fontSize={12}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="timeline" className="h-72"> {/* Aumentei a altura aqui */}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value as number)}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Bar dataKey="amount" fill="#0EA5E9" name="Valor" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="essential" className="h-72"> {/* Aumentei a altura aqui */}
          {essentialPieData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={essentialPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  fontSize={12}
                >
                  {essentialPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-finance-gray">
              Defina despesas como essenciais ou não para visualizar dados.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ExpenseSummary;
