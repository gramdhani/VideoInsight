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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { parseMarkdownLinks, parseMarkdownText } from "../utils/markdown";

interface TabbedContentProps {
  video: {
    title: string;
    youtubeId: string;
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
  const { summary } = video;
  const isMobile = useIsMobile();

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

  return (
    <Card className="modern-card shadow-modern">
      <CardContent className="p-3 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2
            className={`${isMobile ? "text-lg" : "text-xl"} font-semibold flex items-center space-x-2 text-foreground`}
          >
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span>{isMobile ? "Summary" : "AI Summary"}</span>
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

        <div className="space-y-4 sm:space-y-6">
            {/* 1. Short Summary */}
            <div>
              <h3
                className={`font-medium text-foreground mb-2 sm:mb-3 flex items-center space-x-2 ${isMobile ? "text-sm" : "text-base"}`}
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span>Summary</span>
              </h3>
              <p className={`text-foreground leading-relaxed ${isMobile ? "text-sm" : "text-base"}`}>
                {parseMarkdownLinks(summary.shortSummary)}
              </p>
            </div>

            {/* 2. Outline */}
            <div>
              <h3
                className={`font-medium text-foreground mb-2 sm:mb-3 flex items-center space-x-2 ${isMobile ? "text-sm" : "text-base"}`}
              >
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

            {/* 3. Key Takeaways */}
            <div>
              <h3
                className={`font-medium text-foreground mb-2 sm:mb-3 flex items-center space-x-2 ${isMobile ? "text-sm" : "text-base"}`}
              >
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

            {/* 4. Actionable Next Steps */}
            <div>
              <h3
                className={`font-medium text-foreground mb-2 sm:mb-3 flex items-center space-x-2 ${isMobile ? "text-sm" : "text-base"}`}
              >
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
                      <Badge 
                        variant="outline" 
                        className={`${getPriorityColor(step.priority)} text-xs`}
                      >
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
                  <div
                    className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-primary`}
                  >
                    {summary.readingTime}
                  </div>
                  <div className="text-xs text-gray-600">
                    {isMobile ? "Read Time" : "Reading Time"}
                  </div>
                </div>
                <div>
                  <div
                    className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-secondary`}
                  >
                    {summary.keyTakeaways.length}
                  </div>
                  <div className="text-xs text-gray-600">Takeaways</div>
                </div>
                <div>
                  <div
                    className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-accent`}
                  >
                    {summary.insights}
                  </div>
                  <div className="text-xs text-gray-600">Insights</div>
                </div>
              </div>
            </div>

            {/* Export Notes */}
            <div className="border-t border-gray-200 pt-3 sm:pt-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h4
                  className={`${isMobile ? "text-xs" : "text-sm"} font-semibold text-gray-900 flex items-center space-x-2`}
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                  <span>Export Notes</span>
                </h4>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex-1 ${isMobile ? "text-xs h-7" : "text-xs h-8"}`}
                  onClick={() => {
                    let content = `# ${video.title}\n\n## AI Summary\n\n### Summary\n${summary.shortSummary}\n\n### Outline\n`;
                    summary.outline.forEach((section, index) => {
                      content += `${index + 1}. ${section.title}\n`;
                      section.items.forEach((item) => {
                        content += `   - ${item}\n`;
                      });
                    });
                    content += `\n### Key Takeaways\n`;
                    summary.keyTakeaways.forEach((takeaway) => {
                      content += `**${takeaway.title}**: ${takeaway.description}${takeaway.timestamp ? ` [${takeaway.timestamp}]` : ''}\n`;
                    });
                    content += `\n### Next Steps\n`;
                    summary.actionableSteps.forEach((step, index) => {
                      content += `${index + 1}. [${step.priority.toUpperCase()}] ${step.step}: ${step.description}\n`;
                    });
                    const blob = new Blob([content], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
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
                  className={`flex-1 ${isMobile ? "text-xs h-7" : "text-xs h-8"}`}
                  onClick={async () => {
                    // Dynamic import to avoid bundling issues
                    const { default: jsPDF } = await import("jspdf");

                    const pdf = new jsPDF();
                    let yPosition = 30;

                    // Title
                    pdf.setFontSize(20);
                    pdf.text(video.title, 20, yPosition);
                    yPosition += 20;

                    // Summary
                    pdf.setFontSize(16);
                    pdf.text("Summary", 20, yPosition);
                    yPosition += 10;
                    pdf.setFontSize(12);
                    const summaryLines = pdf.splitTextToSize(summary.shortSummary, 170);
                    pdf.text(summaryLines, 20, yPosition);
                    yPosition += summaryLines.length * 7 + 10;

                    // Outline
                    pdf.setFontSize(14);
                    pdf.text("Outline", 20, yPosition);
                    yPosition += 10;
                    pdf.setFontSize(12);
                    summary.outline.forEach((section, index) => {
                      const sectionLines = pdf.splitTextToSize(`${index + 1}. ${section.title}`, 170);
                      pdf.text(sectionLines, 20, yPosition);
                      yPosition += sectionLines.length * 7;
                      section.items.forEach((item) => {
                        const itemLines = pdf.splitTextToSize(`   - ${item}`, 170);
                        pdf.text(itemLines, 20, yPosition);
                        yPosition += itemLines.length * 7;
                      });
                      yPosition += 5;
                    });

                    // Key Takeaways
                    yPosition += 10;
                    pdf.setFontSize(14);
                    pdf.text("Key Takeaways", 20, yPosition);
                    yPosition += 15;
                    pdf.setFontSize(12);
                    summary.keyTakeaways.forEach((takeaway) => {
                      const takeawayText = `${takeaway.title}: ${takeaway.description}`;
                      const lines = pdf.splitTextToSize(takeawayText, 170);
                      pdf.text(lines, 20, yPosition);
                      yPosition += lines.length * 7 + 5;
                    });

                    // Save the PDF
                    pdf.save(`${video.title}-summary.pdf`);
                  }}
                >
                  <FileDown className="w-3 h-3 mr-1" />
                  PDF
                </Button>
              </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
