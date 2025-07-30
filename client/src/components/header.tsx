import { Play } from "lucide-react";

interface HeaderProps {
  currentPage?: string;
}

export default function Header({ currentPage = "home" }: HeaderProps) {
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
            <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Sign In
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}