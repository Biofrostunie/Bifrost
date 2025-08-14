import { Calculator, BookOpen, TrendingUp, DollarSign, Heart, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import UserProfile from "@/components/UserProfile";
import DashboardCard from "@/components/DashboardCard";
import InvestorProfileDialog from "@/components/InvestorProfileDialog";
import { getCurrentTip } from "@/data/finacialTips"
// Sistema de dicas financeiras com rotação temporal

const Home = () => {
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [dailyTip, setDailyTip] = useState("");
  const [weeklyTip, setWeeklyTip] = useState("");
  const [monthlyTip, setMonthlyTip] = useState("");

  useEffect(() => {
    // Carregar dicas baseadas no sistema de rotação temporal
    setDailyTip(getCurrentTip('daily').content);
    setWeeklyTip(getCurrentTip('weekly').content);
    setMonthlyTip(getCurrentTip('monthly').content);

    // Verificar se é o primeiro login e mostrar popup de perfil de investidor
    const hasSeenProfileDialog = localStorage.getItem('investor-profile-dialog-seen');
    const hasCompletedProfile = localStorage.getItem('investor-profile');

    if (!hasSeenProfileDialog && !hasCompletedProfile) {
      // Mostrar após um pequeno delay para melhor UX
      setTimeout(() => {
        setShowProfileDialog(true);
      }, 2000);
    }
  }, []);

  const handleProfileComplete = (profile: string) => {
    localStorage.setItem('investor-profile', profile);
    localStorage.setItem('investor-profile-dialog-seen', 'true');
    console.log('Perfil de investidor salvo:', profile);

    // TODO: Integração com Supabase
    // Enviar perfil para o backend
    /*
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          investor_profile: profile,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      console.log('Perfil salvo no backend:', data);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
    */
  };

  const handleProfileDialogClose = () => {
    localStorage.setItem('investor-profile-dialog-seen', 'true');
  };

  return (
    <AppLayout title="Dashboard" showProfile>
      <div>
        <InvestorProfileDialog
          open={showProfileDialog}
          onOpenChange={setShowProfileDialog}
          onComplete={handleProfileComplete}
        />
        <UserProfile />

        {/* Feature Highlight Card */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-finance-teal/10 to-[#F2FCE2]/80 dark:from-slate-600/60 dark:to-slate-700/60 border-finance-teal/30 dark:border-slate-500/50">
          <div className="flex items-center space-x-4">
            <div className="bg-finance-teal/20 dark:bg-finance-teal/30 p-3 rounded-full">
              <Target className="h-8 w-8 text-finance-teal" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 dark:text-white">Crie Metas Financeiras!</h3>
              <p className="text-finance-gray dark:text-gray-300">
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

        <h2 className="text-xl font-semibold mb-4 dark:text-white">Ferramentas Financeiras</h2>

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

        <h2 className="text-xl font-semibold mb-4 dark:text-white">Dicas & Informações</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-finance-blue/10 dark:bg-slate-600/60 rounded-lg p-4 border-gray-200 dark:border-slate-500/50">
            <div className="flex items-start">
              <div className="bg-finance-blue/20 dark:bg-finance-blue/30 p-2 rounded-full shrink-0 mr-3">
                <TrendingUp className="h-5 w-5 text-finance-blue" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 dark:text-white">Dica do dia:</h3>
                <p className="dark:text-gray-300">
                  {dailyTip}
                </p>
              </div>
            </div>
          </Card>

          <Card className="rounded-lg p-4 border-finance-teal/30 dark:border-slate-500/50 bg-finance-teal/5 dark:bg-slate-600/60">
            <div className="flex items-start">
              <div className="rounded-full bg-finance-teal/20 dark:bg-finance-teal/30 p-2 mr-3 shrink-0">
                <DollarSign className="h-5 w-5 text-finance-teal" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 dark:text-white">Você sabia?</h3>
                <p className="dark:text-gray-300">{weeklyTip}</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-lg p-4 border-rose-300/30 dark:border-slate-500/50 bg-rose-50/50 dark:bg-slate-600/60 lg:col-span-2">
            <div className="flex items-start">
              <div className="rounded-full bg-rose-100 dark:bg-rose-900/30 p-2 mr-3 shrink-0">
                <Heart className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 dark:text-white">Cuidando do seu futuro</h3>
                <p className="dark:text-gray-300">
                  {monthlyTip}
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