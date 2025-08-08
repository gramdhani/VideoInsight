import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageCircle,
  Send,
  Trash2,
  Bot,
  User,
  Play,
  Lightbulb,
  FileText,
  Clock,
  Hash,
  Zap,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AutoTextarea } from "@/components/ui/auto-textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { parseMarkdownText } from "../utils/markdown";

interface ChatInterfaceProps {
  video: {
    id: string;
    youtubeId: string;
    title: string;
    transcript?: string;
  };
  onTimestampClick?: (timestamp: string) => void;
}

export default function ChatInterface({
  video,
  onTimestampClick,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/videos", video.id, "chat"],
    queryFn: async () => {
      const response = await fetch(`/api/videos/${video.id}/chat`);
      if (!response.ok) {
        if (response.status === 401) {
          // Return empty array for unauthenticated users
          return [];
        }
        throw new Error('Failed to fetch messages');
      }
      return response.json();
    },
    enabled: !!video.id && isAuthenticated,
  });

  // Fetch context-aware questions for this specific video
  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ["/api/videos", video.youtubeId, "quick-questions"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/videos/${video.youtubeId}/quick-questions`);
      return response.json();
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    enabled: !!video.youtubeId,
  });

  const questions = questionsData?.questions || [];

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      setPendingMessage(message);
      const response = await apiRequest(
        "POST",
        `/api/videos/${video.id}/chat`,
        { message },
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/videos", video.id, "chat"],
      });
      setMessage("");
      setPendingMessage(null);
    },
    onError: (error: Error) => {
      setPendingMessage(null);
      toast({
        title: "Chat failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Scroll to bottom when messages change or component mounts
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      }
    };

    // Small delay to ensure DOM is updated
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, pendingMessage]);

  // Scroll to bottom when mutation is successful
  useEffect(() => {
    if (!chatMutation.isPending && !pendingMessage) {
      const scrollToBottom = () => {
        if (scrollAreaRef.current) {
          const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
          }
        }
      };
      setTimeout(scrollToBottom, 200);
    }
  }, [chatMutation.isPending, pendingMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    chatMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    // Allow Shift+Enter for new lines
  };

  return (
    <Card
      className={`modern-card shadow-modern flex flex-col ${
        isMobile
          ? "h-[500px] mobile-card-spacing mobile-chat-container mobile-chat-fix"
          : "h-[calc(100vh-4rem)]"
      }`}
    >
      {/* Chat Header */}
      <div className="border-b border-border p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <h2
            className={`${isMobile ? "text-base" : "text-lg"} font-semibold flex items-center space-x-2 text-foreground`}
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span>{isMobile ? "Ask AI" : "Ask About This Video"}</span>
          </h2>
          <Button
            variant="ghost"
            size="sm"
            title="Clear Chat"
            className="hover:bg-muted"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
      </div>

      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3 sm:p-4">
        <div className="space-y-3 sm:space-y-4">


          {/* Quick Questions - Only show when there are no messages */}
          {messages.length === 0 && !questionsLoading && questions.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground px-1">
                Start your video chat with these quick questions!
              </div>
              <div className="space-y-2">
                {questions.map((question: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setMessage(question)}
                    className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/20 transition-all text-sm leading-relaxed"
                    data-testid={`quick-question-${index}`}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading state for Quick Questions */}
          {messages.length === 0 && questionsLoading && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground px-1">
                Generating context-aware questions...
              </div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-full p-3 rounded-lg bg-muted/30 animate-pulse"
                  >
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mt-1"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {Array.isArray(messages) && messages.map((msg: any, index: number) => (
            <div key={msg.id}>
              {/* User Message */}
              <div className="flex items-start space-x-2 sm:space-x-3 justify-end mb-3 sm:mb-4">
                <div
                  className={`bg-primary text-white rounded-lg rounded-tr-none p-2 sm:p-3 ${isMobile ? "max-w-[85%]" : "max-w-xs"}`}
                >
                  <p className="text-xs sm:text-sm">{msg.message}</p>
                  <span className="text-xs text-indigo-200 mt-1 block">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                </div>
              </div>

              {/* AI Response */}
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div
                  className={`bg-muted rounded-lg rounded-tl-none p-3 sm:p-4 ${isMobile ? "max-w-[85%]" : "max-w-lg"}`}
                >
                  <div className="text-sm leading-relaxed">
                    {parseMarkdownText(msg.response, onTimestampClick)}
                  </div>
                  {msg.timestamps &&
                    msg.timestamps.length > 0 &&
                    !msg.response.match(/\[\d+:\d+\]/) && (
                      <div className="flex flex-wrap gap-1 mt-2 mb-2">
                        {!isMobile && (
                          <span className="text-xs text-muted-foreground mr-2">
                            Referenced timestamps:
                          </span>
                        )}
                        {msg.timestamps.map((timestamp: string, i: number) => (
                          <button
                            key={i}
                            onClick={() => {
                              console.log("Chat timestamp clicked:", timestamp);
                              onTimestampClick?.(timestamp);
                            }}
                            className="text-sm font-medium bg-purple-200 text-purple-800 px-4 py-2 rounded-full hover:bg-purple-300 transition-colors cursor-pointer border-0 outline-none"
                          >
                            {timestamp}
                          </button>
                        ))}
                      </div>
                    )}
                  <span className="text-xs text-muted-foreground mt-2 block">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Show pending user message immediately */}
          {pendingMessage && (
            <div className="flex items-start space-x-2 sm:space-x-3 justify-end">
              <div
                className={`bg-primary text-white rounded-lg rounded-tr-none p-2 sm:p-3 ${isMobile ? "max-w-[85%]" : "max-w-[70%]"}`}
              >
                <div className="text-xs sm:text-sm">{pendingMessage}</div>
                <span className="text-xs text-indigo-200 mt-2 block">
                  Sending...
                </span>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {chatMutation.isPending && (
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="bg-gray-50 rounded-lg rounded-tl-none p-2 sm:p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-3 sm:p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size={isMobile ? "sm" : "default"}
                disabled={chatMutation.isPending}
                className="flex-shrink-0"
              >
                <Zap className="w-4 h-4" />
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem
                onClick={() => setMessage("Give me a shorter summary of this video")}
                disabled={chatMutation.isPending}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Shorter Summary
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setMessage("What are the main action items from this video?")}
                disabled={chatMutation.isPending}
              >
                <FileText className="w-4 h-4 mr-2" />
                Action Items
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setMessage("What are the most important quotes from this video?")}
                disabled={chatMutation.isPending}
              >
                <Hash className="w-4 h-4 mr-2" />
                Key Quotes
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setMessage("Give me a detailed analysis of this video")}
                disabled={chatMutation.isPending}
              >
                <Clock className="w-4 h-4 mr-2" />
                Deep Analysis
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AutoTextarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              isMobile
                ? "Ask about the video..."
                : "Ask a question about the video..."
            }
            disabled={chatMutation.isPending}
            className="flex-1 text-sm"
            maxHeight={120}
          />
          <Button
            type="submit"
            disabled={chatMutation.isPending || !message.trim()}
            className="bg-primary text-white hover:bg-indigo-700 transition-colors"
            size={isMobile ? "sm" : "default"}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <div
          className={`flex items-center ${isMobile ? "justify-center" : "justify-between"} mt-2`}
        >
        </div>
      </div>
    </Card>
  );
}
