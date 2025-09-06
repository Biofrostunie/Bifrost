
import { create } from 'zustand';
import { User } from './types';
import { apiFetch } from '@/lib/api';

interface UserStore {
  // Estado do store
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // === OPERAÇÕES CRUD ===
  
  // GET - Buscar dados do usuário
  getUser: () => Promise<void>;
  
  // PUT/PATCH - Atualizar dados do usuário
  updateUser: (userData: Partial<User>) => Promise<void>;
  updatePhone: (phone: string) => Promise<void>;
  
  // === GERENCIAMENTO DE ESTADO LOCAL ===
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  // Estado inicial
  user: null,
  loading: false,
  error: null,

  // === IMPLEMENTAÇÃO DAS OPERAÇÕES CRUD ===

  // GET - Endpoint: GET /api/user/:id
  // Busca os dados completos do usuário autenticado
  getUser: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const data = await apiFetch('/users/profile', { token });
      const userData = data.data;

      // Format the member since date from createdAt
      const formatMemberSince = (createdAt: string) => {
        const date = new Date(createdAt);
        const options: Intl.DateTimeFormatOptions = { 
          year: 'numeric', 
          month: 'long' 
        };
        return date.toLocaleDateString('pt-BR', options);
      };

      // Format risk tolerance for display
      const formatRiskTolerance = (riskTolerance: string) => {
        const riskMap: { [key: string]: string } = {
          'conservative': 'Perfil Conservador',
          'moderate': 'Perfil Moderado', 
          'aggressive': 'Perfil Arrojado'
        };
        return riskMap[riskTolerance] || 'Perfil não definido';
      };

      set({
        user: {
          id: userData.id,
          name: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          memberSince: userData.createdAt ? formatMemberSince(userData.createdAt) : 'Data não disponível',
          riskTolerance: userData.profile?.riskTolerance ? formatRiskTolerance(userData.profile.riskTolerance) : 'Perfil não definido'
        },
        loading: false
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao carregar dados do usuário', loading: false });
      throw error;
    }
  },

  // PUT/PATCH - Endpoint: PUT /api/user/:id
  // Atualiza dados parciais do usuário
  updateUser: async (userData: Partial<User>) => {
    set({ loading: true, error: null });
    try {
      const currentUser = get().user;
      if (!currentUser) {
        throw new Error('Usuário não encontrado');
      }
      const token = localStorage.getItem('token');
      const data = await apiFetch('/users', {
        method: 'PUT',
        token,
        body: JSON.stringify(userData)
      });

      const updatedUser = data.data;

      if (updatedUser.fullName) localStorage.setItem('userName', updatedUser.fullName);
      if (updatedUser.email) localStorage.setItem('userEmail', updatedUser.email);
      if (updatedUser.phone) localStorage.setItem('userPhone', updatedUser.phone);

      set({ user: { ...currentUser, ...updatedUser }, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao atualizar dados do usuário', loading: false });
      throw error;
    }
  },

  // PUT - Endpoint: PUT /api/user/:id/phone
  // Atualiza especificamente o telefone do usuário
  updatePhone: async (phone: string) => {
    // Reutiliza a função updateUser para manter consistência
    const { updateUser } = get();
    await updateUser({ phone });
  },

  // === FUNÇÕES DE GERENCIAMENTO DE ESTADO LOCAL ===
  // Estas funções não fazem chamadas para API, apenas atualizam o estado
  setUser: (user: User) => set({ user }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));