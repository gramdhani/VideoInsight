import { useState, useRef } from "react";
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

export default function Home() {
  const [currentVideo, setCurrentVideo] = useState(null);
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const videoPlayerRef = useRef<VideoPlayerRef>(null);

  const handleTimestampClick = (timestamp: string) => {
    console.log('Timestamp clicked:', timestamp);
    
    // Parse timestamp (e.g., "2:35" or "1:23:45") to seconds
    const timeToSeconds = (timeStr: string): number => {
      const parts = timeStr.split(':').map(Number);
      if (parts.length === 2) {
        return parts[0] * 60 + parts[1]; // MM:SS
      } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
      }
      return 0;
    };

    const seconds = timeToSeconds(timestamp);
    console.log('Jumping to seconds:', seconds);
    videoPlayerRef.current?.jumpToTime(seconds);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Header currentPage="home" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* URL Input - Always visible */}
        <UrlInput onVideoAnalyzed={setCurrentVideo} />

        {/* Responsive Layout */}
        {currentVideo && (
          <div className={`${isMobile ? 'space-y-4' : 'grid lg:grid-cols-2 gap-8'}`}>
            {/* Left Column / Mobile Stack */}
            <div className="space-y-4 sm:space-y-6">
              <VideoPlayer ref={videoPlayerRef} video={currentVideo} />
              <TabbedContent video={currentVideo} onTimestampClick={handleTimestampClick} />
            </div>

            {/* Right Column - Sticky Chat on Desktop, Inline on Mobile */}
            <div className={`space-y-4 sm:space-y-6 ${isMobile ? 'pb-16' : ''}`}>
              <div className={isMobile ? 'mobile-safe-area mobile-chat-fix' : 'sticky top-4 max-h-[calc(100vh-2rem)] overflow-hidden'}>
                {isAuthenticated ? (
                  <ChatInterface video={currentVideo} onTimestampClick={handleTimestampClick} />
                ) : (
                  <AuthPaywall title="Sign in to chat with AI about this video">
                    <ChatInterface video={currentVideo} onTimestampClick={handleTimestampClick} />
                  </AuthPaywall>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[var(--card-bg)] border-t border-gray-200 mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Play className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium text-gray-700">{isMobile ? "VideoInsight" : "VideoInsight AI"}</span>
            </div>
            <div className={`flex items-center ${isMobile ? 'space-x-4 text-xs' : 'space-x-6 text-sm'} text-gray-600`}>
              <a href="#" className="hover:text-primary transition-colors">{isMobile ? "Privacy" : "Privacy Policy"}</a>
              <a href="#" className="hover:text-primary transition-colors">{isMobile ? "Terms" : "Terms of Service"}</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
