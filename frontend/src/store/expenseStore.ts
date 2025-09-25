
import { create } from 'zustand';
import { Expense } from './types';
import { apiFetch } from '@/lib/api';

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
      const token = localStorage.getItem('token');
      const data = await apiFetch('/expenses', { token });
      set({ expenses: data.data ?? [], loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao carregar despesas', loading: false });
      throw error;
    }
  },

  // POST - Endpoint: POST /api/expenses
  // Cria uma nova despesa
  addExpense: async (expenseData: Omit<Expense, 'id'>) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const data = await apiFetch('/expenses', {
        method: 'POST',
        token,
        body: JSON.stringify(expenseData)
      });

      const newExpense: Expense = data.data;
      set({ expenses: [...get().expenses, newExpense], loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao adicionar despesa', loading: false });
      throw error;
    }
  },

  // PUT/PATCH - Endpoint: PUT /api/expenses/:id
  // Atualiza uma despesa existente
  updateExpense: async (id: string, expenseData: Partial<Expense>) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const data = await apiFetch(`/expenses/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(expenseData)
      });

      const updatedExpense: Expense = data.data;
      const currentExpenses = get().expenses;
      const updatedExpenses = currentExpenses.map(expense =>
        expense.id === id ? updatedExpense : expense
      );

      set({ expenses: updatedExpenses, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao atualizar despesa', loading: false });
      throw error;
    }
  },

  // DELETE - Endpoint: DELETE /api/expenses/:id
  // Remove uma despesa específica
  removeExpense: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      await apiFetch(`/expenses/${id}`, { method: 'DELETE', token });

      const currentExpenses = get().expenses;
      const updatedExpenses = currentExpenses.filter(expense => expense.id !== id);

      set({ expenses: updatedExpenses, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao remover despesa', loading: false });
      throw error;
    }
  },

  // DELETE - Endpoint: DELETE /api/expenses
  // Remove todas as despesas do usuário
  clearAllExpenses: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      await apiFetch('/expenses', { method: 'DELETE', token });
      set({ expenses: [], loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao limpar despesas', loading: false });
      throw error;
    }
  },

  // === FUNÇÕES DE GERENCIAMENTO DE ESTADO LOCAL ===
  // Estas funções não fazem chamadas para API, apenas atualizam o estado
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));