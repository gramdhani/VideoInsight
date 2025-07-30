import { RotateCcw, Download, Lightbulb, Key, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SummaryCardProps {
  video: {
    title: string;
    summary: {
      keyPoints: string[];
      ahaMonents: Array<{ timestamp: string; content: string }>;
      readingTime: string;
      insights: number;
    };
  };
}

export default function SummaryCard({ video }: SummaryCardProps) {
  const { summary } = video;

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

        <div className="space-y-4">
          {/* Key Points Section */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <Key className="w-4 h-4 text-primary" />
              <span>Key Points</span>
            </h3>
            <ul className="space-y-2">
              {summary.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-gray-700">{point}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Aha Moments Section */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <Star className="w-4 h-4 text-accent" />
              <span>Aha Moments</span>
            </h3>
            <div className="space-y-3">
              {summary.ahaMonents.map((moment, index) => (
                <div
                  key={index}
                  className={`border-l-4 p-3 rounded-r-lg ${
                    index % 2 === 0
                      ? "bg-yellow-50 border-yellow-400"
                      : "bg-green-50 border-green-400"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        index % 2 === 0
                          ? "text-yellow-700 bg-yellow-200"
                          : "text-green-700 bg-green-200"
                      }`}
                    >
                      {moment.timestamp}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{moment.content}</p>
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
                <div className="text-lg font-semibold text-secondary">{summary.keyPoints.length}</div>
                <div className="text-xs text-gray-600">Key Points</div>
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
