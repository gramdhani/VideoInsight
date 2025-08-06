import {
  RotateCcw,
  Download,
  Lightbulb,
  FileText,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Play,
  FileDown,
  Search,
  Copy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { parseMarkdownLinks, parseMarkdownText } from "../utils/markdown";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TabbedContentProps {
  video: {
    title: string;
    youtubeId: string;
    transcript?: string;
    transcriptData?: Array<{
      text: string;
      startMs: string;
      endMs: string;
      startTimeText: string;
    }>;
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

export default function TabbedContent({
  video,
  onTimestampClick,
}: TabbedContentProps) {
  const { summary, transcriptData } = video;
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("summary");

  const jumpToTimestamp = (timestamp: string) => {
    // Use the callback if provided, otherwise fallback to console log
    if (onTimestampClick) {
      onTimestampClick(timestamp);
    } else {
      console.log(`Jumping to ${timestamp}`);
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  // Filter transcript based on search query
  const filteredTranscript = transcriptData?.filter(segment =>
    segment.text.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Copy all transcript text to clipboard
  const copyAllTranscript = async () => {
    if (!transcriptData) return;
    
    const fullText = transcriptData
      .map(segment => `${segment.startTimeText} ${segment.text}`)
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(fullText);
      toast({
        title: "Copied to clipboard",
        description: "The full transcript has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy transcript to clipboard.",
        variant: "destructive",
      });
    }
  };

  // Format timestamp from milliseconds to MM:SS or HH:MM:SS
  const formatTimestamp = (startTimeText: string) => {
    return startTimeText;
  };

  return (
    <Card className="modern-card shadow-modern">
      <CardContent className="p-3 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2
            className={`${isMobile ? "text-lg" : "text-xl"} font-semibold flex items-center space-x-2 text-foreground`}
          >
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span>{isMobile ? "Analysis" : "AI Analysis"}</span>
          </h2>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              title="Regenerate Summary"
              className="hover:bg-muted"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="Export Summary"
              className="hover:bg-muted"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary" data-testid="tab-summary">Summary</TabsTrigger>
            <TabsTrigger value="transcript" data-testid="tab-transcript">Transcript</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4 sm:space-y-6 mt-4">
            {/* Short Summary */}
            <div>
              <h3 className={`font-medium text-foreground mb-2 sm:mb-3 flex items-center space-x-2 ${isMobile ? "text-sm" : "text-base"}`}>
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span>Summary</span>
              </h3>
              <p className={`text-foreground leading-relaxed ${isMobile ? "text-sm" : "text-base"}`}>
                {parseMarkdownLinks(summary.shortSummary)}
              </p>
            </div>

            {/* Outline */}
            <div>
              <h3 className={`font-medium text-foreground mb-2 sm:mb-3 flex items-center space-x-2 ${isMobile ? "text-sm" : "text-base"}`}>
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span>Outline</span>
              </h3>
              <div className="space-y-3">
                {summary.outline.map((section, index) => (
                  <div key={index} className="border-l-3 border-blue-300 pl-3 sm:pl-4">
                    <h4 className={`font-medium text-gray-800 mb-2 ${isMobile ? "text-sm" : "text-base"}`}>
                      {index + 1}. {section.title}
                    </h4>
                    <ul className="space-y-1">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                          <span className={`text-gray-600 ${isMobile ? "text-xs" : "text-sm"}`}>
                            {parseMarkdownLinks(item)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Takeaways */}
            <div>
              <h3 className={`font-medium text-foreground mb-2 sm:mb-3 flex items-center space-x-2 ${isMobile ? "text-sm" : "text-base"}`}>
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                <span>Key Takeaways</span>
              </h3>
              <div className="space-y-3">
                {summary.keyTakeaways.map((takeaway, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-medium text-blue-900 ${isMobile ? "text-sm" : "text-base"}`}>
                        {takeaway.title}
                      </h4>
                      {takeaway.timestamp && (
                        <button
                          onClick={() => jumpToTimestamp(takeaway.timestamp!)}
                          className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded hover:bg-blue-300 transition-colors"
                          data-testid={`timestamp-${takeaway.timestamp}`}
                        >
                          {takeaway.timestamp}
                        </button>
                      )}
                    </div>
                    <p className={`text-blue-800 ${isMobile ? "text-xs" : "text-sm"}`}>
                      {parseMarkdownLinks(takeaway.description)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Next Steps */}
            <div>
              <h3 className={`font-medium text-foreground mb-2 sm:mb-3 flex items-center space-x-2 ${isMobile ? "text-sm" : "text-base"}`}>
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                <span>Next Steps</span>
              </h3>
              <div className="space-y-3">
                {summary.actionableSteps.map((step, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <ArrowRight className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400`} />
                        <h4 className={`font-medium text-foreground ${isMobile ? "text-sm" : "text-base"}`}>
                          {step.step}
                        </h4>
                      </div>
                      <Badge variant="outline" className={`${getPriorityColor(step.priority)} text-xs`}>
                        {step.priority}
                      </Badge>
                    </div>
                    <p className={`text-muted-foreground ml-6 ${isMobile ? "text-xs" : "text-sm"}`}>
                      {parseMarkdownLinks(step.description)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div>
                  <div className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-primary`}>
                    {summary.readingTime}
                  </div>
                  <div className="text-xs text-gray-600">
                    {isMobile ? "Read Time" : "Reading Time"}
                  </div>
                </div>
                <div>
                  <div className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-secondary`}>
                    {summary.keyTakeaways.length}
                  </div>
                  <div className="text-xs text-gray-600">Takeaways</div>
                </div>
                <div>
                  <div className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-accent`}>
                    {summary.insights}
                  </div>
                  <div className="text-xs text-gray-600">Insights</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Transcript Tab */}
          <TabsContent value="transcript" className="space-y-4 mt-4">
            {transcriptData && transcriptData.length > 0 ? (
              <>
                {/* Search and Copy Controls */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search transcript..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-transcript"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAllTranscript}
                    className="flex items-center space-x-2"
                    data-testid="button-copy-all"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy all</span>
                  </Button>
                </div>

                {/* Transcript Content */}
                <ScrollArea className="h-96 w-full rounded-md border p-4">
                  <div className="space-y-3">
                    {(searchQuery ? filteredTranscript : transcriptData).map((segment, index) => (
                      <div key={index} className="flex items-start space-x-3 group">
                        <button
                          onClick={() => jumpToTimestamp(segment.startTimeText)}
                          className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
                          data-testid={`timestamp-${segment.startTimeText}`}
                        >
                          {segment.startTimeText}
                        </button>
                        <p className={`text-gray-700 leading-relaxed ${isMobile ? "text-sm" : "text-base"}`}>
                          {searchQuery && segment.text.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                            segment.text.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, partIndex) =>
                              part.toLowerCase() === searchQuery.toLowerCase() ? (
                                <mark key={partIndex} className="bg-yellow-200 px-1 rounded">
                                  {part}
                                </mark>
                              ) : (
                                part
                              )
                            )
                          ) : (
                            segment.text
                          )}
                        </p>
                      </div>
                    ))}
                    {searchQuery && filteredTranscript.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <p>No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No transcript available for this video.</p>
              </div>
            )}
          </TabsContent>


        </Tabs>
      </CardContent>
    </Card>
  );
}
