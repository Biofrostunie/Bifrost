
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Target, Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StandardSimulation from "./investment/StandardSimulation";
import GoalSimulation from "./investment/GoalSimulation";

const InvestmentSimulator = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    // Show disclaimer when component mounts
    const hasSeenDisclaimer = localStorage.getItem('investment-disclaimer-seen');
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleDisclaimerClose = () => {
    setShowDisclaimer(false);
    localStorage.setItem('investment-disclaimer-seen', 'true');
  };

  return (
    <div className="space-y-6">
      <AlertDialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Informação Importante
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-2">
              <p className="font-medium">
                Todas as simulações são baseadas em investimentos de renda fixa.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Os cálculos apresentados consideram juros compostos com rendimento fixo e são apenas para fins educacionais. 
                Rentabilidades passadas não garantem resultados futuros, e investimentos reais podem apresentar variações.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleDisclaimerClose}>
            Entendi
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <Tabs defaultValue="standard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="standard" className="text-sm sm:text-base">
            <Calculator className="h-4 w-4 mr-2" /> Simulação Padrão
          </TabsTrigger>
          <TabsTrigger value="goal" className="text-sm sm:text-base">
            <Target className="h-4 w-4 mr-2" /> Simulação com Meta
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="standard">
          <StandardSimulation />
        </TabsContent>
        
        <TabsContent value="goal">
          <GoalSimulation />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestmentSimulator;