
import { useState, useRef } from "react";
import { Play, Home, Calendar, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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

  const menuItems = [
    {
      title: "Summarize",
      icon: Home,
      url: "/",
      isActive: true,
    },
    {
      title: "Changelog",
      icon: Calendar,
      url: "/changelog",
      isActive: false,
    },
    {
      title: "Help",
      icon: HelpCircle,
      url: "#",
      isActive: false,
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <Sidebar variant="inset">
          <SidebarHeader>
            <div className="flex items-center space-x-3 px-2 py-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Play className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium text-foreground">
                VideoInsight AI
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>NAVIGATE</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.isActive}
                        className="w-full"
                      >
                        <a href={item.url} className="flex items-center space-x-3">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1">
          <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <Header currentPage="home" hideLogo={true} />
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
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
                        : "sticky top-32 max-h-[calc(100vh-6rem)]"
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
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
