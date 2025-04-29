
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FinancialDetailsProps {
  title: string;
  description: string;
  details: string[];
  onBack: () => void;
}

const FinancialDetails = ({ 
  title, 
  description, 
  details, 
  onBack 
}: FinancialDetailsProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
      
      <div className="space-y-3">
        {details.map((detail, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
            {detail}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default FinancialDetails;
