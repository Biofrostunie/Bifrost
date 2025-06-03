
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  description: string;
  Icon: LucideIcon;
  to: string;
  color: string;
}

const DashboardCard = ({
  title,
  description,
  Icon,
  to,
  color,
}: DashboardCardProps) => {
  return (
    <Link to={to}>
      <Card
        className={cn(
          "p-6 card-hover h-full min-h-[140px]", // Altura mínima uniforme
          "border-l-4 flex flex-col",
          `border-l-${color}`
        )}
      >
        <div className="flex items-start flex-1">
          <div
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center mr-4 shrink-0",
              `bg-${color}/10`
            )}
          >
            <Icon className={cn("w-6 h-6", `text-${color}`)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-2 leading-tight">{title}</h3>
            <p className="text-sm text-finance-gray leading-relaxed">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default DashboardCard;
