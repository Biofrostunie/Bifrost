import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { DollarSign, Mail, ArrowLeft, CheckCircle2, Shield, Eye, EyeOff } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuthStore } from "@/store";

const PasswordRecovery = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    passwordRecovery,
    loading,
    error,
    sendPasswordResetEmail,
    verifyResetCode,
    resetPassword,
    setPasswordRecoveryStep,
    setPasswordRecoveryEmail,
    setPasswordRecoveryCode,
    clearError,
    clearPasswordRecovery
  } = useAuthStore();

  useEffect(() => {
    // Limpar estado ao montar o componente
    clearPasswordRecovery();
  }, [clearPasswordRecovery]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe seu e-mail cadastrado.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await sendPasswordResetEmail(email);
      toast({
        title: "Código enviado",
        description: "Verifique o código no seu email.",
      });
    } catch (error) {
      // O erro já é tratado no store
    }
  };

  const handleCodeVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordRecovery.verificationCode.length !== 5) {
      toast({
        title: "Código inválido",
        description: "Por favor, digite o código de 5 dígitos.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await verifyResetCode(passwordRecovery.verificationCode);
      toast({
        title: "Código verificado",
        description: "Agora você pode definir uma nova senha.",
      });
    } catch (error) {
      // O erro já é tratado no store
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Senha muito fraca",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await resetPassword(newPassword, confirmPassword);
      toast({
        title: "Senha alterada com sucesso",
        description: "Sua senha foi redefinida. Você já pode fazer login.",
      });
      navigate("/login");
    } catch (error) {
      // O erro já é tratado no store
    }
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
                {passwordRecovery.step === "email" && "Recuperar senha"}
                {passwordRecovery.step === "code" && "Verificar código"}
                {passwordRecovery.step === "newPassword" && "Nova senha"}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {passwordRecovery.step === "email" && "Não se preocupe, vamos te ajudar"}
                {passwordRecovery.step === "code" && "Digite o código enviado para seu e-mail"}
                {passwordRecovery.step === "newPassword" && "Defina sua nova senha"}
              </p>
            </div>

            {passwordRecovery.step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
                  Digite o e-mail associado à sua conta e enviaremos instruções para redefinir sua senha.
                </div>

                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-finance-blue transition-colors" />
                  <Input
                    type="email"
                    placeholder="Seu e-mail"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setPasswordRecoveryEmail(e.target.value);
                    }}
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
                  onClick={() => setPasswordRecoveryStep("email")}
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Voltar para o login
                </Button>
              </form>
            )}

            {passwordRecovery.step === "code" && (
              <form onSubmit={handleCodeVerification} className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-sm text-green-700 dark:text-green-300">
                  Enviamos um código de 5 dígitos para <strong>{email}</strong>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                    Código de verificação
                  </label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={5}
                      value={passwordRecovery.verificationCode}
                      onChange={(value) => setPasswordRecoveryCode(value)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-finance-blue to-emerald-500 hover:from-finance-blue/90 hover:to-emerald-500/90 text-white font-medium"
                  disabled={loading || passwordRecovery.verificationCode.length !== 5}
                >
                  {loading ? "Verificando..." : "Verificar código"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setPasswordRecoveryStep("email")}
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Voltar
                </Button>
              </form>
            )}

            {passwordRecovery.step === "newPassword" && (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Código verificado com sucesso!
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-finance-blue transition-colors" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nova senha"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-finance-blue/20 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  <div className="relative group">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-finance-blue transition-colors" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmar nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-finance-blue/20 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-finance-blue to-emerald-500 hover:from-finance-blue/90 hover:to-emerald-500/90 text-white font-medium"
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Redefinir senha"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setPasswordRecoveryStep("email")}
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Voltar para o login
                </Button>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PasswordRecovery;