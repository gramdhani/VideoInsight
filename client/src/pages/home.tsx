import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "../components/header";
import UrlInput from "../components/url-input";
import VideoPlayer, { VideoPlayerRef } from "../components/video-player";
import TabbedContent from "../components/tabbed-content";
import ChatInterface from "../components/chat-interface";
import NotesExport from "../components/notes-export";
import QuickActions from "../components/quick-actions";
import AuthPaywall from "../components/auth-paywall";
import type { Video } from "@shared/schema";

export default function Home() {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const videoPlayerRef = useRef<VideoPlayerRef>(null);

  // Check for video parameter from Library
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('video');

  // Load video if coming from Library
  const { data: libraryVideo } = useQuery<Video>({
    queryKey: ["/api/videos", videoId],
    enabled: !!videoId,
  });

  // Auto-load video from Library when available
  useEffect(() => {
    if (libraryVideo && !currentVideo && libraryVideo.summary) {
      // Transform the Library Video to match component expectations
      const transformedVideo = {
        ...libraryVideo,
        summary: libraryVideo.summary, // This is already the right structure
      };
      setCurrentVideo(transformedVideo as any); // Use 'any' to match existing pattern
      // Clear the URL parameter to clean up the URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [libraryVideo, currentVideo]);

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
        {/* URL Input - Always visible */}
        <UrlInput onVideoAnalyzed={setCurrentVideo} />

        {/* Responsive Layout */}
        {currentVideo && (
          <div
            className={`${isMobile ? "space-y-4" : "grid lg:grid-cols-2 gap-8"}`}
          >
            {/* Left Column / Mobile Stack */}
            <div className="space-y-4 sm:space-y-6">
              <VideoPlayer ref={videoPlayerRef} video={currentVideo} />
              <TabbedContent
                video={currentVideo}
                onTimestampClick={handleTimestampClick}
              />
            </div>

            {/* Right Column - Sticky Chat on Desktop, Inline on Mobile */}
            <div
              className={`space-y-4 sm:space-y-6 ${isMobile ? "pb-16" : ""}`}
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
                    video={currentVideo}
                    onTimestampClick={handleTimestampClick}
                  />
                ) : (
                  <AuthPaywall title="Sign in to chat with AI about this video">
                    <ChatInterface
                      video={currentVideo}
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
