import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import FinancialConceptCard from "@/components/FinancialConceptCard";
import ConceptFilter from "@/components/ConceptFilter";
import ConceptSearch from "@/components/ConceptSearch";
import { financialConcepts } from "@/data/financialConcepts";
import { Lightbulb } from "lucide-react";

const KnowledgeBase = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConcepts = useMemo(() => {
    return financialConcepts.filter((concept) => {
      // First apply the type filter
      const matchesFilter = selectedFilter === "all" || concept.type === selectedFilter;
      
      // Then apply the search filter
      const matchesSearch = 
        concept.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        concept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        concept.details.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [selectedFilter, searchTerm]);

  return (
    <AppLayout title="Base de Conhecimento">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-bold text-finance-dark dark:text-white">
            Base de Conhecimento Financeiro
          </h1>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Explore conceitos financeiros importantes, entenda como funcionam e acesse recursos educacionais selecionados para ampliar seu conhecimento.
        </p>
        
        <div className="bg-white dark:bg-slate-700/60 rounded-lg p-6 mb-6 border border-gray-200 dark:border-slate-500/50">
          <ConceptSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
        
        <div className="bg-white dark:bg-slate-700/60 rounded-lg p-6 mb-6 border border-gray-200 dark:border-slate-500/50">
          <ConceptFilter 
            selectedFilter={selectedFilter} 
            setSelectedFilter={setSelectedFilter}
            concepts={financialConcepts}
          />
        </div>
        
        {filteredConcepts.length > 0 ? (
          <div className="space-y-6">
            {filteredConcepts.map((concept) => (
              <div key={concept.id} className="bg-white dark:bg-slate-700/60 rounded-lg border border-gray-200 dark:border-slate-500/50">
                <FinancialConceptCard concept={concept} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-700/60 rounded-lg border border-gray-200 dark:border-slate-500/50">
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Nenhum conceito encontrado para essa busca.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default KnowledgeBase;
