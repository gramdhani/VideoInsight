import { Zap, Minimize2, Maximize2, List, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface QuickActionsProps {
  video: {
    id: string;
    youtubeId: string;
    title: string;
    transcript?: string;
  };
}

export default function QuickActions({ video }: QuickActionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const quickActionMutation = useMutation({
    mutationFn: async (action: string) => {
      const prompt = getPromptForAction(action, video.title, video.transcript || '');
      const response = await apiRequest("POST", `/api/videos/${video.id}/chat`, { 
        message: prompt 
      });
      return response.json();
    },
    onSuccess: (data, action) => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos", video.id, "chat"] });
      toast({
        title: `${action} Generated`,
        description: "Check the chat section for your analysis.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getPromptForAction = (action: string, title: string, transcript: string) => {
    switch (action) {
      case "Shorter Summary":
        return "Please provide a concise 3-bullet point summary of the key takeaways from this video.";
      case "Detailed Analysis":
        return "Please provide a comprehensive analysis including: main themes, detailed insights, practical applications, and any tools or resources mentioned.";
      case "Action Items":
        return "Extract actionable steps, recommendations, or tasks that viewers should consider based on this video content.";
      case "Key Quotes":
        return "Identify the most impactful quotes, statements, or phrases from this video with their timestamps.";
      default:
        return `Generate ${action.toLowerCase()} for this video.`;
    }
  };

  const handleAction = (action: string) => {
    quickActionMutation.mutate(action);
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
              disabled={quickActionMutation.isPending}
              className="p-3 h-auto text-left border border-gray-200 hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-all group flex flex-col items-start space-y-2 disabled:opacity-50"
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
