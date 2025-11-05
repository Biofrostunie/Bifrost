import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import InvestmentSimulator from "@/components/InvestmentSimulator";

const InvestmentCalculator = () => {
  return (
    <AppLayout title="Simulador de Investimentos">
      <div className="w-full p-4 md:p-0" data-tutorial="investment-simulator">
        <InvestmentSimulator />
      </div>
    </AppLayout>
  );
};

export default InvestmentCalculator;
