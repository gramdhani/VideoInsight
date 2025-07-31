import { HelpCircle, MessageCircle, Book, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "../components/header";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Help() {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      {/* Mobile header */}
      {isMobile && (
        <div className="min-h-screen bg-background">
          <Header currentPage="help" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
            <HelpContent />
          </div>
        </div>
      )}

      {/* Desktop with sidebar */}
      {!isMobile && <HelpContent />}
    </div>
  );
}

function HelpContent() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <HelpCircle className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)]">Help & Support</h1>
          <p className="text-[var(--text-secondary)]">Get help with VideoInsight AI</p>
        </div>
      </div>

      {/* Help Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Book className="w-5 h-5 text-primary" />
              <span>Getting Started</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">How to analyze a video:</h4>
                <ol className="list-decimal list-inside space-y-1 text-[var(--text-secondary)]">
                  <li>Paste a YouTube URL in the input field</li>
                  <li>Click "Analyze Video" to start processing</li>
                  <li>View the AI-generated summary and insights</li>
                  <li>Use the chat interface to ask questions</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium mb-2">Supported platforms:</h4>
                <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
                  <li>YouTube videos (public videos only)</li>
                  <li>Any length - from shorts to long-form content</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <span>Features</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">AI Summary:</h4>
                <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
                  <li>Key points and takeaways</li>
                  <li>Clickable timestamps</li>
                  <li>Export to PDF</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Interactive Chat:</h4>
                <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
                  <li>Ask questions about the video content</li>
                  <li>Get detailed explanations</li>
                  <li>Explore topics in depth</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="modern-card md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-primary" />
              <span>Contact Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="text-[var(--text-secondary)] mb-4">
                Need additional help? Our support team is here to assist you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-[var(--muted)] rounded-lg p-4 flex-1">
                  <h4 className="font-medium mb-2">Documentation</h4>
                  <p className="text-[var(--text-secondary)] text-xs">
                    Visit our comprehensive guide for detailed instructions
                  </p>
                </div>
                <div className="bg-[var(--muted)] rounded-lg p-4 flex-1">
                  <h4 className="font-medium mb-2">Email Support</h4>
                  <p className="text-[var(--text-secondary)] text-xs">
                    Reach out to our team for personalized assistance
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}