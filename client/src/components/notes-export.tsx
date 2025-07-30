import { useState } from "react";
import { FileDown, FileText, FileType } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface NotesExportProps {
  video: {
    title: string;
    summary: any;
  };
}

export default function NotesExport({ video }: NotesExportProps) {
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeChat, setIncludeChat] = useState(true);
  const [includeTimestamps, setIncludeTimestamps] = useState(false);
  const { toast } = useToast();

  const exportAsText = () => {
    let content = `# ${video.title}\n\n`;
    
    if (includeSummary && video.summary) {
      content += "## AI Summary\n\n";
      content += "### Key Points\n";
      video.summary.keyPoints.forEach((point: string, index: number) => {
        content += `${index + 1}. ${point}\n`;
      });
      
      content += "\n### Aha Moments\n";
      video.summary.ahaMonents.forEach((moment: any) => {
        content += `**${moment.timestamp}**: ${moment.content}\n`;
      });
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${video.title}-notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Notes exported",
      description: "Your notes have been saved as a text file.",
    });
  };

  const exportAsPDF = () => {
    // In a real implementation, you would use a PDF library like jsPDF
    toast({
      title: "PDF export",
      description: "PDF export functionality would be implemented here.",
    });
  };

  return (
    <Card className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <FileDown className="w-5 h-5 text-accent" />
          <span>Export Notes</span>
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Save your insights and chat conversation for later reference
        </p>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="include-summary"
              checked={includeSummary}
              onCheckedChange={(checked) => setIncludeSummary(checked === true)}
            />
            <label htmlFor="include-summary" className="text-sm text-gray-700">
              Include AI Summary
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="include-chat"
              checked={includeChat}
              onCheckedChange={(checked) => setIncludeChat(checked === true)}
            />
            <label htmlFor="include-chat" className="text-sm text-gray-700">
              Include Chat Conversation
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="include-timestamps"
              checked={includeTimestamps}
              onCheckedChange={(checked) => setIncludeTimestamps(checked === true)}
            />
            <label htmlFor="include-timestamps" className="text-sm text-gray-700">
              Include Video Timestamps
            </label>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={exportAsText}
            variant="outline"
            className="flex-1 flex items-center justify-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Export as Text</span>
          </Button>
          <Button
            onClick={exportAsPDF}
            className="flex-1 bg-accent text-white hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
          >
            <FileType className="w-4 h-4" />
            <span>Export as PDF</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
