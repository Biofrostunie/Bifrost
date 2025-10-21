
import { create } from 'zustand';
import { apiFetch } from '@/lib/api';
import type { Expense } from '@/pages/ExpenseCalculator';

interface ExpenseStore {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  getExpenses: () => Promise<void>;
  addExpense: (expenseData: Omit<Expense, 'id'>) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
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

  // DELETE - Endpoint: DELETE /api/expenses/:id
  removeExpense: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      await apiFetch(`/expenses/${id}`, { method: 'DELETE', token });
      set({ expenses: get().expenses.filter((e) => e.id !== id), loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao remover despesa', loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));