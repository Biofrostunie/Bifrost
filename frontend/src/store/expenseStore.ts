
import { create } from 'zustand';
import { Expense } from './types';

interface ExpenseStore {
  // Estado do store
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  
  // === OPERAÇÕES CRUD ===
  
  // GET - Buscar despesas
  getExpenses: () => Promise<void>;
  
  // POST - Criar nova despesa
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  
  // PUT/PATCH - Atualizar despesa existente
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  
  // DELETE - Remover despesas
  removeExpense: (id: string) => Promise<void>;
  clearAllExpenses: () => Promise<void>;
  
  // === GERENCIAMENTO DE ESTADO LOCAL ===
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  // Estado inicial
  expenses: [],
  loading: false,
  error: null,

  // === IMPLEMENTAÇÃO DAS OPERAÇÕES CRUD ===

  // GET - Endpoint: GET /api/expenses
  // Busca todas as despesas do usuário autenticado
  getExpenses: async () => {
    set({ loading: true, error: null });
    try {
      // TODO: Substituir por chamada real da API
      // const response = await fetch('/api/expenses', {
      //   method: 'GET',
      //   headers: { 
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // const expenses = await response.json();
      
      // Simulação da busca no localStorage (temporário)
      const savedExpenses = localStorage.getItem('expenses');
      const expenses = savedExpenses ? JSON.parse(savedExpenses) : [];
      
      set({ expenses, loading: false });
    } catch (error) {
      // Tratamento de erro da API
      set({ error: 'Erro ao carregar despesas', loading: false });
    }
  },

  // POST - Endpoint: POST /api/expenses
  // Cria uma nova despesa
  addExpense: async (expenseData: Omit<Expense, 'id'>) => {
    set({ loading: true, error: null });
    try {
      // TODO: Substituir por chamada real da API
      // const response = await fetch('/api/expenses', {
      //   method: 'POST',
      //   headers: { 
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(expenseData)
      // });
      // const newExpense = await response.json();
      
      // Simulação da criação
      const newExpense: Expense = {
        ...expenseData,
        id: crypto.randomUUID(), // Em produção, o ID viria da API
      };
      
      const currentExpenses = get().expenses;
      const updatedExpenses = [...currentExpenses, newExpense];
      
      // Persistir no localStorage (temporário até implementar API)
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      
      set({ expenses: updatedExpenses, loading: false });
    } catch (error) {
      // Tratamento de erro da API
      set({ error: 'Erro ao adicionar despesa', loading: false });
    }
  },

  // PUT/PATCH - Endpoint: PUT /api/expenses/:id
  // Atualiza uma despesa existente
  updateExpense: async (id: string, expenseData: Partial<Expense>) => {
    set({ loading: true, error: null });
    try {
      // TODO: Substituir por chamada real da API
      // const response = await fetch(`/api/expenses/${id}`, {
      //   method: 'PUT',
      //   headers: { 
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(expenseData)
      // });
      // const updatedExpense = await response.json();
      
      // Simulação da atualização
      const currentExpenses = get().expenses;
      const updatedExpenses = currentExpenses.map(expense =>
        expense.id === id ? { ...expense, ...expenseData } : expense
      );
      
      // Persistir no localStorage (temporário até implementar API)
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      
      set({ expenses: updatedExpenses, loading: false });
    } catch (error) {
      // Tratamento de erro da API
      set({ error: 'Erro ao atualizar despesa', loading: false });
    }
  },

  // DELETE - Endpoint: DELETE /api/expenses/:id
  // Remove uma despesa específica
  removeExpense: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // TODO: Substituir por chamada real da API
      // const response = await fetch(`/api/expenses/${id}`, {
      //   method: 'DELETE',
      //   headers: { 
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // Simulação da remoção
      const currentExpenses = get().expenses;
      const updatedExpenses = currentExpenses.filter(expense => expense.id !== id);
      
      // Persistir no localStorage (temporário até implementar API)
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      
      set({ expenses: updatedExpenses, loading: false });
    } catch (error) {
      // Tratamento de erro da API
      set({ error: 'Erro ao remover despesa', loading: false });
    }
  },

  // DELETE - Endpoint: DELETE /api/expenses
  // Remove todas as despesas do usuário
  clearAllExpenses: async () => {
    set({ loading: true, error: null });
    try {
      // TODO: Substituir por chamada real da API
      // const response = await fetch('/api/expenses', {
      //   method: 'DELETE',
      //   headers: { 
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // Simulação da limpeza
      localStorage.removeItem('expenses');
      
      set({ expenses: [], loading: false });
    } catch (error) {
      // Tratamento de erro da API
      set({ error: 'Erro ao limpar despesas', loading: false });
    }
  },

  // === FUNÇÕES DE GERENCIAMENTO DE ESTADO LOCAL ===
  // Estas funções não fazem chamadas para API, apenas atualizam o estado
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));