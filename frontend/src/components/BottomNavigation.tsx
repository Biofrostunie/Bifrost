import { Link, useLocation } from "react-router-dom";
import { Home, Calculator, BookOpen, TrendingUp, Lightbulb } from "lucide-react";

export const BottomNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <div data-tutorial="mobile-nav" className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-2 pb-[env(safe-area-inset-bottom)] flex justify-around items-center shadow-sm z-50">
      <Link
        to="/"
        data-tutorial="mobile-home"
        className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
          isActive("/") 
            ? "text-finance-blue bg-finance-blue/10" 
            : "text-finance-gray hover:text-finance-blue hover:bg-finance-blue/5"
        }`}
      >
        <Home className="h-6 w-6" />
        <span className="text-xs mt-1">Início</span>
      </Link>
      <Link
        to="/calculadora"
        data-tutorial="mobile-expense"
        className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
          isActive("/calculadora") 
            ? "text-finance-blue bg-finance-blue/10" 
            : "text-finance-gray hover:text-finance-blue hover:bg-finance-blue/5"
        }`}
      >
        <Calculator className="h-6 w-6" />
        <span className="text-xs mt-1">Gastos</span>
      </Link>
      <Link
        to="/investimentos"
        data-tutorial="mobile-investment"
        className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
          isActive("/investimentos") 
            ? "text-finance-teal bg-finance-teal/10" 
            : "text-finance-gray hover:text-finance-teal hover:bg-finance-teal/5"
        }`}
      >
        <TrendingUp className="h-6 w-6" />
        <span className="text-xs mt-1">Investir</span>
      </Link>
      <Link
        to="/educacao"
        data-tutorial="mobile-education"
        className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
          isActive("/educacao") 
            ? "text-finance-purple bg-finance-purple/10" 
            : "text-finance-gray hover:text-finance-purple hover:bg-finance-purple/5"
        }`}
      >
        <BookOpen className="h-6 w-6" />
        <span className="text-xs mt-1">Educação</span>
      </Link>
      <Link
        to="/conhecimento"
        data-tutorial="mobile-knowledge"
        className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
          isActive("/conhecimento") 
            ? "text-finance-blue bg-finance-blue/10" 
            : "text-finance-gray hover:text-finance-blue hover:bg-finance-blue/5"
        }`}
      >
        <Lightbulb className="h-6 w-6" />
        <span className="text-xs mt-1">Base</span>
      </Link>
    </div>
  );
}