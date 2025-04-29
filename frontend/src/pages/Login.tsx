
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { DollarSign, Mail, Lock, ArrowRight } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    // Simulating login - would connect to backend in real implementation
    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      setLoading(false);
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo(a) à sua plataforma financeira.",
      });
      
      navigate("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50/50 dark:from-gray-900 dark:to-green-900/20">
      <div className="w-full max-w-md px-4">
        <Card className="relative overflow-hidden p-8 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-none shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 to-blue-100/20 dark:from-green-900/20 dark:to-blue-900/20" />
          
          <div className="relative">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-finance-blue to-emerald-500 flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-300">
                  <DollarSign className="h-8 w-8 text-white transform -rotate-12 group-hover:rotate-0" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Bem-vindo de volta
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Entre para gerenciar suas finanças
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-finance-blue transition-colors" />
                  <Input
                    type="email"
                    placeholder="Seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-finance-blue/20 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-finance-blue transition-colors" />
                  <Input
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-finance-blue/20 transition-all duration-300"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="link"
                    className="text-sm text-gray-600 hover:text-finance-blue dark:text-gray-400 p-0 h-auto"
                    onClick={() => navigate("/recuperar-senha")}
                  >
                    Esqueceu sua senha?
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-finance-blue to-emerald-500 hover:from-finance-blue/90 hover:to-emerald-500/90 text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  "Entrando..."
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                    ou
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => navigate("/criar-conta")}
              >
                Criar uma nova conta
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
