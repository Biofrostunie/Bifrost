
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ConceptSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ConceptSearch: React.FC<ConceptSearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Pesquisar conceitos financeiros..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default ConceptSearch;
