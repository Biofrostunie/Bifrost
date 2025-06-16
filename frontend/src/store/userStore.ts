
import { create } from 'zustand';
import { User } from './types';

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
      // TODO: Substituir por chamada real da API
      // const response = await fetch('/api/user/me', {
      //   method: 'GET',
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      
      // Simulação da resposta da API
      const userData = {
        id: '1',
        name: localStorage.getItem('userName') || 'João Silva',
        email: localStorage.getItem('userEmail') || 'joao.silva@email.com',
        phone: localStorage.getItem('userPhone') || '',
        memberSince: 'Janeiro 2024'
      };
      
      set({ user: userData, loading: false });
    } catch (error) {
      // Tratamento de erro da API
      set({ error: 'Erro ao carregar dados do usuário', loading: false });
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

      // TODO: Substituir por chamada real da API
      // const response = await fetch(`/api/user/${currentUser.id}`, {
      //   method: 'PUT',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}` 
      //   },
      //   body: JSON.stringify(userData)
      // });
      
      // Simulação da atualização
      const updatedUser = { ...currentUser, ...userData };
      
      // Persistir no localStorage (temporário até implementar API)
      if (userData.name) localStorage.setItem('userName', userData.name);
      if (userData.email) localStorage.setItem('userEmail', userData.email);
      if (userData.phone) localStorage.setItem('userPhone', userData.phone);
      
      set({ user: updatedUser, loading: false });
    } catch (error) {
      // Tratamento de erro da API
      set({ error: 'Erro ao atualizar dados do usuário', loading: false });
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