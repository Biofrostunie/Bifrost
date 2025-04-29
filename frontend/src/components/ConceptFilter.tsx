
import { Button } from "@/components/ui/button";
import { FinancialConcept } from "@/types/FinancialConcept";

interface ConceptFilterProps {
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  concepts: FinancialConcept[];
}

const ConceptFilter: React.FC<ConceptFilterProps> = ({ 
  selectedFilter, 
  setSelectedFilter,
  concepts 
}) => {
  const filters = [
    { id: "all", label: "Todos" },
    { id: "fixedIncome", label: "Renda Fixa" },
    { id: "index", label: "Índices" },
    { id: "retirement", label: "Aposentadoria" },
    { id: "other", label: "Outros" }
  ];
  
  // Only show filters that have at least one concept
  const availableFilters = filters.filter(filter => {
    if (filter.id === "all") return true;
    return concepts.some(concept => concept.type === filter.id);
  });

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {availableFilters.map((filter) => (
        <Button
          key={filter.id}
          variant={selectedFilter === filter.id ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter(filter.id)}
          className="px-3 py-1 h-auto"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};

export default ConceptFilter;
