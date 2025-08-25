import { Coffee, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  icon?: React.ReactNode;
}

export default function EmptyState({ 
  title, 
  description, 
  action, 
  icon = <Coffee className="w-12 h-12 text-coffee-400" />
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-neutral-400 mb-6 max-w-sm mx-auto">{description}</p>
      
      {action && (
        <Link href={action.href}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}
