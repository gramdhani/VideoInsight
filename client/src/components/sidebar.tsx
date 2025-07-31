import { Play, Home, GitBranch, HelpCircle, ChevronLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      href: "/",
      label: "Summarize",
      icon: Home,
      isActive: location === "/"
    },
    {
      href: "/changelog",
      label: "Changelog",
      icon: GitBranch,
      isActive: location === "/changelog"
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
                    ? "bg-primary/10 text-primary border border-primary/20" 
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
        <div className="p-4 border-t border-[var(--border-light)]">
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-4 h-4 bg-primary rounded flex items-center justify-center">
                <Play className="w-2 h-2 text-white" />
              </div>
              <span className="text-xs font-medium text-[var(--text-main)]">FREE PLAN</span>
            </div>
            <h3 className="font-semibold text-[var(--text-main)] mb-1">Upgrade To Pro</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              Upgrade your plan and have unlimited generations
            </p>
            <Button 
              className="w-full bg-white text-[var(--text-main)] hover:bg-gray-50 font-medium"
              size="sm"
            >
              Upgrade
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}