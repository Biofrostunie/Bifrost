import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import FinancialConceptCard from "@/components/FinancialConceptCard";
import ConceptFilter from "@/components/ConceptFilter";
import ConceptSearch from "@/components/ConceptSearch";
import { financialConcepts } from "@/data/financialConcepts";

const KnowledgeBase = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConcepts = useMemo(() => {
    return financialConcepts.filter((concept) => {
      const matchesFilter = selectedFilter === "all" || concept.type === selectedFilter;
      const matchesSearch =
        concept.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        concept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        concept.details.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [selectedFilter, searchTerm]);

  return (
    <AppLayout title="Base de Conhecimento">
      <div className="w-full p-4 md:p-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold">Base de Conhecimento Financeira</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <ConceptSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <ConceptFilter
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              concepts={financialConcepts}
            />
          </div>
        </div>

        {filteredConcepts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredConcepts.map((concept) => (
              <FinancialConceptCard key={concept.id} concept={concept} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
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
