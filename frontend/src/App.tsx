
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Home from "./pages/Home";
import ExpenseCalculator from "./pages/ExpenseCalculator";
import FinancialEducation from "./pages/FinancialEducation";
import InvestmentCalculator from "./pages/InvestmentCalculator";
import KnowledgeBase from "./pages/KnowledgeBase";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import PasswordRecovery from "./pages/PasswordRecovery";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SidebarProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/criar-conta" element={<CreateAccount />} />
            <Route path="/recuperar-senha" element={<PasswordRecovery />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/calculadora" element={<ExpenseCalculator />} />
              <Route path="/educacao" element={<FinancialEducation />} />
              <Route path="/investimentos" element={<InvestmentCalculator />} />
              <Route path="/conhecimento" element={<KnowledgeBase />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
