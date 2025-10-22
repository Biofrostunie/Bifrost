import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialIndicator from "@/components/FinancialIndicator";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, TrendingUp, Download, ShoppingCart, AlertCircle, Lightbulb, DollarSign, PiggyBank, Target, TrendingDown, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Link } from "react-router-dom";

const FinancialEducation = () => {
  const courseRecommendations = [
    {
      title: "Cursos Itaú Social",
      description: "Plataforma de educação financeira do Itaú com cursos gratuitos sobre planejamento e investimentos",
      url: "https://www.itausocial.org.br/",
      provider: "Itaú"
    },
    {
      title: "Santander Open Academy",
      description: "Cursos online gratuitos de educação financeira e empreendedorismo do Santander",
      url: "https://www.santanderopenacademy.com/pt_br/courses.html",
      provider: "Santander"
    },
    {
      title: "EV.Org - Escola Virtual Bradesco",
      description: "Cursos gratuitos de educação financeira e gestão de negócios oferecidos pelo Bradesco",
      url: "https://www.ev.org.br/areas-de-interesse",
      provider: "Bradesco"
    }
  ];

  const paidBookRecommendations = [
    {
      title: "Pai Rico, Pai Pobre",
      description: "Trazendo conceitos importantes como relações de trabalho, educação e administração do dinheiro. É uma excelente alternativa para você que está disposto a iniciar sua trajetória com um grande passo."
    },
    {
      title: "Fora da Curva 1",
      description: "Traz a história de dez dos maiores gestores do Brasil, como Luis Stuhlberger, do famoso fundo Verde."
    },
    {
      title: "Fora da Curva 2",
      description: "Segundo volume da série traz a história de treze importantes figuras do mercado financeiro, como Guilherme Benchimol, fundador da XP, e Henrique Bredda, gestor do Alaska Asset Management."
    },
    {
      title: "A Grande Jogada",
      description: "Michael Burry e outros investidores acertaram ao lucrar em cima da crise de 2008. O livro conta essa história."
    }
  ];

  const bookRecommendations = [
    {
      title: "Viver de Dividendos",
      description: "Aprender estratégias para construir uma carteira de investimentos focada em dividendos",
      url: "https://www.infomoney.com.br/conteudos/ebooks/viver-de-dividendos/",
      provider: "InfoMoney",
      type: "E-book"
    },
    {
      title: "Venture Capital",
      description: "Entenda o mundo dos investimentos em startups e capital de risco",
      url: "https://www.infomoney.com.br/conteudos/ebooks/venture-capital/",
      provider: "InfoMoney",
      type: "E-book"
    },
    {
      title: "Cartão de Crédito",
      description: "Guia completo para usar o cartão de crédito de forma inteligente",
      url: "https://meubolsoemdia.com.br/ebooks/cartao-de-credito",
      provider: "Meu Bolso em Dia",
      type: "E-book"
    },
    {
      title: "Crédito Consignado",
      description: "Tudo que você precisa saber sobre crédito consignado e suas vantagens",
      url: "https://meubolsoemdia.com.br/ebooks/baixar-ebook-credito-consignado",
      provider: "Meu Bolso em Dia",
      type: "E-book"
    },
    {
      title: "25 Livros Gratuitos",
      description: "Coleção com 25 livros gratuitos sobre educação financeira e investimentos",
      url: "https://br.pinterest.com/pin/467178161362744698/",
      provider: "Pinterest",
      type: "Livros"
    }
  ];

  const [rates, setRates] = useState<Record<string, number>>({});
  const [changes, setChanges] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const resp = await apiFetch<{ success: boolean; data: any[] }>("/investment-rates");
        const data = resp?.data ?? [];

        const mapRates: Record<string, number> = {};
        const mapChanges: Record<string, number> = {};

        for (const rate of data) {
          const rateType = rate.rateType?.toLowerCase();
          if (!rateType) continue;
          mapRates[rateType] = rate.value ?? 0;
          mapChanges[rateType] = rate.change ?? 0;
        }

        setRates(mapRates);
        setChanges(mapChanges);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar taxas de investimento:", err);
        setError("Não foi possível carregar as taxas de investimento.");
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const formatPct = (value?: number) => {
    if (value === undefined || value === null) return "—";
    return `${value.toFixed(2)}% a.a.`;
  };

  const formatDelta = (value?: number) => {
    if (loading) return "...";
    if (error) return "—";
    if (value === undefined || value === null) return "—";
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}% hoje`;
  };

  const selicAnnual = rates.selic !== undefined ? (rates.selic * 252) : undefined;
  const ipcaAnnual = rates.ipca;
  const cdiAnnual = rates.cdi !== undefined ? (rates.cdi * 252) : undefined;

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-slate-700/60 p-4 md:p-6 rounded-lg border border-blue-100 dark:border-slate-500/50">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-finance-blue" />
            <h2 className="text-lg font-semibold text-finance-dark dark:text-white">Indicadores do Mercado</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <FinancialIndicator
              title="Selic"
              value={formatPct(selicAnnual)}
              change={formatDelta(changes.selic)}
              isPositive={(changes.selic ?? 0) >= 0}
              description="Taxa Básica de Juros"
            />
            <FinancialIndicator
              title="IPCA"
              value={formatPct(ipcaAnnual)}
              change={formatDelta(changes.ipca)}
              isPositive={(changes.ipca ?? 0) >= 0}
              description="Índice de Preços ao Consumidor Amplo"
            />
            <FinancialIndicator
              title="CDI"
              value={formatPct(cdiAnnual)}
              change={formatDelta(changes.cdi)}
              isPositive={(changes.cdi ?? 0) >= 0}
              description="Certificado de Depósito Interbancário"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-finance-blue/10 rounded-lg border border-finance-blue/20 dark:bg-slate-700/40 dark:border-slate-600/50">
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-lg font-semibold text-finance-dark dark:text-white mb-2">
                Acompanhe seu progresso
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Utilize nosso calculador de despesas para acompanhar seus gastos e visualizar seu progresso financeiro.
              </p>
              <Link to="/calculadora">
                <Button className="mt-4 w-full sm:w-auto" size="sm">
                  Ir para Calculadora
                </Button>
              </Link>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-[200px] h-[120px] bg-finance-blue/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-16 w-16 text-finance-blue/70" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-slate-700/60 p-4 md:p-6 rounded-lg border border-blue-100 dark:border-slate-500/50">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-finance-blue" />
              <h2 className="text-lg font-semibold text-finance-dark dark:text-white">Recomendações de Cursos</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {courseRecommendations.map((course, index) => (
                <Card key={index} className="p-4 hover:shadow-md transition-shadow bg-white dark:bg-slate-600/80 border-gray-200 dark:border-slate-500/50">
                  <h3 className="font-medium mb-2 text-finance-dark dark:text-white">{course.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{course.description}</p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mb-3 font-medium">
                    {course.provider}
                  </div>
                  <a href={course.url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="w-full">
                      Acessar Cursos <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </a>
                </Card>
              ))}
            </div>
          
          <div className="flex justify-center mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Todos os cursos são gratuitos e oferecidos pelas principais instituições financeiras do país
            </p>
          </div>
        </div>

        <Tabs defaultValue="livros" className="w-full pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="livros">Livros e E-books</TabsTrigger>
            <TabsTrigger value="pagos">Livros Pagos</TabsTrigger>
          </TabsList>
          <TabsContent value="livros" className="pt-4">
            <div className="bg-orange-50 dark:bg-slate-700/60 p-4 md:p-6 rounded-lg border border-orange-100 dark:border-slate-500/50">
              <div className="flex items-center gap-2 mb-4">
                <Download className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-finance-dark dark:text-white">Livros e E-books Gratuitos</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {bookRecommendations.map((book, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow bg-white dark:bg-slate-600/80 border-gray-200 dark:border-slate-500/50">
                    <h3 className="font-medium mb-2 text-finance-dark dark:text-white">{book.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{book.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                        {book.provider}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                        {book.type}
                      </div>
                    </div>
                    <a href={book.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="w-full">
                        {book.type === "Livros" ? "Ver Coleção" : "Baixar E-book"} <Download className="ml-1 h-3 w-3" />
                      </Button>
                    </a>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-center mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Todos os e-books são gratuitos e oferecidos por fontes confiáveis de educação financeira
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="pagos" className="pt-4">
            <div className="bg-green-50 dark:bg-slate-700/60 p-4 md:p-6 rounded-lg border border-green-100 dark:border-slate-500/50">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-finance-dark dark:text-white">Livros Pagos Recomendados</h2>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-medium text-amber-800 dark:text-amber-200">Importante</h3>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  A Bifröst recomenda estes livros com base em sua qualidade e relevância para educação financeira, 
                  porém não temos parcerias comerciais com os autores ou editoras mencionados.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {paidBookRecommendations.map((book, index) => (
                  <Card key={index} className="p-4 bg-white dark:bg-slate-600/80 border-gray-200 dark:border-slate-500/50">
                    <h3 className="font-medium mb-2 text-finance-dark dark:text-white">{book.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{book.description}</p>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-center mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Livros recomendados disponíveis em livrarias físicas e online
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

          <div className="bg-green-50 dark:bg-slate-700/60 p-4 md:p-6 rounded-lg border border-green-100 dark:border-slate-500/50">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-finance-dark dark:text-white">Dicas Práticas</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card className="p-4 hover:shadow-md transition-shadow bg-white dark:bg-slate-600/80 border-gray-200 dark:border-slate-500/50">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700">Essenciais</Badge>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="font-medium mb-2 text-finance-dark dark:text-white">Priorize gastos essenciais</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Foque primeiro no pagamento de despesas essenciais como moradia, alimentação e transporte. São a base do seu orçamento.
                </p>
              </Card>

              <Card className="p-4 hover:shadow-md transition-shadow bg-white dark:bg-slate-600/80 border-gray-200 dark:border-slate-500/50">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700">Cartões</Badge>
                  <CreditCard className="h-4 w-4 text-finance-blue" />
                </div>
                <h3 className="font-medium mb-2 text-finance-dark dark:text-white">Use o cartão com responsabilidade</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Evite parcelar compras desnecessárias e sempre controle os gastos para não exceder seu orçamento.
                </p>
              </Card>

              <Card className="p-4 hover:shadow-md transition-shadow bg-white dark:bg-slate-600/80 border-gray-200 dark:border-slate-500/50">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700">Planejamento</Badge>
                  <Target className="h-4 w-4 text-orange-600" />
                </div>
                <h3 className="font-medium mb-2 text-finance-dark dark:text-white">Defina metas financeiras</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Estabeleça metas claras de curto, médio e longo prazo para direcionar seus esforços e motivação.
                </p>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card className="p-4 hover:shadow-md transition-shadow bg-white dark:bg-slate-600/80 border-gray-200 dark:border-slate-500/50">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700">Investimentos</Badge>
                  <PiggyBank className="h-4 w-4 text-finance-purple" />
                </div>
                <h3 className="font-medium mb-2 text-finance-dark dark:text-white">Poupe para investir</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Separe uma parte da sua renda mensal para investimento em aplicações seguras e de baixo risco.
                </p>
              </Card>

              <Card className="p-4 hover:shadow-md transition-shadow bg-white dark:bg-slate-600/80 border-gray-200 dark:border-slate-500/50">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700">Crédito</Badge>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <h3 className="font-medium mb-2 text-finance-dark dark:text-white">Evite dívidas desnecessárias</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Utilize o crédito apenas quando necessário e sempre verifique as taxas de juros antes de contratar qualquer empréstimo.
                </p>
              </Card>

              <Card className="p-4 hover:shadow-md transition-shadow bg-white dark:bg-slate-600/80 border-gray-200 dark:border-slate-500/50">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700">Mercado</Badge>
                  <TrendingDown className="h-4 w-4 text-finance-teal" />
                </div>
                <h3 className="font-medium mb-2 text-finance-dark dark:text-white">Acompanhe os indicadores</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Entenda como Selic, IPCA e CDI impactam seu orçamento e planeje seus gastos com base nas tendências do mercado.
                </p>
              </Card>
            </div>

            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Dica: visite nosso simulador de investimentos para descobrir as melhores opções de rendimento com base no seu perfil.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-slate-700/60 p-4 md:p-6 rounded-lg border border-yellow-100 dark:border-slate-500/50">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="h-5 w-5 text-yellow-600" />
              <h2 className="text-lg font-semibold text-finance-dark dark:text-white">Consumo inteligente</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card className="p-4 hover:shadow-md transition-shadow bg-white dark:bg-slate-600/80 border-gray-200 dark:border-slate-500/50">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700">Planejamento</Badge>
                  <Target className="h-4 w-4 text-yellow-600" />
                </div>
                <h3 className="font-medium mb-2 text-finance-dark dark:text-white">Faça uma lista de compras</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Organize suas compras com antecedência para evitar compras por impulso e manter o orçamento sob controle.
                </p>
              </Card>

              <Card className="p-4 hover:shadow-md transition-shadow bg-white dark:bg-slate-600/80 border-gray-200 dark:border-slate-500/50">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700">Promoções</Badge>
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                </div>
                <h3 className="font-medium mb-2 text-finance-dark dark:text-white">Aproveite ofertas</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Utilize cupons e promoções de forma consciente para reduzir despesas sem comprometer a qualidade dos produtos.
                </p>
              </Card>
            </div>

            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Mais conteúdo: confira nossa base de conhecimento para dicas e materiais sobre finanças pessoais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default FinancialEducation;