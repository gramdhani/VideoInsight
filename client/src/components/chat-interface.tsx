import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, Trash2, Bot, User, Play, Lightbulb, FileText, Clock, Hash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { parseMarkdownText } from "../utils/markdown";

interface ChatInterfaceProps {
  video: {
    id: string;
    youtubeId: string;
    title: string;
  };
  onTimestampClick?: (timestamp: string) => void;
}

export default function ChatInterface({ video, onTimestampClick }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/videos", video.id, "chat"],
    enabled: !!video.id,
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      setPendingMessage(message);
      const response = await apiRequest("POST", `/api/videos/${video.id}/chat`, { message });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos", video.id, "chat"] });
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
  };

  return (
    <Card className={`bg-[var(--card-bg)] rounded-xl shadow-sm border border-gray-200 flex flex-col ${
      isMobile ? 'h-[500px] mobile-card-spacing mobile-chat-container mobile-chat-fix' : 'max-h-[calc(100vh-3rem)]'
    }`}>
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold flex items-center space-x-2`}>
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
            <span>{isMobile ? "Ask AI" : "Ask About This Video"}</span>
          </h2>
          <Button variant="ghost" size="sm" title="Clear Chat">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        {!isMobile && (
          <p className="text-sm text-gray-600 mt-1">Ask specific questions about the video content</p>
        )}
      </div>

      {/* Chat Messages */}
      <ScrollArea className={`flex-1 p-3 sm:p-4 ${!isMobile ? 'max-h-[calc(100vh-12rem)]' : ''}`}>
        <div className="space-y-3 sm:space-y-4">
          {/* Welcome Message */}
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className={`bg-gray-50 rounded-lg rounded-tl-none p-2 sm:p-3 ${isMobile ? 'max-w-[85%]' : 'max-w-xs'}`}>
              <p className="text-xs sm:text-sm text-gray-700">
                {isMobile ? "Hi! Ask me anything about this video." : "Hi! I've analyzed the video. Ask me anything about the content, key concepts, or specific moments."}
              </p>
              <span className="text-xs text-gray-500 mt-1 block">Just now</span>
            </div>
          </div>

          {/* Chat Messages */}
          {(messages as any[]).map((msg: any, index: number) => (
            <div key={msg.id}>
              {/* User Message */}
              <div className="flex items-start space-x-2 sm:space-x-3 justify-end mb-3 sm:mb-4">
                <div className={`bg-primary text-white rounded-lg rounded-tr-none p-2 sm:p-3 ${isMobile ? 'max-w-[85%]' : 'max-w-xs'}`}>
                  <p className="text-xs sm:text-sm">{msg.message}</p>
                  <span className="text-xs text-indigo-200 mt-1 block">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </div>
              </div>

              {/* AI Response */}
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className={`bg-gray-50 rounded-lg rounded-tl-none p-2 sm:p-3 ${isMobile ? 'max-w-[85%]' : 'max-w-sm'}`}>
                  <div className="text-xs sm:text-sm text-gray-700 mb-2">{parseMarkdownText(msg.response, onTimestampClick)}</div>
                  {msg.timestamps && msg.timestamps.length > 0 && !msg.response.includes('[') && (
                    <div className="flex flex-wrap gap-1 mt-2 mb-2">
                      {!isMobile && <span className="text-xs text-gray-500 mr-2">Referenced timestamps:</span>}
                      {msg.timestamps.map((timestamp: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => {
                            console.log('Chat timestamp clicked:', timestamp);
                            onTimestampClick?.(timestamp);
                          }}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <Play className="w-2 h-2" />
                          <span>{timestamp}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-gray-500 mt-2 block">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Show pending user message immediately */}
          {pendingMessage && (
            <div className="flex items-start space-x-2 sm:space-x-3 justify-end">
              <div className={`bg-primary text-white rounded-lg rounded-tr-none p-2 sm:p-3 ${isMobile ? 'max-w-[85%]' : 'max-w-[70%]'}`}>
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
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 p-3 sm:p-4">
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2'} gap-2 mb-3 sm:mb-4`}>
          <Button 
            variant="outline" 
            size="sm"
            className={`${isMobile ? 'text-xs h-7' : 'text-xs h-8'}`}
            onClick={() => setMessage("Give me a shorter summary of this video")}
            disabled={chatMutation.isPending}
          >
            <Lightbulb className="w-3 h-3 mr-1" />
            {isMobile ? "Summary" : "Shorter Summary"}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={`${isMobile ? 'text-xs h-7' : 'text-xs h-8'}`}
            onClick={() => setMessage("What are the main action items from this video?")}
            disabled={chatMutation.isPending}
          >
            <FileText className="w-3 h-3 mr-1" />
            {isMobile ? "Actions" : "Action Items"}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={`${isMobile ? 'text-xs h-7' : 'text-xs h-8'}`}
            onClick={() => setMessage("What are the most important quotes from this video?")}
            disabled={chatMutation.isPending}
          >
            <Hash className="w-3 h-3 mr-1" />
            {isMobile ? "Quotes" : "Key Quotes"}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={`${isMobile ? 'text-xs h-7' : 'text-xs h-8'}`}
            onClick={() => setMessage("Give me a detailed analysis of this video")}
            disabled={chatMutation.isPending}
          >
            <Clock className="w-3 h-3 mr-1" />
            {isMobile ? "Analysis" : "Deep Analysis"}
          </Button>
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isMobile ? "Ask about the video..." : "Ask a question about the video..."}
            disabled={chatMutation.isPending}
            className="flex-1 text-sm"
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
        <div className={`flex items-center ${isMobile ? 'justify-center' : 'justify-between'} mt-2`}>
          {!isMobile && <p className="text-xs text-gray-500">Press Enter to send</p>}
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{isMobile ? "Includes timestamps" : "Responses include video timestamps"}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
