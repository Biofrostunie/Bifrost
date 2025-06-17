
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, Mail, DollarSign } from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, loading, error, clearError } = useAuthStore();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  
  // Obter email da URL se disponível
  const emailFromUrl = searchParams.get('email');
  
  useEffect(() => {
    // Limpar erros anteriores ao montar o componente
    clearError();
    
    // Extrair o token da URL
    const token = searchParams.get('token');
    
    // Se não há token, mostrar instruções para verificar email
    if (!token) {
      if (!emailFromUrl) {
        setVerificationStatus('error');
      }
      return;
    }
    
    // Função para verificar o email
    const handleVerification = async () => {
      try {
        await verifyEmail(token);
        setVerificationStatus('success');
        
        // Redirecionar para login após 5 segundos
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Email verificado com sucesso! Faça login para continuar.' }
          });
        }, 5000);
      } catch (error) {
        setVerificationStatus('error');
      }
    };
    
    handleVerification();
  }, [searchParams, verifyEmail, clearError, navigate, emailFromUrl]);
  
  const renderContent = () => {
    // Se não há token mas há email, mostrar instruções
    if (!searchParams.get('token') && emailFromUrl) {
      return (
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-finance-blue to-emerald-500 flex items-center justify-center">
              <Mail className="h-10 w-10 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Verifique seu email
            </h2>
            <p className="text-gray-600 text-lg mb-4">
              Enviamos um link de verificação para:
            </p>
            <p className="font-semibold text-finance-blue text-lg mb-6">
              {emailFromUrl}
            </p>
            <p className="text-gray-600">
              Clique no link no email para ativar sua conta.
            </p>
          </div>
          
          <Alert className="text-left bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800">
              <strong>Não recebeu o email?</strong> Verifique sua caixa de spam ou entre em contato com nosso suporte.
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-3 justify-center pt-4">
            <Button 
              variant="outline"
              onClick={() => navigate('/criar-conta')}
              className="border-2"
            >
              Tentar Novamente
            </Button>
            <Button 
              onClick={() => navigate('/login')}
              className="bg-finance-blue hover:bg-finance-blue/90"
            >
              Voltar ao Login
            </Button>
          </div>
        </div>
      );
    }
    
    if (loading) {
      return (
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-finance-blue to-emerald-500 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Verificando seu email...
            </h2>
            <p className="text-gray-600 text-lg">
              Aguarde enquanto confirmamos sua conta.
            </p>
          </div>
        </div>
      );
    }
    
    if (verificationStatus === 'success') {
      return (
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Email verificado com sucesso!
            </h2>
            <p className="text-gray-600 text-lg mb-4">
              Sua conta foi ativada com sucesso.
            </p>
            <p className="text-sm text-gray-500">
              Você será redirecionado para o login em alguns segundos...
            </p>
          </div>
          <Button 
            onClick={() => navigate('/login')}
            className="bg-finance-blue hover:bg-finance-blue/90 px-8 py-3 text-lg"
          >
            Ir para Login
          </Button>
        </div>
      );
    }
    
    // Status de erro
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Erro na verificação
          </h2>
          <p className="text-gray-600 text-lg mb-4">
            {error || 'Token inválido ou expirado. Verifique se o link está correto.'}
          </p>
        </div>
        
        <Alert className="text-left bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-800">
            Se você continuar enfrentando problemas, entre em contato com nosso suporte 
            ou tente criar uma nova conta.
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-3 justify-center pt-4">
          <Button 
            variant="outline"
            onClick={() => navigate('/criar-conta')}
            className="border-2"
          >
            Criar Nova Conta
          </Button>
          <Button 
            onClick={() => navigate('/login')}
            className="bg-finance-blue hover:bg-finance-blue/90"
          >
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50/50 dark:from-gray-900 dark:to-green-900/20 p-4">
      <div className="w-full max-w-lg">
        <Card className="relative overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border-none shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 to-blue-100/20 dark:from-green-900/20 dark:to-blue-900/20" />
          
          <CardHeader className="text-center relative pb-6">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-finance-blue to-emerald-500 flex items-center justify-center transform rotate-12">
                <DollarSign className="h-6 w-6 text-white transform -rotate-12" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-finance-dark">
              Verificação de Email
            </CardTitle>
            <CardDescription className="text-base">
              Confirmando seu endereço de email
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative px-8 pb-8">
            {renderContent()}
            
            <div className="text-center text-sm text-gray-500 mt-8 pt-6 border-t border-gray-200">
              <Link 
                to="/login" 
                className="text-finance-blue hover:underline font-medium"
              >
                ← Voltar ao login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;