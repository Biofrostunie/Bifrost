
import { FinancialConcept } from "@/types/FinancialConcept";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Youtube, BookOpen, Mic, BookText } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";

interface FinancialConceptCardProps {
  concept: FinancialConcept;
}

const FinancialConceptCard: React.FC<FinancialConceptCardProps> = ({ concept }) => {
  const [expanded, setExpanded] = useState(false);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="h-4 w-4 mr-2" />;
      case 'article':
        return <BookOpen className="h-4 w-4 mr-2" />;
      case 'podcast':
        return <Mic className="h-4 w-4 mr-2" />;
      case 'book':
        return <BookText className="h-4 w-4 mr-2" />;
      default:
        return <ChevronRight className="h-4 w-4 mr-2" />;
    }
  };

  const getRiskBadgeColor = (risk?: string) => {
    switch (risk) {
      case 'Baixo':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Médio':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Alto':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{concept.title}</CardTitle>
            <CardDescription className="mt-1">{concept.description}</CardDescription>
          </div>
          {concept.riskLevel && (
            <Badge className={getRiskBadgeColor(concept.riskLevel)}>
              Risco {concept.riskLevel}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expanded ? (
            <p className="text-sm text-gray-700 whitespace-pre-line">{concept.details}</p>
          ) : (
            <p className="text-sm text-gray-700 line-clamp-3">{concept.details}</p>
          )}
          {concept.details.length > 180 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpanded(!expanded)}
              className="mt-2 p-0 h-auto text-sm text-blue-600 hover:text-blue-800"
            >
              {expanded ? "Ver menos" : "Ver mais"}
            </Button>
          )}
          
          {(concept.expectedReturn || concept.timeframe) && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {concept.expectedReturn && (
                <div>
                  <p className="text-xs text-gray-500">Retorno esperado</p>
                  <p className="font-medium">{concept.expectedReturn}</p>
                </div>
              )}
              {concept.timeframe && (
                <div>
                  <p className="text-xs text-gray-500">Horizonte de tempo</p>
                  <p className="font-medium">{concept.timeframe}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="recommendations" className="border-none">
            <AccordionTrigger className="py-2 font-medium text-blue-600">
              Recomendações
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {concept.recommendations.map((rec, index) => (
                  <a 
                    key={index}
                    href={rec.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors text-sm"
                  >
                    {getPlatformIcon(rec.platform)}
                    <span>{rec.title}</span>
                  </a>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardFooter>
    </Card>
  );
};

export default FinancialConceptCard;
