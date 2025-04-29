
import { useState } from "react";
import { User, Edit, Mail, Phone, MapPin, Briefcase, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  occupation: string;
  about: string;
}

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfileData>({
    name: "Usuário",
    email: "usuario@exemplo.com",
    phone: "(11) 98765-4321",
    location: "São Paulo, SP",
    occupation: "Analista Financeiro",
    about: "Entusiasta de finanças pessoais e investimentos. Buscando sempre aprender mais sobre educação financeira."
  });

  const [formData, setFormData] = useState<UserProfileData>(profile);

  const handleEditClick = () => {
    setFormData(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("O nome não pode estar em branco");
      return;
    }
    
    setProfile(formData);
    setIsEditing(false);
    toast.success("Perfil atualizado com sucesso!");
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card className="p-6 mb-6">
      {!isEditing ? (
        <div>
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-finance-blue/10 flex items-center justify-center mr-4">
                <User className="w-8 h-8 text-finance-blue" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Olá, {profile.name}</h2>
                <p className="text-finance-gray">Bem-vindo ao Bifröst</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleEditClick}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center text-finance-gray">
              <Mail className="h-4 w-4 mr-2" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center text-finance-gray">
              <Phone className="h-4 w-4 mr-2" />
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-center text-finance-gray">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{profile.location}</span>
            </div>
            <div className="flex items-center text-finance-gray">
              <Briefcase className="h-4 w-4 mr-2" />
              <span>{profile.occupation}</span>
            </div>
            {profile.about && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm">{profile.about}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4">Editar Perfil</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input 
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="location">Localização</Label>
              <Input 
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="occupation">Ocupação</Label>
              <Input 
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="about">Sobre mim</Label>
              <Textarea 
                id="about"
                name="about"
                value={formData.about}
                onChange={handleChange}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default UserProfile;
