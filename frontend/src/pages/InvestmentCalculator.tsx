
import { useState } from "react";
import InvestmentSimulator from "@/components/InvestmentSimulator";
import { AppLayout } from "@/components/AppLayout";

const InvestmentCalculator = () => {
  return (
    <AppLayout title="Simulador de Investimentos">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-finance-dark dark:text-white">
          Simulador de Investimentos
        </h1>
        
        <InvestmentSimulator />
      </div>
    </AppLayout>
  );
};

export default InvestmentCalculator;
