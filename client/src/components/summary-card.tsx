import { RotateCcw, Download, Lightbulb, FileText, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SummaryCardProps {
  video: {
    title: string;
    summary: {
      shortSummary: string;
      outline: Array<{ title: string; items: string[] }>;
      keyTakeaways: Array<{ title: string; description: string; timestamp?: string }>;
      actionableSteps: Array<{ step: string; description: string; priority: 'high' | 'medium' | 'low' }>;
      readingTime: string;
      insights: number;
    };
  };
  onTimestampClick?: (timestamp: string) => void;
}

export default function SummaryCard({ video, onTimestampClick }: SummaryCardProps) {
  const { summary } = video;

  const handleTimestampClick = (timestamp: string) => {
    if (onTimestampClick) {
      onTimestampClick(timestamp);
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const parseMarkdownLinks = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {match[1]}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 1 ? <span>{parts}</span> : text;
  };

  return (
    <Card className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-accent" />
            <span>AI Summary</span>
          </h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" title="Regenerate Summary">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Export Summary">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* 1. Short Summary */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Summary</span>
            </h3>
            <p className="text-gray-700 leading-relaxed">{parseMarkdownLinks(summary.shortSummary)}</p>
          </div>

          {/* 2. Outline */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Outline</span>
            </h3>
            <div className="space-y-3">
              {summary.outline.map((section, index) => (
                <div key={index} className="border-l-3 border-blue-300 pl-4">
                  <h4 className="font-medium text-gray-800 mb-2">{index + 1}. {section.title}</h4>
                  <ul className="space-y-1">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{parseMarkdownLinks(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Key Takeaways */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span>Key Takeaways</span>
            </h3>
            <div className="space-y-3">
              {summary.keyTakeaways.map((takeaway, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-blue-900">{takeaway.title}</h4>
                    {takeaway.timestamp && (
                      <button
                        onClick={() => handleTimestampClick(takeaway.timestamp!)}
                        className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded hover:bg-blue-300 transition-colors"
                        data-testid={`timestamp-${takeaway.timestamp}`}
                      >
                        {takeaway.timestamp}
                      </button>
                    )}
                  </div>
                  <p className="text-blue-800 text-sm">{parseMarkdownLinks(takeaway.description)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Actionable Next Steps */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Actionable Next Steps</span>
            </h3>
            <div className="space-y-3">
              {summary.actionableSteps.map((step, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <h4 className="font-medium text-gray-900">{step.step}</h4>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getPriorityColor(step.priority)}
                    >
                      {step.priority}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm ml-6">{parseMarkdownLinks(step.description)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-primary">{summary.readingTime}</div>
                <div className="text-xs text-gray-600">Reading Time</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-secondary">{summary.keyTakeaways.length}</div>
                <div className="text-xs text-gray-600">Key Takeaways</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-accent">{summary.insights}</div>
                <div className="text-xs text-gray-600">Insights</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
