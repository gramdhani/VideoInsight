import { useState } from "react";
import { Play } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Header from "../components/header";
import UrlInput from "../components/url-input";
import VideoPlayer from "../components/video-player";
import TabbedContent from "../components/tabbed-content";
import ChatInterface from "../components/chat-interface";
import NotesExport from "../components/notes-export";
import QuickActions from "../components/quick-actions";
import AuthPaywall from "../components/auth-paywall";

export default function Home() {
  const [currentVideo, setCurrentVideo] = useState(null);
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Header currentPage="home" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* URL Input - Always visible */}
        <UrlInput onVideoAnalyzed={setCurrentVideo} />

        {/* Two Column Layout */}
        {currentVideo && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <VideoPlayer video={currentVideo} />
              
              {isAuthenticated ? (
                <TabbedContent video={currentVideo} />
              ) : (
                <AuthPaywall title="Sign in to view full transcript & summary">
                  <TabbedContent video={currentVideo} />
                </AuthPaywall>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {isAuthenticated ? (
                <>
                  <ChatInterface video={currentVideo} />
                  <NotesExport video={currentVideo} />
                  <QuickActions video={currentVideo} />
                </>
              ) : (
                <AuthPaywall title="Sign in to chat with AI about this video">
                  <ChatInterface video={currentVideo} />
                  <NotesExport video={currentVideo} />
                  <QuickActions video={currentVideo} />
                </AuthPaywall>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[var(--card-bg)] border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Play className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium text-gray-700">VideoInsight AI</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
