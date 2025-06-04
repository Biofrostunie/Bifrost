import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialIndicator from "@/components/FinancialIndicator";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, TrendingUp, Download, ShoppingCart, AlertCircle } from "lucide-react";

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

  const bookRecommendations = [
    {
      title: "Viver de Dividendos",
      description: "Aprenda estratégias para construir uma carteira de investimentos focada em dividendos",
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
      title: "Mercado Financeiro: Produtos e Serviços",
      description: "Neste livro, Eduardo Fortuna apresenta os diversos produtos e serviços disponíveis no mercado financeiro, além de trazer estratégias de investimentos para entusiastas, investidores e profissionais da área."
    },
    {
      title: "Quando os gênios falham – A ascensão e a queda da Long-Term Capital Management",
      description: "Neste livro produzido pelo jornalista Roger Lowenstein, uma série de entrevistas e memórias leva o leitor à década de 1990 para entender como a famosa gestora de Wall Street passou de uma instituição com US$ 100 bilhões sob sua gestão para um dos maiores desastres do mercado financeiro."
    },
    {
      title: "A Lógica do Cisne Negro",
      description: "O autor fala sobre como surge um cisne negro – um fenômeno que é altamente improvável e produz um grande impacto – como só posteriormente o ser humano é capaz de elaborar uma explicação lógica sobre o que aconteceu."
    },
    {
      title: "O Jogo da Mentira",
      description: "Para quem gosta de tesouraria, o livro de Michael Lewis explica qual o caminho percorrido pelo dinheiro no mercado financeiro e conta como os corretores de Wall Street lidavam com balanços financeiros, grande fortunas e lucros e, até mesmo, prejuízos inesperados."
    },
    {
      title: "A Grande Aposta",
      description: "Outra obra de Michael Lewis, que virou até filme. O autor aborda, em detalhes, os motivos que levaram à crise do subprime americano em 2008, um dos maiores colapsos financeiros da história, que levou a uma crise econômica global."
    }
  ];

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
          Explore os indicadores econômicos, nossas recomendações de cursos e livros.
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

        <Tabs defaultValue="livros" className="w-full">
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
                  porém <strong>não temos parcerias comerciais</strong> com os autores ou editoras mencionados.
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
      </div>
    </AppLayout>
  );
};

export default FinancialEducation;