
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialIndicator from "@/components/FinancialIndicator";
import FinancialSummary from "@/components/FinancialSummary";
import FinancialDetails from "@/components/FinancialDetails";
import UserFinancialInput, { FinancialEntry } from "@/components/UserFinancialInput";
import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

// Base structure for income and expense objects to match component expectations
interface Income {
  id: string;
  description: string;
  amount: number;
  source: string;
  date: string;
  recurrent: boolean;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  essential: boolean;
}

// Helper function to transform FinancialEntry to Income
const mapToIncome = (entry: FinancialEntry): Income => ({
  id: entry.id,
  description: entry.description,
  amount: entry.amount,
  source: "Personalizado",
  date: new Date().toISOString().split('T')[0],
  recurrent: false
});

// Helper function to transform FinancialEntry to Expense
const mapToExpense = (entry: FinancialEntry): Expense => ({
  id: entry.id,
  description: entry.description,
  amount: entry.amount,
  category: "Outros",
  date: new Date().toISOString().split('T')[0],
  essential: false
});

const FinancialEducation = () => {
  // State for user financial data
  const [userIncomes, setUserIncomes] = useState<Income[]>([]);
  const [userExpenses, setUserExpenses] = useState<Expense[]>([]);

  const [activeDetail] = useState({
    title: "Inflação",
    description: "Entenda o impacto da inflação no seu poder de compra",
    details: [
      "IPCA Atual: 4.2%", 
      "IPCA Acumulado (12m): 4.5%", 
      "Meta de Inflação: 3.5%"
    ]
  });

  const educationalTopics = [
    {
      title: "Importância da reserva de emergência",
      description: "Saiba como e por que construir sua reserva de emergência",
      link: "/conhecimento"
    },
    {
      title: "Investimentos para iniciantes",
      description: "Descubra os melhores investimentos para quem está começando",
      link: "/conhecimento"
    },
    {
      title: "Planejamento financeiro",
      description: "Aprenda a planejar suas finanças de forma eficiente",
      link: "/conhecimento"
    }
  ];

  // Handler functions for updating user financial data
  const handleUpdateIncomes = (entries: FinancialEntry[]) => {
    setUserIncomes(entries.map(mapToIncome));
  };

  const handleUpdateExpenses = (entries: FinancialEntry[]) => {
    setUserExpenses(entries.map(mapToExpense));
  };

  return (
    <AppLayout title="Educação Financeira">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-finance-blue" />
          <h1 className="text-2xl font-bold text-finance-dark dark:text-white">
            Educação Financeira
          </h1>
        </div>

        <p className="text-gray-600 dark:text-gray-300">
          Aprender sobre finanças é o primeiro passo para construir um futuro financeiro sólido. 
          Explore os indicadores econômicos, nosso conteúdo educacional e acompanhe seu resumo financeiro.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FinancialIndicator
            title="Taxa Selic"
            value="10,5%"
            change="+0.5"
            isPositive={false}
            description="Taxa básica de juros da economia"
          />
          <FinancialIndicator
            title="IPCA (12m)"
            value="4,2%"
            change="-0.3"
            isPositive={true}
            description="Índice oficial de inflação"
          />
          <FinancialIndicator
            title="CDI"
            value="10,4%"
            change="+0.5"
            isPositive={false}
            description="Certificado de Depósito Interbancário"
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 md:p-6 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-finance-blue" />
            <h2 className="text-lg font-semibold text-finance-dark dark:text-white">Conteúdo Educacional</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {educationalTopics.map((topic, index) => (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium mb-2 text-finance-dark dark:text-white">{topic.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{topic.description}</p>
                <Link to={topic.link}>
                  <Button size="sm" variant="outline" className="w-full">
                    Explorar <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center mt-2">
            <Link to="/conhecimento">
              <Button variant="link">Ver mais conteúdo educativo</Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="resumo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resumo">Resumo Financeiro</TabsTrigger>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="personalizar">Personalizar Dados</TabsTrigger>
          </TabsList>
          <TabsContent value="resumo" className="pt-4">
            <FinancialSummary expenses={userExpenses} incomes={userIncomes} />
          </TabsContent>
          <TabsContent value="detalhes" className="pt-4">
            <FinancialDetails 
              title={activeDetail.title} 
              description={activeDetail.description} 
              details={activeDetail.details}
              onBack={() => {}} 
            />
          </TabsContent>
          <TabsContent value="personalizar" className="pt-4">
            <UserFinancialInput 
              onUpdateIncomes={handleUpdateIncomes}
              onUpdateExpenses={handleUpdateExpenses}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default FinancialEducation;
