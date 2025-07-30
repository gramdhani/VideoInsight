import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, User, Star } from "lucide-react";

interface AuthPaywallProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function AuthPaywall({ 
  children, 
  title = "Sign in to see full results",
  description = "Create a free account to access complete video analysis, chat features, and more insights."
}: AuthPaywallProps) {
  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="filter blur-sm pointer-events-none opacity-50">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <Card className="max-w-md w-full mx-4 border-2 border-indigo-100 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            
            <p className="text-gray-600 mb-6">
              {description}
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 text-indigo-500 mr-2" />
                Complete AI-powered video analysis
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 text-indigo-500 mr-2" />
                Interactive chat with timestamps
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 text-indigo-500 mr-2" />
                Export notes and insights
              </div>
            </div>
            
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3"
              onClick={() => window.location.href = '/api/login'}
            >
              <User className="w-4 h-4 mr-2" />
              Sign In / Sign Up
            </Button>
            
            <p className="text-xs text-gray-500 mt-3">
              Free to join • No credit card required
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}