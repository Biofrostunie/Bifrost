
import { User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  title: string;
  showProfile?: boolean;
}

const Header = ({ title, showProfile = false }: HeaderProps) => {
  const isMobile = useIsMobile();
  
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
        <div className="w-10 h-10 rounded-full bg-finance-blue/10 flex items-center justify-center">
          <User className="w-5 h-5 text-finance-blue" />
        </div>
      )}
    </div>
  );
};

export default Header;
