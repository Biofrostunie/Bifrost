import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import UserProfile from "@/components/UserProfile";
import DashboardCard from "@/components/DashboardCard";
import InvestorProfileDialog from "@/components/InvestorProfileDialog";
import { getCurrentTip } from "@/data/finacialTips";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, BookOpen, TrendingUp, DollarSign, Heart, Target, Wallet, CreditCard } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";

// Tipos para novos painéis de contas/cartões
type BankAccount = { id: string; bankName: string; alias?: string; balance?: number; currency?: string };
type CreditCardType = { id: string; issuer: string; alias?: string; last4?: string; limit?: number };
type ExpenseType = { id: string; amount: number; paymentMethod?: string; creditCardId?: string };

const Home = () => {
  // Estado original (não removido)
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [dailyTip, setDailyTip] = useState("");
  const [weeklyTip, setWeeklyTip] = useState("");
  const [monthlyTip, setMonthlyTip] = useState("");
  // Tutorial agora é montado globalmente em ProtectedRoute

  // Novos estados para contas/cartões/expenses
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCardType[]>([]);
  const [expenses, setExpenses] = useState<ExpenseType[]>([]);

  useEffect(() => {
    // Carregar dicas baseadas no sistema de rotação temporal
    setDailyTip(getCurrentTip('daily').content);
    setWeeklyTip(getCurrentTip('weekly').content);
    setMonthlyTip(getCurrentTip('monthly').content);

    // Chaves específicas por conta (token)
    const token = localStorage.getItem('token') || 'anon';
    const keyId = localStorage.getItem('userEmail') || 'anon';
    const profileKey = `investor-profile:${keyId}`;
    const lastReviewKey = `investor-profile-last-reviewed:${keyId}`;

    const monthsSince = (dateStr?: string | null) => {
      if (!dateStr) return Infinity;
      const last = new Date(dateStr);
      const now = new Date();
      const years = now.getFullYear() - last.getFullYear();
      const months = now.getMonth() - last.getMonth();
      const total = years * 12 + months;
      // Se o dia do mês ainda não passou, ajusta -1
      if (now.getDate() < last.getDate()) return total - 1;
      return total;
    };

    const checkProfileAndPrompt = async () => {
      try {
        const apiToken = localStorage.getItem('token');
        const res = await apiFetch('/users/profile', { token: apiToken });
        const riskTolerance: string | undefined = res?.data?.profile?.riskTolerance;

        if (riskTolerance) {
          // Persistir perfil e iniciar/continuar contagem para revalidação
          localStorage.setItem(profileKey, riskTolerance);
          const lastReviewed = localStorage.getItem(lastReviewKey);
          if (!lastReviewed) {
            localStorage.setItem(lastReviewKey, new Date().toISOString());
          }
          const diff = monthsSince(localStorage.getItem(lastReviewKey));
          if (diff >= 6) {
            setTimeout(() => setShowProfileDialog(true), 800);
          }
        } else {
          // Sem perfil definido: pedir em todo login/visita ao dashboard
          setTimeout(() => setShowProfileDialog(true), 800);
        }
      } catch {
        // Fallback local caso a API falhe
        const localProfile = localStorage.getItem(profileKey);
        if (!localProfile) {
          setTimeout(() => setShowProfileDialog(true), 800);
        } else {
          const diff = monthsSince(localStorage.getItem(lastReviewKey));
          if (diff >= 6) {
            setTimeout(() => setShowProfileDialog(true), 800);
          }
        }
      }
    };

    // Respeitar conclusão do tutorial para não conflitar com os tooltips
    const tutorialKey = `app-tutorial-completed:user:${keyId}`;
    const tutorialCompleted = localStorage.getItem(tutorialKey) === 'true';

    if (tutorialCompleted) {
      checkProfileAndPrompt();
    } else {
      // Poll simples até o tutorial finalizar, então verifica perfil
      const start = Date.now();
      const poll = setInterval(() => {
        const done = localStorage.getItem(tutorialKey) === 'true';
        const timeout = Date.now() - start > 60000; // 60s de segurança
        if (done || timeout) {
          clearInterval(poll);
          if (done) checkProfileAndPrompt();
        }
      }, 1000);
    }
  }, []);

  useEffect(() => {
    // Buscar dados para os novos painéis
    const token = localStorage.getItem("token");
    apiFetch('/bank-accounts', { token }).then(res => setBankAccounts(res?.data ?? [])).catch(() => {});
    apiFetch('/credit-cards', { token }).then(res => setCreditCards(res?.data ?? [])).catch(() => {});
    apiFetch('/expenses', { token }).then(res => setExpenses(res?.data ?? [])).catch(() => {});
  }, []);

  const handleProfileComplete = async (profile: string) => {
    const token = localStorage.getItem('token') || 'anon';
    const profileKey = `investor-profile:${token}`;
    const lastReviewKey = `investor-profile-last-reviewed:${token}`;
    localStorage.setItem(profileKey, profile);
    localStorage.setItem(lastReviewKey, new Date().toISOString());

    const riskMap: Record<string, string> = {
      Conservador: 'conservative',
      Moderado: 'moderate',
      Arrojado: 'aggressive',
    };

    const riskTolerance = riskMap[profile];

    try {
      const token = localStorage.getItem('token');
      await apiFetch('/users/profile', {
        method: 'PUT',
        token,
        body: JSON.stringify({ riskTolerance }),
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  const cardUtilization = useMemo(() => {
    const byCard: Record<string, number> = {};
    for (const e of expenses) {
      if (e.paymentMethod === 'CREDIT_CARD' && e.creditCardId) {
        byCard[e.creditCardId] = (byCard[e.creditCardId] ?? 0) + Number(e.amount);
      }
    }
    return byCard;
  }, [expenses]);

  return (
    <AppLayout title="Dashboard" showProfile>
      <div>
        {/* Tutorial é renderizado globalmente em ProtectedRoute */}
        {/* Dialog de perfil de investidor e perfil do usuário */}
        <InvestorProfileDialog
          open={showProfileDialog}
          onOpenChange={setShowProfileDialog}
          onComplete={handleProfileComplete}
        />
        <UserProfile />

        {/* Card de destaque original */}
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
              <a href="/investimentos" className="inline-flex mt-2 items-center text-finance-teal font-medium hover:underline">
                Experimentar agora <TrendingUp className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </Card>

        {/* NOVO: Resumo de contas e cartões (acrescentado, sem remover o que havia) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-white dark:bg-slate-700/60 border-gray-200 dark:border-slate-500/50">
            <div className="flex items-center gap-3 mb-3">
              <Wallet className="h-5 w-5 text-finance-teal" />
              <h3 className="font-semibold dark:text-white">Contas Bancárias</h3>
            </div>
            <div className="space-y-2">
              {bankAccounts.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">Nenhuma conta cadastrada</p>
              ) : (
                bankAccounts.map((acc) => (
                  <div key={acc.id} className="flex justify-between text-sm">
                    <span className="dark:text-white">{acc.alias ? `${acc.alias} (${acc.bankName})` : acc.bankName}</span>
                    {acc.balance != null && <span className="text-gray-600 dark:text-gray-300">{formatCurrency(Number(acc.balance))}</span>}
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-slate-700/60 border-gray-200 dark:border-slate-500/50 lg:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <CreditCard className="h-5 w-5 text-finance-blue" />
              <h3 className="font-semibold dark:text-white">Cartões de Crédito</h3>
            </div>
            <div className="space-y-3">
              {creditCards.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">Nenhum cartão cadastrado</p>
              ) : (
                creditCards.map((cc) => {
                  const used = cardUtilization[cc.id] ?? 0;
                  const limit = cc.limit ?? 0;
                  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
                  return (
                    <div key={cc.id} className="p-3 rounded-md border border-gray-200 dark:border-slate-500/50">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="dark:text-white">{(cc.alias || cc.issuer) + (cc.last4 ? ` •••• ${cc.last4}` : '')}</span>
                        <span className="text-gray-600 dark:text-gray-300">Limite: {formatCurrency(Number(limit))}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-slate-600 rounded">
                        <div className="h-2 bg-finance-blue rounded" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs mt-1 text-gray-600 dark:text-gray-300">
                        <span>Utilizado: {formatCurrency(used)}</span>
                        <span>{pct}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        <h2 className="text-xl font-semibold mb-4 dark:text-white">Ferramentas Financeiras</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div data-tutorial="dashboard-expense">
            <DashboardCard
              title="Calculadora de Gastos"
              description="Controle suas despesas de forma fácil e visual"
              Icon={Calculator}
              to="/calculadora"
              color="finance-blue"
            />
          </div>
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

        {/* Dicas & Informações (originais) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

          <Card className="rounded-lg p-4 border-rose-300/30 dark:border-slate-500/50 bg-rose-50/50 dark:bg-slate-600/60 lg:col-span-1">
            <div className="flex items-start">
              <div className="rounded-full bg-rose-100 dark:bg-rose-900/30 p-2 mr-3 shrink-0">
                <Heart className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 dark:text-white">Cuidando do seu futuro</h3>
                <p className="dark:text-gray-300">{monthlyTip}</p>
              </div>
            </div>
          </Card>

          <Card data-tutorial="daily-tips" className="bg-finance-blue/10 dark:bg-slate-600/60 rounded-lg p-4 border-gray-200 dark:border-slate-500/50 lg:col-span-2">
            <div className="flex items-start">
              <div className="bg-finance-blue/20 dark:bg-finance-blue/30 p-2 rounded-full shrink-0 mr-3">
                <TrendingUp className="h-5 w-5 text-finance-blue" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 dark:text-white">Dica do dia:</h3>
                <p className="dark:text-gray-300">{dailyTip}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;