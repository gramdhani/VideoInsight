import { Play, Home, GitBranch, HelpCircle, ChevronLeft, User, LogOut, Library, Plus, MessageSquare, Settings, UserCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useVideo } from "@/contexts/VideoContext";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const { currentVideo, resetVideo } = useVideo();

  // Check if user is admin
  const isAdmin = user?.isAdmin === true;

  const navigationItems = [
    {
      href: "/",
      label: "Summarize",
      icon: Home,
      isActive: location === "/"
    },
    {
      href: "/library",
      label: "Library",
      icon: Library,
      isActive: location === "/library"
    },
    {
      href: "/profile",
      label: "Profiles",
      icon: UserCircle,
      isActive: location === "/profile"
    },
    {
      href: "/changelog",
      label: "Changelog",
      icon: GitBranch,
      isActive: location === "/changelog"
    }
  ];

  const supportItems = [
    // Only include Settings for admin users
    ...(isAdmin ? [{
      href: "/settings",
      label: "Settings",
      icon: Settings,
      isActive: location === "/settings"
    }] : []),
    {
      href: "/feedback",
      label: "Share Feedback",
      icon: MessageSquare,
      isActive: location === "/feedback"
    },
    {
      href: "/help",
      label: "Help",
      icon: HelpCircle,
      isActive: location === "/help"
    }
  ];



  return (
    <div className={cn(
      "bg-[var(--card-bg)] border-r border-[var(--border-light)] h-screen flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-light)]">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-[var(--text-main)]">
                VideoInsight
              </h1>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <Play className="w-4 h-4 text-white" />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 h-8 w-8"
          >
            <ChevronLeft className={cn(
              "w-4 h-4 transition-transform",
              isCollapsed && "rotate-180"
            )} />
          </Button>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 p-4">
        {!isCollapsed && (
          <div className="mb-4">
            <h2 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Navigate
            </h2>
          </div>
        )}
        
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all cursor-pointer",
                  item.isActive 
                    ? "bg-[hsl(263,70%,95%)] text-primary" 
                    : "text-[var(--text-secondary)] hover:bg-[var(--muted)] hover:text-[var(--text-main)]",
                  isCollapsed && "justify-center px-2"
                )}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Support Section */}
        {!isCollapsed && (
          <div className="mt-6 mb-4">
            <h2 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Support
            </h2>
          </div>
        )}
        
        <nav className="space-y-2">
          {supportItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all cursor-pointer",
                  item.isActive 
                    ? "bg-[hsl(263,70%,95%)] text-primary" 
                    : "text-[var(--text-secondary)] hover:bg-[var(--muted)] hover:text-[var(--text-main)]",
                  isCollapsed && "justify-center px-2"
                )}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>


      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4">
          {/* New Summarize Button - Show when there's a current video */}
          {currentVideo && (
            <div className="mb-4">
              <Button
                onClick={resetVideo}
                className="w-full bg-primary hover:bg-primary/90 text-white flex items-center space-x-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Summarize</span>
              </Button>
            </div>
          )}
          
          {/* User Info Section */}
          {!isLoading && (
            <div className="mt-4">
              {isAuthenticated && user ? (
                <div className="p-3 rounded-lg bg-white/50 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.profileImageUrl || ""} />
                      <AvatarFallback className="bg-gray-100">
                        {user.firstName?.[0] || user.email?.[0] || <User className="w-5 h-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.firstName || 'User'}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user.email}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-8 w-8 text-gray-500 hover:text-white hover:bg-red-600 hover:rounded-full transition-all duration-200"
                      onClick={() => window.location.href = '/api/logout'}
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="p-3 rounded-lg bg-white/50 border border-gray-200 cursor-pointer hover:bg-white/70 transition-colors"
                  onClick={() => window.location.href = '/api/login'}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Sign in
                      </div>
                      <div className="text-xs text-gray-500">
                        Sign in to save your progress
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Version indicator */}
      {!isCollapsed && (
        <div className="p-4 border-t border-[var(--border-light)]">
          <div className="text-xs text-[var(--text-secondary)] text-center">
            VideoInsight AI v0.5.2
          </div>
        </div>
      )}
    </div>
  );
}