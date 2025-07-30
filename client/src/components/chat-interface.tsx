import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, Trash2, Bot, User, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { parseMarkdownText } from "../utils/markdown";

interface ChatInterfaceProps {
  video: {
    id: string;
    youtubeId: string;
    title: string;
  };
}

export default function ChatInterface({ video }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/videos", video.id, "chat"],
    enabled: !!video.id,
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", `/api/videos/${video.id}/chat`, { message });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos", video.id, "chat"] });
      setMessage("");
    },
    onError: (error: Error) => {
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
    <Card className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-secondary" />
            <span>Ask About This Video</span>
          </h2>
          <Button variant="ghost" size="sm" title="Clear Chat">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-1">Ask specific questions about the video content</p>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Welcome Message */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-50 rounded-lg rounded-tl-none p-3 max-w-xs">
              <p className="text-sm text-gray-700">
                Hi! I've analyzed the video. Ask me anything about the content, key concepts, or specific moments.
              </p>
              <span className="text-xs text-gray-500 mt-1 block">Just now</span>
            </div>
          </div>

          {/* Chat Messages */}
          {(messages as any[]).map((msg: any, index: number) => (
            <div key={msg.id}>
              {/* User Message */}
              <div className="flex items-start space-x-3 justify-end mb-4">
                <div className="bg-primary text-white rounded-lg rounded-tr-none p-3 max-w-xs">
                  <p className="text-sm">{msg.message}</p>
                  <span className="text-xs text-indigo-200 mt-1 block">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              </div>

              {/* AI Response */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-50 rounded-lg rounded-tl-none p-3 max-w-sm">
                  <div className="text-sm text-gray-700 mb-2">{parseMarkdownText(msg.response)}</div>
                  {msg.timestamps && msg.timestamps.length > 0 && (
                    <div className="flex items-center space-x-2 mb-2">
                      {msg.timestamps.map((timestamp: string, i: number) => (
                        <button
                          key={i}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center space-x-1"
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

          {/* Loading indicator */}
          {chatMutation.isPending && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-50 rounded-lg rounded-tl-none p-3">
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

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about the video..."
            disabled={chatMutation.isPending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={chatMutation.isPending || !message.trim()}
            className="bg-primary text-white hover:bg-indigo-700 transition-colors"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">Press Enter to send</p>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>Responses include video timestamps</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
