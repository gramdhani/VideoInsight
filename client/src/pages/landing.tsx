import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            VideoInsight <span className="text-indigo-600">AI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform YouTube videos into interactive, actionable insights with AI-powered analysis, 
            summaries, and intelligent conversations.
          </p>
        </div>

        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Key Features
                </h2>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                    Real-time AI video analysis
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                    Interactive transcript with timestamp navigation
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                    Intelligent chat interface for Q&A
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                    Quick action insights generation
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                    Structured content exploration
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                  <div className="text-6xl">🎬</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button 
            size="lg" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started
          </Button>
          <p className="text-sm text-gray-500">
            Sign in to start analyzing YouTube videos with AI
          </p>
        </div>
      </div>
    </div>
  );
}