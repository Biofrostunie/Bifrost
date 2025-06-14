
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail } from "lucide-react";

const UserProfile = () => {
  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-finance-blue/10 to-finance-teal/10 dark:from-slate-600/60 dark:to-slate-700/60 border-finance-blue/30 dark:border-slate-500/50">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16 border-2 border-finance-blue/30">
          <AvatarImage src="" alt="Usuário" />
          <AvatarFallback className="bg-finance-blue/20 text-finance-blue">
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1 dark:text-white">João Silva</h3>
          <div className="flex items-center text-finance-gray dark:text-gray-300 text-sm mb-1">
            <Mail className="h-4 w-4 mr-1" />
            joao.silva@email.com
          </div>
          <p className="text-sm text-finance-gray dark:text-gray-300">
            Membro desde Janeiro 2024
          </p>
        </div>
      </div>
    </Card>
  );
};

export default UserProfile;