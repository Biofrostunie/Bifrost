import { create } from 'zustand';
import { User, PasswordRecoveryState } from './types';
import { apiFetch } from '@/lib/api';

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
  
  // POST - Verificação de email
  verifyEmail: (token: string) => Promise<void>;
  
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
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      const { access_token, user } = data.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.fullName);

      set({
        isAuthenticated: true,
        user: {
          id: user.id,
          name: user.fullName,
          email: user.email,
          phone: user.phone ?? '',
          memberSince: user.memberSince ?? ''
        },
        loading: false
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao fazer login', loading: false });
      throw error;
    }
  },

  // POST - Endpoint: POST /api/auth/register
  // Cria uma nova conta de usuário (MODIFICADO - não faz login automático)
  createAccount: async (name: string, email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName: name, email, password })
      });

      set({ loading: false, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao criar conta', loading: false });
      throw error;
    }
  },

  // POST - Endpoint: POST /api/auth/verify-email
  // Verifica o email do usuário através do token recebido por email
  verifyEmail: async (token: string) => {
    set({ loading: true, error: null });
    try {
      await apiFetch('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token })
      });

      set({ loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao verificar email';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // POST - Endpoint: POST /api/auth/forgot-password
  // Envia email de recuperação de senha
  sendPasswordResetEmail: async (email: string) => {
    set({ loading: true, error: null });
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      set((state) => ({
        loading: false,
        passwordRecovery: {
          ...state.passwordRecovery,
          email,
          step: 'code'
        }
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao enviar email de recuperação', loading: false });
      throw error;
    }
  },

  // POST - Endpoint: POST /api/auth/verify-reset-code
  // Verifica código de recuperação de senha
  verifyResetCode: async (code: string) => {
    set((state) => ({
      loading: false,
      passwordRecovery: {
        ...state.passwordRecovery,
        verificationCode: code,
        step: 'newPassword'
      }
    }));
  },

  // PUT - Endpoint: PUT /api/auth/reset-password
  // Redefine a senha do usuário
  resetPassword: async (newPassword: string, confirmPassword: string) => {
    set({ loading: true, error: null });
    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Senhas não conferem');
      }

      const { verificationCode } = get().passwordRecovery;

      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: verificationCode, newPassword })
      });

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
      set({ error: error instanceof Error ? error.message : 'Erro ao redefinir senha', loading: false });
      throw error;
    }
  },

  // DELETE - Endpoint: POST /api/auth/logout (ou limpeza local)
  // Remove autenticação do usuário
  logout: () => {
    localStorage.removeItem('token');
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