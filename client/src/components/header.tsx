import { Play, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  currentPage?: string;
}

export default function Header({ currentPage = "home" }: HeaderProps) {
  const { user, isAuthenticated } = useAuth();

  return (
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
            <a 
              href="/changelog" 
              className={`transition-colors ${
                currentPage === "changelog" 
                  ? "text-primary font-medium" 
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              Changelog
            </a>
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">Help</a>
            
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 p-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.profileImageUrl || ""} />
                      <AvatarFallback>
                        {user.firstName?.[0] || user.email?.[0] || <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {user.firstName || user.email?.split('@')[0] || 'User'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => window.location.href = '/api/logout'}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => window.location.href = '/api/login'}
              >
                Sign In
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}