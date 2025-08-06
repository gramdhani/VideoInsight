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
          {/* Version 0.2.8 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.2.8</h2>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                    Latest
                  </span>
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