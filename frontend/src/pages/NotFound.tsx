
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";

const NotFound = () => {
  return (
    <AppLayout title="Página não encontrada">
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8">Página não encontrada</p>
        <Button asChild>
          <Link to="/">Voltar para Home</Link>
        </Button>
      </div>
    </AppLayout>
  );
};

export default NotFound;
