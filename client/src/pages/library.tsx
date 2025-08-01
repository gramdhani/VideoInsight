import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Library, Play, Clock, Eye, User, Lock, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Video } from "@shared/schema";

export default function LibraryPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  const deleteMutation = useMutation({
    mutationFn: async (videoId: string) => {
      return await apiRequest(`/api/videos/${videoId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Video deleted",
        description: "The video has been removed from your library.",
      });
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete video",
        variant: "destructive",
      });
    },
  });

  const handleVideoClick = (video: Video) => {
    // Redirect to summarize page with the video data
    setLocation(`/?video=${video.youtubeId}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, video: Video) => {
    e.stopPropagation(); // Prevent card click
    setVideoToDelete(video);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (videoToDelete) {
      deleteMutation.mutate(videoToDelete.id);
    }
  };

  // Show authentication required message if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Sign in required</h2>
          <p className="text-muted-foreground mb-6">
            You need to sign in to access your personal video library and AI-powered insights.
          </p>
          <Button onClick={() => window.location.href = '/api/login'} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your video library...</p>
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <Library className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No videos yet</h2>
          <p className="text-muted-foreground mb-6">
            Start by analyzing a YouTube video to build your personal library of AI-powered insights.
          </p>
          <Button onClick={() => setLocation("/")} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Analyze Your First Video
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Library className="h-8 w-8 text-primary" />
          Video Library
        </h1>
        <p className="text-muted-foreground">
          Your collection of analyzed videos with AI-powered insights and summaries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card 
            key={video.id} 
            className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-card border border-border"
            onClick={() => handleVideoClick(video)}
          >
            <CardContent className="p-0">
              {/* Thumbnail */}
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                  <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                
                {/* Delete button */}
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => handleDeleteClick(e, video)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Video
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200">
                  {video.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <User className="h-4 w-4" />
                  <span className="truncate">{video.channel}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{video.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{video.views}</span>
                  </div>
                </div>

                {/* Summary Stats */}
                {video.summary && (
                  <div className="flex gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {video.summary.keyPoints.length} key points
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {video.summary.readingTime}
                    </Badge>
                  </div>
                )}

                {/* Created Date */}
                <div className="text-xs text-muted-foreground">
                  Analyzed {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'recently'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{videoToDelete?.title}"? This will also remove all chat messages and AI analysis for this video. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}