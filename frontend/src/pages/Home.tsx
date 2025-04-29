import { Calculator, BookOpen, TrendingUp, DollarSign, Heart, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import UserProfile from "@/components/UserProfile";
import DashboardCard from "@/components/DashboardCard";

// Financial curiosities to display randomly
const financialCuriosities = [
  "Se você investir R$ 100 por mês com um rendimento médio de 10% ao ano, em 30 anos terá acumulado aproximadamente R$ 226.000.",
  "A regra dos 72 permite estimar em quantos anos seu dinheiro irá dobrar: basta dividir 72 pela taxa de juros anual. Ex: a 8% ao ano, seu dinheiro dobra em 9 anos.",
  "O Brasil já teve 8 moedas diferentes desde 1942: Cruzeiro, Cruzeiro Novo, Cruzeiro (2ª vez), Cruzado, Cruzado Novo, Cruzeiro (3ª vez), Cruzeiro Real e finalmente o Real em 1994.",
  "Warren Buffett, um dos maiores investidores do mundo, acumulou mais de 99% de sua fortuna depois dos 50 anos de idade.",
  "A primeira bolsa de valores do mundo foi criada em Amsterdam, na Holanda, em 1602.",
  "Apenas 3 em cada 10 brasileiros possuem algum tipo de investimento além da poupança, segundo dados da ANBIMA.",
  "Em 1980, a inflação no Brasil chegou a 110% ao ano. Em 1993, no auge da hiperinflação, chegou a incrível marca de 2.477%.",
  "Guardar 10% da sua renda todos os meses pode fazer uma enorme diferença no longo prazo devido ao poder dos juros compostos."
];

const Home = () => {
  const [curiosity, setCuriosity] = useState("");

  // Select a random curiosity on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * financialCuriosities.length);
    setCuriosity(financialCuriosities[randomIndex]);
  }, []);

  return (
    <AppLayout title="Bifröst" showProfile>
      <div>
        <UserProfile />
        
        {/* Feature Highlight Card */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-finance-teal/10 to-[#F2FCE2]/80 border-finance-teal/30">
          <div className="flex items-center space-x-4">
            <div className="bg-finance-teal/20 p-3 rounded-full">
              <Target className="h-8 w-8 text-finance-teal" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Crie Metas Financeiras!</h3>
              <p className="text-finance-gray">
                Defina objetivos financeiros e descubra quanto tempo levará para alcançá-los com nossa calculadora de metas.
              </p>
              <a 
                href="/investimentos" 
                className="inline-flex mt-2 items-center text-finance-teal font-medium hover:underline"
              >
                Experimentar agora <TrendingUp className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </Card>
        
        <h2 className="text-xl font-semibold mb-4">Ferramentas Financeiras</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <DashboardCard
            title="Calculadora de Gastos"
            description="Controle suas despesas de forma fácil e visual"
            Icon={Calculator}
            to="/calculadora"
            color="finance-blue"
          />
          
          <DashboardCard
            title="Simulador de Investimentos"
            description="Calcule o rendimento dos seus investimentos"
            Icon={TrendingUp}
            to="/investimentos"
            color="finance-teal"
          />
          
          <DashboardCard
            title="Educação Financeira"
            description="Entenda os principais indicadores econômicos"
            Icon={BookOpen}
            to="/educacao"
            color="finance-purple"
          />
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Dicas & Informações</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-finance-blue/10 rounded-lg p-4">
            <div className="flex items-start">
              <div className="bg-finance-blue/20 p-2 rounded-full shrink-0 mr-3">
                <TrendingUp className="h-5 w-5 text-finance-blue" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Dica do dia:</h3>
                <p>
                  Guardar pelo menos 10% da sua renda mensal pode fazer uma grande diferença no longo prazo. Considere investir em títulos indexados ao CDI para proteger seu dinheiro da inflação.
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="rounded-lg p-4 border-finance-teal/30 bg-finance-teal/5">
            <div className="flex items-start">
              <div className="rounded-full bg-finance-teal/20 p-2 mr-3 shrink-0">
                <DollarSign className="h-5 w-5 text-finance-teal" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Você sabia?</h3>
                <p>{curiosity}</p>
              </div>
            </div>
          </Card>
          
          <Card className="rounded-lg p-4 border-rose-300/30 bg-rose-50/50 dark:bg-rose-900/5 lg:col-span-2">
            <div className="flex items-start">
              <div className="rounded-full bg-rose-100 dark:bg-rose-900/20 p-2 mr-3 shrink-0">
                <Heart className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Cuidando do seu futuro</h3>
                <p>
                  Planeje seus gastos com sabedoria e garanta uma saúde financeira para o seu futuro. 
                  Uma boa gestão financeira hoje significa tranquilidade amanhã.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
