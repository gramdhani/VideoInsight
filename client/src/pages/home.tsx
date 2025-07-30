import { useState } from "react";
import { Play } from "lucide-react";
import UrlInput from "../components/url-input";
import VideoPlayer from "../components/video-player";
import TabbedContent from "../components/tabbed-content";
import ChatInterface from "../components/chat-interface";
import NotesExport from "../components/notes-export";
import QuickActions from "../components/quick-actions";

export default function Home() {
  const [currentVideo, setCurrentVideo] = useState(null);

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      {/* Header */}
      <header className="bg-[var(--card-bg)] border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-[var(--text-main)]">VideoInsight AI</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">Features</a>
              <a href="/changelog" className="text-gray-600 hover:text-primary transition-colors">Changelog</a>
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">Help</a>
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Sign In
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* URL Input */}
        <UrlInput onVideoAnalyzed={setCurrentVideo} />

        {/* Two Column Layout */}
        {currentVideo && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <VideoPlayer video={currentVideo} />
              <TabbedContent video={currentVideo} />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <ChatInterface video={currentVideo} />
              <NotesExport video={currentVideo} />
              <QuickActions video={currentVideo} />
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
