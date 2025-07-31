import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, Download, Lightbulb, Key, Star, FileText, Clock, Play, FileDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseMarkdownLinks, parseMarkdownText } from "../utils/markdown";

interface TabbedContentProps {
  video: {
    title: string;
    youtubeId: string;
    summary: {
      keyPoints: string[];
      ahaMonents: Array<{ timestamp: string; content: string }>;
      readingTime: string;
      insights: number;
    };
    transcript?: string;
    transcriptData?: Array<{
      text: string;
      startMs: string;
      endMs: string;
      startTimeText: string;
    }>;
  };
}

export default function TabbedContent({ video }: TabbedContentProps) {
  const { summary } = video;

  // Use actual transcript data if available, otherwise parse text
  const transcriptSegments = video.transcriptData?.map(segment => ({
    timestamp: segment.startTimeText,
    text: segment.text,
    startMs: segment.startMs,
    endMs: segment.endMs,
  })) || [];

  const jumpToTimestamp = (timestamp: string) => {
    // This would integrate with the YouTube player to jump to specific times
    console.log(`Jumping to ${timestamp}`);
  };

  return (
    <Card className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary" className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4" />
              <span>AI Summary</span>
            </TabsTrigger>
            <TabsTrigger value="transcript" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Transcript</span>
            </TabsTrigger>
          </TabsList>

          {/* AI Summary Tab */}
          <TabsContent value="summary" className="mt-6">
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
                      <div className="text-gray-700">{parseMarkdownLinks(point)}</div>
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
                        <button
                          onClick={() => jumpToTimestamp(moment.timestamp)}
                          className={`text-xs font-medium px-2 py-1 rounded hover:opacity-80 transition-opacity cursor-pointer ${
                            index % 2 === 0
                              ? "text-yellow-700 bg-yellow-200 hover:bg-yellow-300"
                              : "text-green-700 bg-green-200 hover:bg-green-300"
                          }`}
                        >
                          <Play className="w-2 h-2 inline mr-1" />
                          {moment.timestamp}
                        </button>
                      </div>
                      <div className="text-gray-700 text-sm">{parseMarkdownLinks(moment.content)}</div>
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

              {/* Export Notes */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                    <Download className="w-4 h-4 text-accent" />
                    <span>Export Notes</span>
                  </h4>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => {
                      let content = `# ${video.title}\n\n## AI Summary\n\n### Key Points\n`;
                      summary.keyPoints.forEach((point: string, index: number) => {
                        content += `${index + 1}. ${point}\n`;
                      });
                      content += `\n### Aha Moments\n`;
                      summary.ahaMonents.forEach((moment: any) => {
                        content += `**${moment.timestamp}**: ${moment.content}\n`;
                      });
                      const blob = new Blob([content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${video.title}-summary.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Text
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    <FileDown className="w-3 h-3 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Transcript Tab */}
          <TabsContent value="transcript" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <FileText className="w-5 h-5 text-secondary" />
                <span>Full Transcript</span>
              </h2>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" title="Search Transcript">
                  <Clock className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Export Transcript">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {transcriptSegments.length > 0 ? (
              <ScrollArea className="h-[500px] w-full rounded-lg border p-4">
                <div className="space-y-4">
                  {transcriptSegments.map((segment, index) => (
                    <div key={index} className="group hover:bg-gray-50 p-3 rounded-lg transition-colors">
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => jumpToTimestamp(segment.timestamp)}
                          className="flex-shrink-0 bg-primary text-white text-xs px-2 py-1 rounded hover:bg-indigo-700 transition-colors cursor-pointer flex items-center space-x-1"
                        >
                          <Play className="w-2 h-2" />
                          <span>{segment.timestamp}</span>
                        </button>
                        <p className="text-gray-700 text-sm leading-relaxed flex-1">
                          {segment.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No transcript available for this video</p>
                <p className="text-sm">Try analyzing a different video with captions</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}