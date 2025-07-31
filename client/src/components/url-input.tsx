import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UrlInputProps {
  onVideoAnalyzed: (video: any) => void;
  show?: boolean;
}

export default function UrlInput({ onVideoAnalyzed, show = true }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const analyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/videos/analyze", { url });
      return response.json();
    },
    onSuccess: (video) => {
      onVideoAnalyzed(video);
      toast({
        title: "Video analyzed successfully!",
        description: "Your AI summary and chat interface are ready.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a YouTube video URL",
        variant: "destructive",
      });
      return;
    }
    analyzeMutation.mutate(url);
  };

  if (!show) return null;

  return (
    <Card className="modern-card shadow-modern mb-6 sm:mb-8">
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className={`${isMobile ? 'space-y-4' : 'flex flex-col md:flex-row gap-4'}`}>
          <div className="flex-1">
            <Label htmlFor="youtube-url" className={`block ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-foreground mb-2`}>
              YouTube Video URL
            </Label>
            <div className="relative">
              <Input
                id="youtube-url"
                type="url"
                placeholder={isMobile ? "Paste YouTube URL..." : "https://www.youtube.com/watch?v=..."}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="modern-input pl-10 text-sm"
                disabled={analyzeMutation.isPending}
              />
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <div className={`${isMobile ? '' : 'flex items-end'}`}>
            <Button
              type="submit"
              disabled={analyzeMutation.isPending}
              className={`modern-button flex items-center space-x-2 ${
                isMobile ? 'w-full justify-center' : ''
              }`}
              size={isMobile ? "default" : "default"}
            >
              {analyzeMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>{isMobile ? "Analyze Video" : "Analyze Video"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
