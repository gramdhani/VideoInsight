import { ReactNode } from "react";
import Sidebar from "./sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className }: LayoutProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    // On mobile, we'll keep the existing header-based navigation for now
    // This preserves the mobile UX that was already optimized
    return (
      <div className="min-h-screen bg-background mobile-fade-in">
        <div className="safe-area-inset">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop only */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        <main className={cn("h-screen overflow-y-auto bg-white", className)}>
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}