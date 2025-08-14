
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Edit3, Check, X, Receipt } from "lucide-react";
import { useUserStore } from "@/store";
import { toast } from "sonner";

const UserProfile = () => {
  const { user, loading, getUser, updatePhone } = useUserStore();
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");

  useEffect(() => {
    getUser();
  }, [getUser]);

  useEffect(() => {
    if (user?.phone) {
      setPhoneValue(user.phone);
    }
  }, [user]);

  const handleSavePhone = async () => {
    try {
      await updatePhone(phoneValue);
      setIsEditingPhone(false);
      toast.success("Telefone atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar telefone");
    }
  };

  const handleCancelEdit = () => {
    setPhoneValue(user?.phone || "");
    setIsEditingPhone(false);
  };

  if (loading) {
    return (
      <Card className="p-4 mb-6 bg-gradient-to-r from-finance-blue/10 to-finance-teal/10 dark:from-slate-600/60 dark:to-slate-700/60 border-finance-blue/30 dark:border-slate-500/50">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </Card>
    );
  }

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
          <h3 className="font-bold text-lg mb-1 dark:text-white">{user?.name || "João Silva"}</h3>

          <div className="flex items-center text-finance-gray dark:text-gray-300 text-sm mb-1">
            <Mail className="h-4 w-4 mr-1" />
            {user?.email || "joao.silva@email.com"}
          </div>

          <div className="flex items-center text-finance-gray dark:text-gray-300 text-sm mb-1">
            <Phone className="h-4 w-4 mr-1" />
            {isEditingPhone ? (
              <div className="flex items-center gap-2">
                <Input
                  value={phoneValue}
                  onChange={(e) => setPhoneValue(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="h-6 text-sm w-40"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={handleSavePhone}
                >
                  <Check className="h-3 w-3 text-green-600" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={handleCancelEdit}
                >
                  <X className="h-3 w-3 text-red-600" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{user?.phone || "Adicionar telefone"}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsEditingPhone(true)}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center text-finance-gray dark:text-gray-300 text-sm mb-1">
            <Receipt className="h-4 w-4 mr-1" />
            {"Perfil Arrojado"}
          </div>


          <p className="text-sm text-finance-gray dark:text-gray-300">
            Membro desde {user?.memberSince || "Janeiro 2024"}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default UserProfile;