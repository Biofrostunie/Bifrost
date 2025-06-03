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
  
  const categorySummary = expenses.reduce((acc: Record<string, number>, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {});

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

  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / totalAmount) * 100).toFixed(0);
    return `${percent}%`;
  };

  return (
    <div className="w-full">
      <Card className="p-4 mb-6 w-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Resumo de Gastos</h3>
          <div className="text-xl font-bold">
            Total: {formatCurrency(totalAmount)}
          </div>
        </div>
        
        <Tabs defaultValue="category" className="w-full" orientation="vertical">
          <div className="flex flex-col space-y-4 w-full">
            <TabsList className="flex flex-col h-auto w-full space-y-2 bg-transparent p-0">
              <TabsTrigger 
                value="category" 
                className="w-full justify-start text-sm py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Por Categoria
              </TabsTrigger>
              <TabsTrigger 
                value="timeline" 
                className="w-full justify-start text-sm py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Linha do Tempo
              </TabsTrigger>
              <TabsTrigger 
                value="essential" 
                className="w-full justify-start text-sm py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Essencial vs Não Essencial
              </TabsTrigger>
            </TabsList>

            <div className="w-full min-h-[300px]">
              <TabsContent value="category" className="w-full mt-0">
                <div className="w-full h-[280px] overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="45%"
                        labelLine={false}
                        outerRadius={60}
                        innerRadius={20}
                        fill="#8884d8"
                        dataKey="value"
                        label={renderCustomLabel}
                        fontSize={10}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatCurrency(value as number)} 
                        contentStyle={{ fontSize: '11px', maxWidth: '180px' }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        iconSize={8}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="w-full mt-0">
                <div className="w-full h-[280px] overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={barChartData} 
                      margin={{ top: 15, right: 10, bottom: 45, left: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        fontSize={10}
                        angle={-45}
                        textAnchor="end"
                        height={45}
                        interval={0}
                      />
                      <YAxis
                        tickFormatter={(value) => `R$${value}`}
                        fontSize={10}
                        width={50}
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrency(value as number)}
                        labelFormatter={(label) => `Data: ${label}`}
                        contentStyle={{ fontSize: '11px' }}
                      />
                      <Bar dataKey="amount" fill="#0EA5E9" name="Valor" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="essential" className="w-full mt-0">
                {essentialPieData.length > 1 ? (
                  <div className="w-full h-[280px] overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={essentialPieData}
                          cx="50%"
                          cy="45%"
                          labelLine={false}
                          outerRadius={70}
                          innerRadius={25}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          fontSize={11}
                        >
                          {essentialPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => formatCurrency(value as number)} 
                          contentStyle={{ fontSize: '11px' }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                          layout="horizontal" 
                          verticalAlign="bottom" 
                          align="center"
                          iconSize={8}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-finance-gray">
                    <p className="text-center text-sm">
                      Defina despesas como essenciais ou não para visualizar dados.
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default ExpenseSummary;
