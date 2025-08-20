import { useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Clock, Eye, User, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useVideo } from "@/contexts/VideoContext";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "../components/header";
import UrlInput from "../components/url-input";
import VideoPlayer, { VideoPlayerRef } from "../components/video-player";
import TabbedContent from "../components/tabbed-content";
import ChatInterface from "../components/chat-interface";
import NotesExport from "../components/notes-export";

import AuthPaywall from "../components/auth-paywall";
import type { Video } from "@shared/schema";

export default function Home() {
  const { currentVideo, setCurrentVideo } = useVideo();
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  const [, setLocation] = useLocation();

  // Check for video parameter from Library
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('video');

  // Load video if coming from Library
  const { data: libraryVideo } = useQuery<Video>({
    queryKey: ["/api/videos/id", videoId],
    enabled: !!videoId,
  });

  // Fetch latest 3 videos for authenticated users
  const { data: latestVideos } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
    enabled: isAuthenticated && !currentVideo, // Only fetch when authenticated and no current video
    select: (data) => data?.slice(0, 3), // Limit to 3 latest videos
  });

  // Auto-load video from Library when available
  useEffect(() => {
    if (libraryVideo && libraryVideo.summary) {
      // Always set the video, even if currentVideo exists (to override any cached video)
      setCurrentVideo(libraryVideo);
      // Clear the URL parameter to clean up the URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [libraryVideo, setCurrentVideo]);

  const handleTimestampClick = (timestamp: string) => {
    console.log("Timestamp clicked:", timestamp);

    // Parse timestamp (e.g., "2:35" or "1:23:45") to seconds
    const timeToSeconds = (timeStr: string): number => {
      const parts = timeStr.split(":").map(Number);
      if (parts.length === 2) {
        return parts[0] * 60 + parts[1]; // MM:SS
      } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
      }
      return 0;
    };

    const seconds = timeToSeconds(timestamp);
    console.log("Jumping to seconds:", seconds);
    videoPlayerRef.current?.jumpToTime(seconds);
  };

  const handleLatestVideoClick = (video: Video) => {
    setCurrentVideo(video);
  };

  return (
    <div className="space-y-6">
      {/* Desktop layout with sidebar, mobile keeps header */}
      {isMobile && <Header currentPage="home" />}

      {/* Main Content */}
      <div
        className={
          isMobile ? "max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8" : ""
        }
      >
        {/* URL Input - Only visible when no video is loaded */}
        <UrlInput onVideoAnalyzed={setCurrentVideo} show={!currentVideo} />

        {/* Latest 3 Videos Section - Only show when authenticated and no current video */}
        {isAuthenticated && !currentVideo && latestVideos && latestVideos.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Summaries</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation("/library")}
                className="text-primary hover:text-primary/80"
                data-testid="link-view-all"
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {latestVideos.map((video) => (
                <Card 
                  key={video.id} 
                  className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1 bg-card border border-border"
                  onClick={() => handleLatestVideoClick(video)}
                  data-testid={`card-recent-video-${video.id}`}
                >
                  <CardContent className="p-0">
                    {/* Thumbnail */}
                    <div className="relative overflow-hidden rounded-t-lg aspect-video">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                        <Play className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h3 className="font-medium line-clamp-2 text-sm mb-2 group-hover:text-primary transition-colors duration-200">
                        {video.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <User className="h-3 w-3" />
                        <span className="truncate">{video.channel}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{video.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{video.views}</span>
                        </div>
                      </div>

                      {/* Summary Stats */}
                      {video.summary && (
                        <div className="flex gap-1 mb-2">
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {video.summary.keyTakeaways?.length || 0} takeaways
                          </Badge>
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {video.summary.readingTime}
                          </Badge>
                        </div>
                      )}

                      {/* Created Date */}
                      <div className="text-xs text-muted-foreground">
                        {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'recently'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Responsive Layout */}
        {currentVideo && currentVideo.summary && (
          <div
            className={`${
              isMobile 
                ? "space-y-4 mobile-fade-in" 
                : "grid lg:grid-cols-2 gap-8"
            }`}
          >
            {/* Left Column / Mobile Stack */}
            <div className={`space-y-4 sm:space-y-6 ${isMobile ? "mobile-padding" : ""}`}>
              <VideoPlayer ref={videoPlayerRef} video={currentVideo} />
              <TabbedContent
                video={{
                  id: currentVideo.id,
                  title: currentVideo.title,
                  youtubeId: currentVideo.youtubeId,
                  transcript: currentVideo.transcript || undefined,
                  transcriptData: currentVideo.transcriptData || undefined,
                  summary: currentVideo.summary,
                }}
                onTimestampClick={handleTimestampClick}
              />
            </div>

            {/* Right Column - Sticky Chat on Desktop, Inline on Mobile */}
            <div
              className={`space-y-4 sm:space-y-6 ${
                isMobile ? "pb-16 mobile-padding" : ""
              }`}
            >

              <div
                className={
                  isMobile
                    ? "mobile-safe-area mobile-chat-fix"
                    : "sticky top-8 max-h-[calc(100vh-6rem)]"
                }
              >
                {isAuthenticated ? (
                  <ChatInterface
                    video={{
                      id: currentVideo.id,
                      youtubeId: currentVideo.youtubeId,
                      title: currentVideo.title,
                      transcript: currentVideo.transcript || undefined,
                    }}
                    onTimestampClick={handleTimestampClick}
                  />
                ) : (
                  <AuthPaywall title="Sign in to chat with AI about this video">
                    <ChatInterface
                      video={{
                        id: currentVideo.id,
                        youtubeId: currentVideo.youtubeId,
                        title: currentVideo.title,
                        transcript: currentVideo.transcript || undefined,
                      }}
                      onTimestampClick={handleTimestampClick}
                    />
                  </AuthPaywall>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
