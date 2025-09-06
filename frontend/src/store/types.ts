
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    memberSince: string;
    riskTolerance?: string;
  }
  
  export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    error: string | null;
  }
  
  export interface ExpenseState {
    expenses: Expense[];
    loading: boolean;
    error: string | null;
  }
  
  export interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    essential: boolean;
    notes?: string;
  }
  
  export interface PasswordRecoveryState {
    email: string;
    step: 'email' | 'code' | 'newPassword';
    verificationCode: string;
    loading: boolean;
    error: string | null;
  }