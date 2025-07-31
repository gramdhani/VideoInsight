import { Calendar, GitBranch, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Header from "../components/header";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Changelog() {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      {/* Mobile header */}
      {isMobile && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
          <Header currentPage="changelog" />
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Changelog</h1>
                  <p className="text-gray-600">Track new features and improvements</p>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-4xl mx-auto px-6 py-8">
            <ChangelogContent />
          </div>
        </div>
      )}

      {/* Desktop with sidebar */}
      {!isMobile && (
        <>
          {/* Page Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-main)]">Changelog</h1>
              <p className="text-[var(--text-secondary)]">Track new features and improvements</p>
            </div>
          </div>
          <ChangelogContent />
        </>
      )}
    </div>
  );
}

function ChangelogContent() {
  return (
    <div className="space-y-8">
          {/* Version 0.1.1 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.1.1</h2>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                    Latest
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>January 31, 2025</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-blue-900 mb-2">🔧 User Experience Improvements</h3>
                  <p className="text-blue-800 text-sm">
                    Enhanced interface organization and fixed key functionality issues.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>Improvements</span>
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Fixed markdown rendering to properly display HTML tags</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Added working PDF export functionality for video summaries</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Enhanced timestamp display with inline clickable elements</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Moved Export Notes inside AI Summary card for better organization</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Relocated Quick Actions to chat interface for easier access</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Made chat interface sticky on top for better navigation</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Enhanced chat flow to show user messages immediately</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version 0.1.0 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.1.0</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>January 30, 2025</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-blue-900 mb-2">🎉 Initial Release</h3>
                  <p className="text-blue-800 text-sm">
                    First version of VideoInsight AI with core YouTube video analysis capabilities.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* All Features in Single Column */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>Key Features</span>
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>YouTube URL analysis with real-time transcript extraction</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>AI-powered video summaries with key insights and "aha moments"</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Tabbed interface with AI Summary and full Transcript views</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Interactive chat interface for video Q&A with context awareness</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Quick Actions for instant analysis (Shorter Summary, Detailed Analysis, Action Items, Key Quotes)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Clickable timestamps in transcripts and chat responses</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Clickable links in AI responses with proper markdown formatting</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Notes export functionality for saving analysis results</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Professional two-column layout with Indigo/Purple design theme</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
    </div>
  );
}