import { Calendar, GitBranch, Zap, MessageCircle, FileText, Link } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Changelog() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
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
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Version 0.1.0 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">v0.1.0</h2>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                    Latest
                  </span>
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

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Core Features */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>Core Features</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>YouTube URL analysis with real-time transcript extraction</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>AI-powered video summaries with key insights</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Two-column layout with video player and analysis</span>
                      </li>
                    </ul>
                  </div>

                  {/* Interactive Features */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4 text-secondary" />
                      <span>Interactive Features</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Chat interface for video Q&A</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Quick Actions for instant analysis</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Clickable timestamps in transcripts</span>
                      </li>
                    </ul>
                  </div>

                  {/* Content Organization */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-accent" />
                      <span>Content Organization</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Tabbed interface: AI Summary + Transcript</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Structured summaries with "aha moments"</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Notes export functionality</span>
                      </li>
                    </ul>
                  </div>

                  {/* Enhanced Experience */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                      <Link className="w-4 h-4 text-green-600" />
                      <span>Enhanced Experience</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Clickable links in AI responses</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Well-formatted AI responses with markdown</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                        <span>Professional design with Indigo/Purple theme</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Technical Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {["React", "TypeScript", "Express.js", "OpenAI API", "YouTube Data API", "ScrapeCreators API", "Tailwind CSS", "shadcn/ui"].map((tech, index) => (
                      <span key={index} className="bg-white text-gray-700 text-xs px-2 py-1 rounded border">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}