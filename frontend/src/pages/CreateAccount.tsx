
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, User, Mail, Lock, ArrowLeft } from "lucide-react";

const CreateAccount = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }
    
    if (!acceptTerms) {
      toast({
        title: "Termos não aceitos",
        description: "Você precisa aceitar os termos para criar uma conta.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    // Simulating account creation
    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", name);
      setLoading(false);
      
      toast({
        title: "Conta criada com sucesso",
        description: "Bem-vindo(a) à sua plataforma financeira.",
      });
      
      navigate("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50/50 dark:from-gray-900 dark:to-green-900/20 py-8">
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
                Crie sua conta
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Comece sua jornada financeira
              </p>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-5">
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-finance-blue transition-colors" />
                <Input
                  type="text"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-finance-blue/20 transition-all duration-300"
                />
              </div>

              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-finance-blue transition-colors" />
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-finance-blue/20 transition-all duration-300"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-finance-blue transition-colors" />
                <Input
                  type="password"
                  placeholder="Escolha uma senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-finance-blue/20 transition-all duration-300"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-finance-blue transition-colors" />
                <Input
                  type="password"
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-finance-blue/20 transition-all duration-300"
                />
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="mt-1"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  Li e aceito os{" "}
                  <Button variant="link" className="p-0 h-auto text-finance-blue">
                    Termos de Uso
                  </Button>{" "}
                  e a{" "}
                  <Button variant="link" className="p-0 h-auto text-finance-blue">
                    Política de Privacidade
                  </Button>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-finance-blue to-emerald-500 hover:from-finance-blue/90 hover:to-emerald-500/90 text-white font-medium"
                disabled={loading}
              >
                {loading ? "Criando conta..." : "Criar conta"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Voltar para o login
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreateAccount;
