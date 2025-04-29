
import { Link, useLocation } from "react-router-dom";
import { Home, Calculator, BookOpen, TrendingUp, Lightbulb } from "lucide-react";

export const BottomNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around items-center">
      <Link
        to="/"
        className={`flex flex-col items-center p-2 ${
          isActive("/") ? "text-finance-blue" : "text-finance-gray"
        }`}
      >
        <Home className="h-6 w-6" />
        <span className="text-xs mt-1">Início</span>
      </Link>
      <Link
        to="/calculadora"
        className={`flex flex-col items-center p-2 ${
          isActive("/calculadora") ? "text-finance-blue" : "text-finance-gray"
        }`}
      >
        <Calculator className="h-6 w-6" />
        <span className="text-xs mt-1">Gastos</span>
      </Link>
      <Link
        to="/investimentos"
        className={`flex flex-col items-center p-2 ${
          isActive("/investimentos") ? "text-finance-blue" : "text-finance-gray"
        }`}
      >
        <TrendingUp className="h-6 w-6" />
        <span className="text-xs mt-1">Investir</span>
      </Link>
      <Link
        to="/educacao"
        className={`flex flex-col items-center p-2 ${
          isActive("/educacao") ? "text-finance-blue" : "text-finance-gray"
        }`}
      >
        <BookOpen className="h-6 w-6" />
        <span className="text-xs mt-1">Educação</span>
      </Link>
      <Link
        to="/conhecimento"
        className={`flex flex-col items-center p-2 ${
          isActive("/conhecimento") ? "text-finance-blue" : "text-finance-gray"
        }`}
      >
        <Lightbulb className="h-6 w-6" />
        <span className="text-xs mt-1">Base</span>
      </Link>
    </div>
  );
}
