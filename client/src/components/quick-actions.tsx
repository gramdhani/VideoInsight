import { Zap, Minimize2, Maximize2, List, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface QuickActionsProps {
  video: any;
}

export default function QuickActions({ video }: QuickActionsProps) {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: `${action} requested`,
      description: "This feature would generate additional analysis.",
    });
  };

  const actions = [
    {
      icon: Minimize2,
      label: "Shorter Summary",
      action: "Shorter Summary",
    },
    {
      icon: Maximize2,
      label: "Detailed Analysis",
      action: "Detailed Analysis",
    },
    {
      icon: List,
      label: "Action Items",
      action: "Action Items",
    },
    {
      icon: Quote,
      label: "Key Quotes",
      action: "Key Quotes",
    },
  ];

  return (
    <Card className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-primary" />
          <span>Quick Actions</span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => handleAction(item.action)}
              className="p-3 h-auto text-left border border-gray-200 hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-all group flex flex-col items-start space-y-2"
            >
              <item.icon className="w-4 h-4 text-gray-600 group-hover:text-primary" />
              <p className="text-sm font-medium text-gray-700 group-hover:text-primary">
                {item.label}
              </p>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
