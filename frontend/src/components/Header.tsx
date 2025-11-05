
import { User, LogOut, Moon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  title: string;
  showProfile?: boolean;
}

const Header = ({ title, showProfile = false }: HeaderProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  const handleLogout = () => {
    console.log("Logout executado");
    logout();
    navigate("/login");
  };
  
  const handleToggleDarkMode = () => {
    console.log("Dark mode toggle clicked");
    // Alterna a classe e persiste no localStorage
    const added = document.documentElement.classList.toggle('dark');
    try {
      localStorage.setItem('theme', added ? 'dark' : 'light');
    } catch {}
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
      {isMobile ? (
        <h1 className="text-xl font-bold text-finance-dark dark:text-white">
          {title}
        </h1>
      ) : (
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-finance-dark dark:text-white">
            {title}
          </h1>
        </div>
      )}
      
      {showProfile && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-10 h-10 rounded-full bg-finance-blue/10 flex items-center justify-center hover:bg-finance-blue/20 transition-colors focus:outline-none focus:ring-2 focus:ring-finance-blue/50">
              <User className="w-5 h-5 text-finance-blue" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <DropdownMenuItem 
              onClick={handleToggleDarkMode}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Moon className="mr-2 h-4 w-4" />
              <span>Modo Noturno</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default Header;