import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, Wand2, AlertCircle, RefreshCw } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const analyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/videos/analyze", { url });
      return response.json();
    },
    onSuccess: (video) => {
      setError(null); // Clear any previous errors
      onVideoAnalyzed(video);
      toast({
        title: "Video analyzed successfully!",
        description: "Your AI summary and chat interface are ready.",
      });
    },
    onError: (error: Error) => {
      setError(error.message);
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
    setError(null); // Clear any previous errors when starting new analysis
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
        
        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                  Analysis Failed
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  {error}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
