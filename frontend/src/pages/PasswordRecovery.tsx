
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { DollarSign, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

const PasswordRecovery = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe seu e-mail cadastrado.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    // Simulating API call
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      
      toast({
        title: "Instruções enviadas",
        description: "Verifique seu e-mail para redefinir sua senha.",
      });
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
                Recuperar senha
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Não se preocupe, vamos te ajudar
              </p>
            </div>

            {!sent ? (
              <form onSubmit={handleRecovery} className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
                  Digite o e-mail associado à sua conta e enviaremos instruções para redefinir sua senha.
                </div>

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

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-finance-blue to-emerald-500 hover:from-finance-blue/90 hover:to-emerald-500/90 text-white font-medium"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar instruções"}
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
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    E-mail enviado com sucesso!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-2"
                  onClick={() => navigate("/login")}
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Voltar para o login
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PasswordRecovery;
