
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/card";
import { Expense } from "@/pages/ExpenseCalculator";
import { formatCurrency } from "@/lib/formatters";

interface ExpenseSummaryProps {
  expenses: Expense[];
}

const COLORS = ["#0EA5E9", "#14B8A6", "#F59E0B", "#EC4899", "#8B5CF6", "#10B981", "#64748B"];

const ExpenseSummary = ({ expenses }: ExpenseSummaryProps) => {
  console.log("ExpenseSummary rendering with expenses:", expenses);

  if (expenses.length === 0) {
    console.log("No expenses found, returning null");
    return null;
  }

  const totalAmount = expenses.reduce((acc, expense) => acc + expense.amount, 0);
  console.log("Total amount calculated:", totalAmount);
  
  const categorySummary = expenses.reduce((acc: Record<string, number>, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {});

  console.log("Category summary:", categorySummary);

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

  console.log("Pie chart data:", pieChartData);

  const expensesByDate = expenses.reduce((acc: Record<string, number>, expense) => {
    const dateKey = expense.date.substring(0, 10);
    if (!acc[dateKey]) {
      acc[dateKey] = 0;
    }
    acc[dateKey] += expense.amount;
    return acc;
  }, {});

  const barChartData = Object.entries(expensesByDate)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-7)
    .map(([date, amount]) => {
      const formattedDate = new Date(date).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      
      return {
        date: formattedDate,
        amount,
      };
    });

  console.log("Bar chart data:", barChartData);

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

  console.log("Essential pie data:", essentialPieData);

  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / totalAmount) * 100).toFixed(0);
    return `${percent}%`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card className="p-6 bg-white dark:bg-slate-700/60 border border-gray-200 dark:border-slate-500/50">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h3 className="text-lg font-semibold text-finance-dark dark:text-white">Resumo de Gastos</h3>
          <div className="text-xl font-bold text-finance-dark dark:text-white">
            Total: {formatCurrency(totalAmount)}
          </div>
        </div>
      </Card>

      {/* Por Categoria */}
      <Card className="p-6 bg-white dark:bg-slate-700/60 border border-gray-200 dark:border-slate-500/50">
        <h4 className="text-md font-semibold mb-4 text-finance-dark dark:text-white">Por Categoria</h4>
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                label={renderCustomLabel}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(value as number)} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Linha do Tempo */}
      <Card className="p-6 bg-white dark:bg-slate-700/60 border border-gray-200 dark:border-slate-500/50">
        <h4 className="text-md font-semibold mb-4 text-finance-dark dark:text-white">Linha do Tempo</h4>
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `R$${value}`} />
              <Tooltip 
                formatter={(value) => formatCurrency(value as number)}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Bar dataKey="amount" fill="#0EA5E9" name="Valor" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Essencial vs Não Essencial */}
      <Card className="p-6 bg-white dark:bg-slate-700/60 border border-gray-200 dark:border-slate-500/50">
        <h4 className="text-md font-semibold mb-4 text-finance-dark dark:text-white">Essencial vs Não Essencial</h4>
        {essentialPieData.length > 1 ? (
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={essentialPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {essentialPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-gray-500">
            <p className="text-center text-sm">
              Defina despesas como essenciais ou não para visualizar dados.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ExpenseSummary;