import { useState } from 'react';
import { Lightbulb, FileText } from 'lucide-react';

interface TabbedContentProps {
  summary: string;
  transcript: string;
}

export default function TabbedContent({ summary, transcript }: TabbedContentProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <nav className="flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('summary')}
            className={`${
              activeTab === 'summary'
                ? 'bg-white border-gray-200 border-b-white text-primary shadow-sm'
                : 'bg-transparent border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            } flex-1 py-3 px-4 border-l border-t border-r font-medium text-sm flex items-center justify-center space-x-2 rounded-tl-lg transition-all duration-150`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>AI Summary</span>
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`${
              activeTab === 'transcript'
                ? 'bg-white border-gray-200 border-b-white text-primary shadow-sm'
                : 'bg-transparent border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            } flex-1 py-3 px-4 border-t border-r font-medium text-sm flex items-center justify-center space-x-2 rounded-tr-lg transition-all duration-150`}
          >
            <FileText className="w-4 h-4" />
            <span>Transcript</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white border-l border-r border-b border-gray-200 rounded-b-lg p-6">
        {activeTab === 'summary' && (
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {summary || 'No summary available yet.'}
            </div>
          </div>
        )}
        {activeTab === 'transcript' && (
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-mono text-sm">
              {transcript || 'No transcript available yet.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}