
import { create } from 'zustand';
import { User, PasswordRecoveryState } from './types';

interface AuthStore {
  // Estado do store
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  passwordRecovery: PasswordRecoveryState;
  
  // === OPERAÇÕES CRUD ===
  
  // POST - Autenticação e criação
  login: (email: string, password: string) => Promise<void>;
  createAccount: (name: string, email: string, password: string) => Promise<void>;
  
  // POST - Recuperação de senha
  sendPasswordResetEmail: (email: string) => Promise<void>;
  verifyResetCode: (code: string) => Promise<void>;
  resetPassword: (newPassword: string, confirmPassword: string) => Promise<void>;
  
  // DELETE - Logout
  logout: () => void;
  
  // === GERENCIAMENTO DE ESTADO LOCAL ===
  setPasswordRecoveryStep: (step: PasswordRecoveryState['step']) => void;
  setPasswordRecoveryEmail: (email: string) => void;
  setPasswordRecoveryCode: (code: string) => void;
  clearPasswordRecovery: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Estado inicial
  isAuthenticated: localStorage.getItem('isLoggedIn') === 'true',
  user: null,
  loading: false,
  error: null,
  passwordRecovery: {
    email: '',
    step: 'email',
    verificationCode: '',
    loading: false,
    error: null,
  },

  // === IMPLEMENTAÇÃO DAS OPERAÇÕES CRUD ===

  // POST - Endpoint: POST /api/auth/login
  // Autentica o usuário com email e senha
  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      // TODO: Substituir por chamada real da API
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      
      // Simulação de tempo de resposta da API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulação da resposta da API
      const user: User = {
        id: '1',
        name: 'João Silva',
        email,
        phone: '',
        memberSince: 'Janeiro 2024'
      };
      
      // Persistir dados de autenticação
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', user.name);
      
      set({ 
        isAuthenticated: true, 
        user, 
        loading: false 
      });
    } catch (error) {
      // Tratamento de erro da API
      set({ error: 'Erro ao fazer login', loading: false });
    }
  },

  // POST - Endpoint: POST /api/auth/register
  // Cria uma nova conta de usuário
  createAccount: async (name: string, email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      // TODO: Substituir por chamada real da API
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password })
      // });
      
      // Simulação de tempo de resposta da API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulação da resposta da API
      const user: User = {
        id: '1',
        name,
        email,
        phone: '',
        memberSince: 'Janeiro 2024'
      };
      
      // Persistir dados de autenticação
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', name);
      
      set({ 
        isAuthenticated: true, 
        user, 
        loading: false 
      });
    } catch (error) {
      // Tratamento de erro da API
      set({ error: 'Erro ao criar conta', loading: false });
    }
  },

  // POST - Endpoint: POST /api/auth/forgot-password
  // Envia email de recuperação de senha
  sendPasswordResetEmail: async (email: string) => {
    set({ loading: true, error: null });
    try {
      // TODO: Substituir por chamada real da API
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
      // Simulação de tempo de resposta da API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Atualizar estado para próximo passo
      set((state) => ({
        loading: false,
        passwordRecovery: {
          ...state.passwordRecovery,
          email,
          step: 'code'
        }
      }));
    } catch (error) {
      // Tratamento de erro da API
      set({ error: 'Erro ao enviar email de recuperação', loading: false });
    }
  },

  // POST - Endpoint: POST /api/auth/verify-reset-code
  // Verifica código de recuperação de senha
  verifyResetCode: async (code: string) => {
    set({ loading: true, error: null });
    try {
      // TODO: Substituir por chamada real da API
      // const response = await fetch('/api/auth/verify-reset-code', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ code, email: get().passwordRecovery.email })
      // });
      
      // Simulação de tempo de resposta da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar estado para próximo passo
      set((state) => ({
        loading: false,
        passwordRecovery: {
          ...state.passwordRecovery,
          verificationCode: code,
          step: 'newPassword'
        }
      }));
    } catch (error) {
      // Tratamento de erro da API
      set({ error: 'Código inválido', loading: false });
    }
  },

  // PUT - Endpoint: PUT /api/auth/reset-password
  // Redefine a senha do usuário
  resetPassword: async (newPassword: string, confirmPassword: string) => {
    set({ loading: true, error: null });
    try {
      // Validação local antes de enviar para API
      if (newPassword !== confirmPassword) {
        throw new Error('Senhas não conferem');
      }
      
      // TODO: Substituir por chamada real da API
      // const { email, verificationCode } = get().passwordRecovery;
      // const response = await fetch('/api/auth/reset-password', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, code: verificationCode, newPassword })
      // });
      
      // Simulação de tempo de resposta da API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Limpar estado de recuperação após sucesso
      set({ 
        loading: false,
        passwordRecovery: {
          email: '',
          step: 'email',
          verificationCode: '',
          loading: false,
          error: null,
        }
      });
    } catch (error) {
      // Tratamento de erro da API
      set({ error: error instanceof Error ? error.message : 'Erro ao redefinir senha', loading: false });
    }
  },

  // DELETE - Endpoint: POST /api/auth/logout (ou limpeza local)
  // Remove autenticação do usuário
  logout: () => {
    // TODO: Adicionar chamada para invalidar token no servidor
    // await fetch('/api/auth/logout', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
    
    // Limpar dados locais de autenticação
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    
    // Resetar estado
    set({ 
      isAuthenticated: false, 
      user: null,
      error: null
    });
  },

  // === FUNÇÕES DE GERENCIAMENTO DE ESTADO LOCAL ===
  // Estas funções não fazem chamadas para API, apenas atualizam o estado
  setPasswordRecoveryStep: (step: PasswordRecoveryState['step']) => 
    set((state) => ({
      passwordRecovery: { ...state.passwordRecovery, step }
    })),
    
  setPasswordRecoveryEmail: (email: string) => 
    set((state) => ({
      passwordRecovery: { ...state.passwordRecovery, email }
    })),
    
  setPasswordRecoveryCode: (code: string) => 
    set((state) => ({
      passwordRecovery: { ...state.passwordRecovery, verificationCode: code }
    })),
    
  clearPasswordRecovery: () => 
    set({
      passwordRecovery: {
        email: '',
        step: 'email',
        verificationCode: '',
        loading: false,
        error: null,
      }
    }),

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));