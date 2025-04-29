
import { Card } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

export interface FinancialIndicatorProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  description: string;
}

const FinancialIndicator = ({
  title,
  value,
  change,
  isPositive,
  description,
}: FinancialIndicatorProps) => {
  return (
    <Card className="p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-600 dark:text-gray-300">{title}</h3>
        {isPositive ? (
          <div className="flex items-center text-emerald-600 dark:text-emerald-500">
            <TrendingDown className="h-4 w-4 mr-1" />
            <span className="text-xs">{change}</span>
          </div>
        ) : (
          <div className="flex items-center text-red-600 dark:text-red-500">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-xs">{change}</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-finance-dark dark:text-white mb-1">{value}</div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </Card>
  );
};

export default FinancialIndicator;
