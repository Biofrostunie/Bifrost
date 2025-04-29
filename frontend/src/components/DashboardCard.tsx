
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
          "p-6 card-hover",
          "border-l-4",
          `border-l-${color}`
        )}
      >
        <div className="flex items-start">
          <div
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center mr-4",
              `bg-${color}/10`
            )}
          >
            <Icon className={cn("w-6 h-6", `text-${color}`)} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-finance-gray">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default DashboardCard;
