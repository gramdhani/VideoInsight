import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Eye, Calendar, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import type { Video } from "@shared/schema";

export default function Library() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos/user"],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Play className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-[var(--text-main)]">Welcome to Your Library</h2>
          <p className="text-[var(--text-secondary)] max-w-md">
            Sign in to access your analyzed videos and chat history.
          </p>
        </div>
        <Button asChild>
          <a href="/api/login">Sign In</a>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const hasVideos = videos && videos.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[var(--text-main)]">Your Library</h1>
        <p className="text-[var(--text-secondary)]">
          {hasVideos 
            ? `${videos.length} video${videos.length === 1 ? '' : 's'} analyzed`
            : "Start analyzing videos to build your library"
          }
        </p>
      </div>

      {!hasVideos ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Play className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-[var(--text-main)]">No videos yet</h2>
            <p className="text-[var(--text-secondary)] max-w-md">
              Start by analyzing a YouTube video to see it appear in your library with all your chat history and insights.
            </p>
          </div>
          <Button asChild>
            <Link href="/">
              <Play className="w-4 h-4 mr-2" />
              Analyze Your First Video
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Link key={video.id} href={`/video/${video.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardHeader className="p-4">
                  <CardTitle className="line-clamp-2 text-base leading-5 text-[var(--text-main)] group-hover:text-primary transition-colors">
                    {video.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-[var(--text-secondary)]">
                    {video.channel}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {video.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {video.createdAt ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }) : 'Recently'}
                    </div>
                  </div>
                  
                  {video.summary && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {video.summary.insights} insights
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {video.summary.readingTime}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 gap-1 transition-all">
                    View Analysis
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}