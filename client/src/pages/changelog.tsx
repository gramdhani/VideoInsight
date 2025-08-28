import { Calendar, GitBranch, Zap, Settings, FileText } from "lucide-react";
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
          {/* Version 0.5.6 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.5.6</h2>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                    Latest
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>August 28, 2025</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-red-900 mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Security & Protection Update
                  </h3>
                  <ul className="text-red-800 text-sm space-y-1">
                    <li>• <strong>Authentication Protection:</strong> Video analysis endpoints now require user authentication</li>
                    <li>• <strong>Rate Limiting:</strong> Added comprehensive rate limiting (5 requests per 15 minutes) for expensive operations</li>
                    <li>• <strong>Session Security:</strong> Enhanced cookie protection with sameSite attribute to prevent CSRF attacks</li>
                    <li>• <strong>Admin Authorization:</strong> Fixed unprotected admin configuration endpoint with proper access controls</li>
                    <li>• <strong>Ownership Verification:</strong> Added proper user ownership checks for personalized plans and video access</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-orange-900 mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    XSS & Input Protection
                  </h3>
                  <ul className="text-orange-800 text-sm space-y-1">
                    <li>• <strong>XSS Prevention:</strong> Implemented input sanitization for chart styling to prevent code injection</li>
                    <li>• <strong>Privacy Protection:</strong> Removed verbose API response logging that exposed sensitive user data</li>
                    <li>• <strong>Input Validation:</strong> Added CSS color and property sanitization for chart components</li>
                    <li>• <strong>Error Handling:</strong> Improved security error messages with appropriate status codes</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Endpoint Security Hardening
                  </h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• <strong>Video Analysis:</strong> /api/videos/analyze now requires authentication and rate limiting</li>
                    <li>• <strong>Video Re-analysis:</strong> /api/videos/re-analyze secured with same protections</li>
                    <li>• <strong>Admin Configs:</strong> /api/admin/prompt-configs/active now requires admin privileges</li>
                    <li>• <strong>Resource Protection:</strong> Prevents abuse of expensive AI and API operations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version 0.5.2 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.5.2</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>August 23, 2025</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Enhanced Quick Actions Validation
                  </h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Fixed form validation errors for Quick Action types</li>
                    <li>• Improved error handling for "Shorter Summary", "Detailed Analysis", "Action Items", and "Key Quotes"</li>
                    <li>• Enhanced form validation feedback with clearer error messages</li>
                    <li>• Resolved quickActionType field validation issues</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-purple-900 mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    User Interface Improvements
                  </h3>
                  <ul className="text-purple-800 text-sm space-y-1">
                    <li>• Enhanced tabbed content interface with better mobile responsiveness</li>
                    <li>• Improved loading states with skeleton components during re-summarization</li>
                    <li>• Better touch targets and mobile optimization across components</li>
                    <li>• Refined settings and feedback page interactions</li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-green-900 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Performance & Stability
                  </h3>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Improved hot module reloading for faster development cycles</li>
                    <li>• Enhanced component rendering stability</li>
                    <li>• Optimized transcript search and navigation functionality</li>
                    <li>• Better error recovery and user experience continuity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version 0.5.1 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.5.1</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>August 21, 2025</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Enhanced Timestamp Navigation
                  </h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Removed "Referenced timestamps:" section with purple buttons for cleaner UI</li>
                    <li>• Made inline timestamps like "(10:50)" directly clickable within AI responses</li>
                    <li>• Simplified timestamp display by removing "Timestamp:" prefix</li>
                    <li>• Enhanced timestamp parsing to support both legacy and new formats</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-purple-900 mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Recent Summaries Display
                  </h3>
                  <ul className="text-purple-800 text-sm space-y-1">
                    <li>• Added "Recent Summaries" section showing 3 latest analyzed videos on home page</li>
                    <li>• Compact card design with video thumbnails, titles, and summary statistics</li>
                    <li>• Includes "View All" button linking to full library page</li>
                    <li>• Click functionality to directly load any recent video for immediate viewing</li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-green-900 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Video Thumbnail Optimization
                  </h3>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Updated video thumbnails to use proper 16:9 aspect ratio</li>
                    <li>• Improved visual consistency across all video cards</li>
                    <li>• Enhanced responsive design with proper image scaling and hover effects</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version 0.5.0 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.5.0</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>August 15, 2025</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Enhanced Quick Actions System
                  </h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Quick Actions now provide more relevant, context-aware responses</li>
                    <li>• Improved "Shorter Summary", "Detailed Analysis", "Action Items", and "Key Quotes" features</li>
                    <li>• Enhanced AI processing for better accuracy and faster response times</li>
                    <li>• Optimized template system for more consistent output formatting</li>
                    <li>• Better integration with video content analysis for personalized results</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-purple-900 mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    AI Response Optimization
                  </h3>
                  <ul className="text-purple-800 text-sm space-y-1">
                    <li>• Enhanced AI prompt processing for more accurate video analysis</li>
                    <li>• Improved response generation with better context understanding</li>
                    <li>• Optimized template variable handling for consistent formatting</li>
                    <li>• Better fallback systems ensure reliable functionality across all features</li>
                    <li>• Enhanced error handling for smoother user experience</li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-green-900 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Performance & Reliability Improvements
                  </h3>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Enhanced system stability with improved database operations</li>
                    <li>• Optimized API endpoints for faster response times</li>
                    <li>• Better memory management and resource utilization</li>
                    <li>• Improved caching mechanisms for enhanced performance</li>
                    <li>• Refined user interface components for smoother interactions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version 0.4.0 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.4.0</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>August 13, 2025</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Unified AI Model Migration
                  </h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Migrated from Google Gemini 2.5 Flash Lite to OpenAI GPT-4o-mini for all AI processing</li>
                    <li>• Unified video summarization, chat responses, and general knowledge context under single model</li>
                    <li>• Maintained cost-effective access through OpenRouter API integration</li>
                    <li>• Fixed Gemini seed parameter compatibility errors with OpenAI model switch</li>
                    <li>• Enhanced consistency across all AI-powered features</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-purple-900 mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Enhanced AI Chat System
                  </h3>
                  <ul className="text-purple-800 text-sm space-y-1">
                    <li>• Intelligent web search integration for questions requiring current information</li>
                    <li>• Automatic detection of keywords: competitors, alternatives, current, latest, pricing, market trends</li>
                    <li>• Smart pattern recognition for questions like "who is...", "what is X doing", "is there a better..."</li>
                    <li>• Combines video content with real-time web data when relevant</li>
                    <li>• Visual indicators for web search activation in system logs</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-orange-900 mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Personalized Action Plan Feature
                  </h3>
                  <ul className="text-orange-800 text-sm space-y-1">
                    <li>• Added user profile system with personal descriptions and role-based planning</li>
                    <li>• AI-generated personalized action plans tailored to user experience and goals</li>
                    <li>• Priority action items with effort/impact ratings and measurable metrics</li>
                    <li>• Quick wins section for immediate momentum building</li>
                    <li>• Profile management page with create, edit, and delete functionality</li>
                    <li>• Plan caching system to avoid regenerating identical plans</li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-green-900 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    System Improvements
                  </h3>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Resolved API integration issues and improved error handling</li>
                    <li>• Stabilized hybrid AI system communication between OpenAI and OpenRouter</li>
                    <li>• Enhanced response formatting with mandatory bullet point structure</li>
                    <li>• Improved fallback mechanisms for better reliability</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version 0.3.0 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.3.0</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>August 9, 2025</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Enhanced Quick Questions Experience
                  </h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Quick questions now trigger immediate AI responses instead of filling input box</li>
                    <li>• Shortened question generation from 120-160 to 40-70 characters for better readability</li>
                    <li>• Click-to-chat functionality provides instant engagement with video content</li>
                    <li>• Questions appear directly in chat interface when no previous messages exist</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-purple-900 mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Improved Authentication Handling
                  </h3>
                  <ul className="text-purple-800 text-sm space-y-1">
                    <li>• Added clear authentication checks for quick question interactions</li>
                    <li>• Implemented informative error messages for unauthenticated users</li>
                    <li>• Seamless user experience with proper login prompts when needed</li>
                    <li>• Enhanced security for AI chat functionality</li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-green-900 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    UI/UX Improvements
                  </h3>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Disabled button states during AI processing to prevent multiple requests</li>
                    <li>• Loading indicators and visual feedback for better user experience</li>
                    <li>• Streamlined question interaction workflow</li>
                    <li>• Enhanced responsive design for mobile and desktop</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version 0.2.9 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.2.9</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>August 8, 2025</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Intelligent Web Search Integration
                  </h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Added automatic detection system for questions requiring current information</li>
                    <li>• Web search triggers for keywords: competitors, alternatives, current, latest, pricing, market trends</li>
                    <li>• Smart question pattern recognition: "who is...", "what is X doing", "is there a better..."</li>
                    <li>• Combines video content with real-time web data when relevant</li>
                    <li>• Visual indicators (🔍) for web search activation in logs</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-purple-900 mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Enhanced Response Formatting
                  </h3>
                  <ul className="text-purple-800 text-sm space-y-1">
                    <li>• Implemented mandatory bullet point formatting for all AI responses</li>
                    <li>• Prioritized concise, scannable content over lengthy paragraphs</li>
                    <li>• Added structured formatting with sub-bullets for detailed information</li>
                    <li>• Responses now start immediately with bullets (no introductory paragraphs)</li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-green-900 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    API Integration Fixes
                  </h3>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Resolved GPT-4o-mini-search-preview temperature parameter compatibility error</li>
                    <li>• Stabilized hybrid AI system communication between OpenAI and OpenRouter APIs</li>
                    <li>• Improved error handling and fallback mechanisms</li>
                    <li>• Enhanced intelligent detection logic with multi-layer keyword analysis</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version 0.2.8 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.2.8</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>August 6, 2025</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-purple-900 mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Prompt Configuration System
                  </h3>
                  <ul className="text-purple-800 text-sm space-y-1">
                    <li>• Added comprehensive admin settings page for AI chat prompt configuration</li>
                    <li>• Created database schema for storing custom prompt configurations</li>
                    <li>• Implemented template variable system (context, transcript, videoDuration, question, title variables)</li>
                    <li>• Added admin-only access protection with user ID validation</li>
                    <li>• Integrated configurable prompts into AI chat system for dynamic responses</li>
                    <li>• Created default prompt configuration for immediate functionality</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Enhanced Transcript Interface
                  </h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Redesigned AI analysis card with tabbed interface (Summary & Transcript)</li>
                    <li>• Added searchable transcript with real-time keyword filtering</li>
                    <li>• Implemented "Copy all" functionality with toast notifications</li>
                    <li>• Styled timestamps with clickable navigation to video positions</li>
                    <li>• Added search result highlighting for better content discovery</li>
                    <li>• Integrated transcript data from database into the UI seamlessly</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version 0.2.7 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.2.7</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>August 1, 2025</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Video Navigation & Chat Auto-scroll
                  </h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Fixed video library routing - clicking videos now opens correct content</li>
                    <li>• Updated API endpoints to properly fetch videos by internal ID</li>
                    <li>• Resolved chat message display issue where messages weren't appearing</li>
                    <li>• Added automatic scroll-to-bottom functionality for chat interface</li>
                    <li>• Chat scrolls to latest message when opening videos with existing history</li>
                    <li>• Chat automatically scrolls to bottom when sending new messages</li>
                    <li>• Updated sidebar version to automatically match latest changelog version</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version 0.2.6 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.2.6</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>August 1, 2025</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Video Library Management
                  </h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Added complete video deletion functionality with dropdown menu on each video card</li>
                    <li>• Users can now permanently remove videos from their library along with all associated chat messages</li>
                    <li>• Implemented confirmation dialog to prevent accidental deletions</li>
                    <li>• Added proper error handling and success notifications for delete operations</li>
                    <li>• Only video owners can delete their own videos (authorization built-in)</li>
                    <li>• Enhanced Library page UI with hover-triggered action menu</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-purple-900 mb-2">AI Response Improvements</h3>
                  <ul className="text-purple-800 text-sm space-y-1">
                    <li>• Optimized AI responses to use simple, everyday language instead of complex business terms</li>
                    <li>• Enhanced markdown formatting with better bold text rendering and bullet point layout</li>
                    <li>• Improved chat message containers with better spacing and readability</li>
                    <li>• Made AI responses more concise and direct, similar to user-preferred style</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version 0.2.5 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.2.5</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>August 1, 2025</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-blue-900 mb-2">📋 Feedback System Implementation</h3>
                  <p className="text-blue-800 text-sm">
                    Added comprehensive feedback system for user input and suggestions.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>New Features</span>
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Added Share Feedback page with comprehensive form (Name, Email, Message)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Email auto-fills for authenticated users and is required for guests</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Created feedback database table with proper schema relations</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Added feedback API endpoint supporting both authenticated and guest submissions</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Added navigation link in sidebar with message square icon</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Success confirmation page with option to submit additional feedback</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version 0.2.4 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.2.4</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>January 31, 2025</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-purple-900 mb-2">🖥️ Desktop Layout & AI Model Optimization</h3>
                  <p className="text-purple-800 text-sm">
                    Enhanced desktop experience and optimized AI costs with improved performance.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>Optimizations</span>
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Switched AI model from GPT-4o to GPT-4o-mini to reduce operational costs</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Fixed desktop chat header cutoff on large monitors with adjusted sticky positioning</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Enhanced timestamp parsing to support range formats like "5:01 - 6:35"</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Improved chat container height calculations for better large screen compatibility</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Fixed mobile sticky positioning issues with proper CSS media queries</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version 0.2.3 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.2.3</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>January 31, 2025</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-green-900 mb-2">⏱️ Timestamp Navigation</h3>
                  <p className="text-green-800 text-sm">
                    Enhanced video navigation with clickable timestamps and improved parsing.
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
                        <span>Implemented timestamp clicking functionality with YouTube iframe re-rendering</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Enhanced markdown parser to support clickable timestamps with callback handlers</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Added proper timestamp parsing for MM:SS and HH:MM:SS formats</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Fixed mobile chat card cut-off with improved spacing and safe areas</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Updated video player to reload iframe with start time parameter for reliable seeking</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version 0.2.2 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.2.2</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>January 31, 2025</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-orange-900 mb-2">📱 Mobile Optimization</h3>
                  <p className="text-orange-800 text-sm">
                    Comprehensive mobile responsiveness with optimized navigation and touch interfaces.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>Mobile Enhancements</span>
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Implemented comprehensive mobile responsiveness across all components</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Added mobile-first navigation with collapsible sidebar menu</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Optimized chat interface with mobile-friendly sizing and spacing</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Enhanced tabbed content with responsive text and button sizing</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Updated URL input form with mobile-optimized layout</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Added mobile-specific CSS utilities for touch targets and scrolling</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Improved header with shortened branding and mobile navigation</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Enhanced video player and footer with mobile-responsive layouts</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Added mobile-specific breakpoints using existing useIsMobile hook</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version 0.2.1 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.2.1</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>January 30, 2025</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-indigo-900 mb-2">💎 Freemium Model Implementation</h3>
                  <p className="text-indigo-800 text-sm">
                    Implemented freemium access with smart paywall for premium features.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>Business Model</span>
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Implemented freemium homepage experience allowing all users to analyze videos</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Unlocked AI summary and transcript access for unauthenticated users</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Added authentication paywall specifically for interactive chat features only</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Made chat interface sticky on top of right column for better UX</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Updated API routes to support both authenticated and unauthenticated access patterns</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Created blurred preview paywall component for premium features</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version 0.2.0 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.2.0</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>January 30, 2025</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <h3 className="font-medium text-red-900 mb-2">🔐 Authentication Integration</h3>
                  <p className="text-red-800 text-sm">
                    Major platform upgrade with full user authentication and database integration.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>Authentication System</span>
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Integrated Replit OpenID Connect authentication system</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Added user session management with PostgreSQL session storage</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Implemented authentication-aware routing (Landing page for unauthenticated users)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Created user authentication hooks and utilities for frontend</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Added protected API routes requiring user authentication</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Enhanced header component with user profile dropdown and logout functionality</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Updated database schema with users and sessions tables</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Switched from in-memory storage to DatabaseStorage for production readiness</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version 0.1.1 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.1.1</h2>
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
                        <span>Redesigned navigation with collapsible sidebar layout for desktop users</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Added comprehensive Help page with getting started guide and support information</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Maintained mobile-optimized header navigation while adding desktop sidebar</span>
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