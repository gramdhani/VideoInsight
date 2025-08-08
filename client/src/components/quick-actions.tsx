import { Zap, MessageCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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

  // Fetch context-aware questions for this specific video
  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ["/api/videos", video.youtubeId, "quick-questions"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/videos/${video.youtubeId}/quick-questions`);
      return response.json();
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  const quickQuestionMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", `/api/videos/${video.id}/chat`, { 
        message: question 
      });
      return response.json();
    },
    onSuccess: (data, question) => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos", video.id, "chat"] });
      toast({
        title: "Question sent!",
        description: "Check the chat section for the AI response.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send question",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleQuestionClick = (question: string) => {
    quickQuestionMutation.mutate(question);
  };

  // Get questions from API response or fallback to loading state
  const questions = questionsData?.questions || [];

  return (
    <Card className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <span>Quick Questions</span>
        </h3>
        
        {questionsLoading ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span>Generating context-aware questions...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {questions.map((question: string, index: number) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleQuestionClick(question)}
                disabled={quickQuestionMutation.isPending}
                className="p-4 h-auto text-left border border-gray-200 hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-all group disabled:opacity-50"
                data-testid={`quick-question-${index}`}
              >
                <p className="text-sm font-medium text-gray-700 group-hover:text-primary whitespace-normal leading-relaxed">
                  {question}
                </p>
              </Button>
            ))}
          </div>
        )}
        
        {!questionsLoading && questions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Unable to generate questions for this video.</p>
            <p className="text-xs mt-1">Try refreshing the page.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
