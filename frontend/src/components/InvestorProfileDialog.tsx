import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Target, TrendingUp, Shield, AlertTriangle } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string; points: number }[];
}

const questions: Question[] = [
  {
    id: "age",
    question: "Qual é a sua faixa etária?",
    options: [
      { value: "18-25", label: "18-25 anos", points: 3 },
      { value: "26-35", label: "26-35 anos", points: 3 },
      { value: "36-50", label: "36-50 anos", points: 2 },
      { value: "51-65", label: "51-65 anos", points: 1 },
      { value: "65+", label: "Acima de 65 anos", points: 0 }
    ]
  },
  {
    id: "experience",
    question: "Qual é o seu nível de experiência em investimentos?",
    options: [
      { value: "none", label: "Nenhuma experiência", points: 0 },
      { value: "basic", label: "Experiência básica (poupança, CDB)", points: 1 },
      { value: "intermediate", label: "Experiência intermediária (fundos, ações)", points: 2 },
      { value: "advanced", label: "Experiência avançada (derivativos, day trade)", points: 3 }
    ]
  },
  {
    id: "objective",
    question: "Qual é o seu principal objetivo de investimento?",
    options: [
      { value: "preserve", label: "Preservar capital", points: 0 },
      { value: "income", label: "Gerar renda regular", points: 1 },
      { value: "grow", label: "Crescimento moderado", points: 2 },
      { value: "aggressive", label: "Crescimento agressivo", points: 3 }
    ]
  },
  {
    id: "timeHorizon",
    question: "Qual é o seu horizonte de investimento?",
    options: [
      { value: "short", label: "Curto prazo (até 1 ano)", points: 0 },
      { value: "medium", label: "Médio prazo (1-5 anos)", points: 1 },
      { value: "long", label: "Longo prazo (5-10 anos)", points: 2 },
      { value: "veryLong", label: "Muito longo prazo (mais de 10 anos)", points: 3 }
    ]
  },
  {
    id: "riskTolerance",
    question: "Como você reagiria a uma perda de 20% no seu investimento?",
    options: [
      { value: "panic", label: "Venderia imediatamente por medo", points: 0 },
      { value: "worried", label: "Ficaria muito preocupado", points: 1 },
      { value: "calm", label: "Manteria a calma e aguardaria", points: 2 },
      { value: "opportunity", label: "Veria como oportunidade de compra", points: 3 }
    ]
  },
  {
    id: "income",
    question: "Qual porcentagem da sua renda você pode destinar a investimentos?",
    options: [
      { value: "low", label: "Até 5%", points: 0 },
      { value: "moderate", label: "5% a 15%", points: 1 },
      { value: "good", label: "15% a 30%", points: 2 },
      { value: "high", label: "Mais de 30%", points: 3 }
    ]
  },
  {
    id: "knowledge",
    question: "Como você avalia seu conhecimento sobre o mercado financeiro?",
    options: [
      { value: "beginner", label: "Iniciante - pouco conhecimento", points: 0 },
      { value: "basic", label: "Básico - conceitos fundamentais", points: 1 },
      { value: "intermediate", label: "Intermediário - boa compreensão", points: 2 },
      { value: "expert", label: "Avançado - conhecimento amplo", points: 3 }
    ]
  }
];

interface InvestorProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (profile: string) => void;
}

const InvestorProfileDialog = ({ open, onOpenChange, onComplete }: InvestorProfileDialogProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [profile, setProfile] = useState<string>("");

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateProfile(newAnswers);
    }
  };

  const calculateProfile = (finalAnswers: Record<string, string>) => {
    let totalPoints = 0;
    
    questions.forEach((question) => {
      const answer = finalAnswers[question.id];
      const option = question.options.find(opt => opt.value === answer);
      if (option) totalPoints += option.points;
    });

    let resultProfile = "";
    if (totalPoints <= 7) {
      resultProfile = "Conservador";
    } else if (totalPoints <= 14) {
      resultProfile = "Moderado";
    } else {
      resultProfile = "Arrojado";
    }

    setProfile(resultProfile);
    setShowResult(true);
  };

  const handleComplete = () => {
    onComplete(profile);
    onOpenChange(false);
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  const getProfileIcon = () => {
    switch (profile) {
      case "Conservador":
        return <Shield className="h-12 w-12 text-blue-500" />;
      case "Moderado":
        return <Target className="h-12 w-12 text-yellow-500" />;
      case "Arrojado":
        return <TrendingUp className="h-12 w-12 text-green-500" />;
      default:
        return null;
    }
  };

  const getProfileDescription = () => {
    switch (profile) {
      case "Conservador":
        return "Você prioriza a segurança e preservação do capital. Investimentos de baixo risco como CDBs, Tesouro Direto e fundos DI são mais adequados ao seu perfil.";
      case "Moderado":
        return "Você busca um equilíbrio entre segurança e rentabilidade. Uma carteira mista com renda fixa e algumas ações pode ser interessante.";
      case "Arrojado":
        return "Você aceita maiores riscos em busca de rentabilidade superior. Ações, fundos de ações e investimentos alternativos fazem parte do seu perfil.";
      default:
        return "";
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {showResult ? "Seu Perfil de Investidor" : "Avaliação de Perfil de Investidor"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {showResult 
              ? "Baseado nas suas respostas, identificamos seu perfil:"
              : `Pergunta ${currentQuestion + 1} de ${questions.length}`
            }
          </DialogDescription>
        </DialogHeader>

        {!showResult ? (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {questions[currentQuestion].question}
              </h3>
              
              <RadioGroup onValueChange={handleAnswer} className="space-y-3">
                {questions[currentQuestion].options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleSkip}>
                Pular Avaliação
              </Button>
              <div className="text-sm text-muted-foreground">
                Progresso: {currentQuestion + 1}/{questions.length}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 text-center">
              <div className="flex justify-center mb-4">
                {getProfileIcon()}
              </div>
              <h3 className="text-2xl font-bold mb-2 text-primary">
                Perfil {profile}
              </h3>
              <p className="text-muted-foreground mb-4">
                {getProfileDescription()}
              </p>
            </Card>

            <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                    Importante:
                  </p>
                  <p className="text-amber-700 dark:text-amber-300">
                    Esta é apenas uma interpretação baseada nas suas respostas atuais. 
                    Seu perfil pode mudar com o tempo conforme sua experiência e objetivos evoluem. 
                    Sempre considere buscar orientação profissional antes de investir.
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleSkip}>
                Pular por Enquanto
              </Button>
              <Button onClick={handleComplete}>
                Salvar Perfil
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvestorProfileDialog;