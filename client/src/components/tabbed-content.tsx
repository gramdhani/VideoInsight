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
  Target,
  Clock,
  Zap,
  BarChart,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { parseMarkdownLinks, parseMarkdownText } from "../utils/markdown";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Profile, PersonalizedPlan } from "@shared/schema";

interface TabbedContentProps {
  video: {
    id?: string;
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
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [currentPlan, setCurrentPlan] = useState<PersonalizedPlan | null>(null);
  const [isResummarizing, setIsResummarizing] = useState(false);

  // Fetch user profiles
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
    enabled: isAuthenticated && activeTab === "plan",
  });

  // Fetch existing plan if profile is selected
  const { data: existingPlan } = useQuery<PersonalizedPlan>({
    queryKey: [`/api/videos/${video.id}/plans/${selectedProfileId}`],
    enabled: !!video.id && !!selectedProfileId && isAuthenticated,
  });

  // Re-summarize video mutation
  const resummaryMutation = useMutation({
    mutationFn: async () => {
      if (!video.youtubeId) throw new Error("Video ID is required");
      
      const response = await apiRequest("POST", "/api/videos/re-analyze", { 
        youtubeId: video.youtubeId 
      });
      return response.json();
    },
    onSuccess: (updatedVideo) => {
      setIsResummarizing(false);
      // Update the video data in the query cache
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      queryClient.setQueryData([`/api/videos/id/${video.id}`], updatedVideo);
      
      toast({
        title: "Summary regenerated",
        description: "The AI has created a fresh analysis of this video.",
      });
    },
    onError: (error: any) => {
      setIsResummarizing(false);
      toast({
        title: "Failed to regenerate summary",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate personalized plan mutation
  const generatePlan = useMutation({
    mutationFn: async (profileId: string) => {
      if (!video.id) throw new Error("Video ID is required");
      
      const response = await fetch(`/api/videos/${video.id}/plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate plan");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentPlan(data);
      queryClient.invalidateQueries({ 
        queryKey: [`/api/videos/${video.id}/plans/${selectedProfileId}`] 
      });
      toast({
        title: "Plan generated",
        description: "Your personalized action plan is ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate plan",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update current plan when existing plan loads
  useEffect(() => {
    if (existingPlan) {
      setCurrentPlan(existingPlan);
    }
  }, [existingPlan]);

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
    <Card className={`modern-card shadow-modern ${isMobile ? 'mobile-card' : ''}`}>
      <CardContent className={`${isMobile ? 'p-4' : 'p-3 sm:p-6'}`}>
        <div className={`flex items-center justify-between mb-3 sm:mb-4 ${
          isMobile ? 'flex-col space-y-3' : ''
        }`}>
          <h2
            className={`${
              isMobile ? "text-lg" : "text-xl"
            } font-semibold flex items-center space-x-2 text-foreground`}
          >
            <Lightbulb className={`text-primary ${
              isMobile ? 'w-5 h-5' : 'w-4 h-4 sm:w-5 sm:h-5'
            }`} />
            <span>{isMobile ? "Analysis" : "AI Analysis"}</span>
          </h2>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size={isMobile ? "default" : "sm"}
              title="Regenerate Summary"
              className={`hover:bg-muted ${isMobile ? 'touch-target' : ''}`}
              onClick={() => {
                setIsResummarizing(true);
                resummaryMutation.mutate();
              }}
              disabled={resummaryMutation.isPending || isResummarizing}
            >
              {resummaryMutation.isPending || isResummarizing ? (
                <Loader2 className={`animate-spin ${
                  isMobile ? 'w-4 h-4' : 'w-3 h-3 sm:w-4 sm:h-4'
                }`} />
              ) : (
                <RotateCcw className={`${
                  isMobile ? 'w-4 h-4' : 'w-3 h-3 sm:w-4 sm:h-4'
                }`} />
              )}
            </Button>
            <Button
              variant="ghost"
              size={isMobile ? "default" : "sm"}
              title="Export Summary"
              className={`hover:bg-muted ${isMobile ? 'touch-target' : ''}`}
            >
              <Download className={`${
                isMobile ? 'w-4 h-4' : 'w-3 h-3 sm:w-4 sm:h-4'
              }`} />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full grid-cols-3 ${
            isMobile ? 'h-12' : ''
          }`}>
            <TabsTrigger 
              value="summary" 
              data-testid="tab-summary"
              className={isMobile ? 'text-sm touch-target' : ''}
            >
              Summary
            </TabsTrigger>
            <TabsTrigger 
              value="plan" 
              data-testid="tab-plan"
              className={isMobile ? 'text-sm touch-target' : ''}
            >
              {isMobile ? "Plan" : "Personalized Plan"}
            </TabsTrigger>
            <TabsTrigger 
              value="transcript" 
              data-testid="tab-transcript"
              className={isMobile ? 'text-sm touch-target' : ''}
            >
              Transcript
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4 sm:space-y-6 mt-4">
            {isResummarizing || resummaryMutation.isPending ? (
              // Skeleton Loading State
              <div className="space-y-6">
                {/* Short Summary Skeleton */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>

                {/* Outline Skeleton */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border-l-3 border-gray-200 pl-4">
                        <Skeleton className="h-5 w-48 mb-2" />
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <Skeleton className="w-1.5 h-1.5 rounded-full mt-2" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                          <div className="flex items-start space-x-2">
                            <Skeleton className="w-1.5 h-1.5 rounded-full mt-2" />
                            <Skeleton className="h-4 w-4/5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Takeaways Skeleton */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-6 w-16 rounded" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4 mt-1" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps Skeleton */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <Skeleton className="w-4 h-4" />
                            <Skeleton className="h-5 w-32" />
                          </div>
                          <Skeleton className="h-6 w-16 rounded" />
                        </div>
                        <Skeleton className="h-4 w-full ml-6" />
                        <Skeleton className="h-4 w-4/5 ml-6 mt-1" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats Skeleton */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {[1, 2, 3].map((i) => (
                      <div key={i}>
                        <Skeleton className="h-6 w-12 mx-auto mb-2" />
                        <Skeleton className="h-3 w-16 mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Actual Content
              <>
                {/* Short Summary */}
                <div>
                  <h3 className="text-foreground mb-2 sm:mb-3 flex items-center space-x-2 text-[20px] font-semibold">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    <span>Summary</span>
                  </h3>
                  <p className={`text-foreground leading-relaxed ${isMobile ? "text-sm" : "text-base"}`}>
                    {parseMarkdownLinks(summary.shortSummary)}
                  </p>
                </div>

            {/* Outline */}
            <div>
              <h3 className="text-foreground mb-2 sm:mb-3 flex items-center space-x-2 text-[20px] font-semibold">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span>Outline</span>
              </h3>
              <div className="space-y-3">
                {summary.outline?.map((section, index) => (
                  <div key={index} className="border-l-3 border-blue-300 pl-3 sm:pl-4">
                    <h4 className="text-gray-800 text-[16px] font-semibold mt-[12px] mb-[12px]">
                      {index + 1}. {section.title}
                    </h4>
                    <ul className="space-y-1">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                          <span className="text-gray-600 mt-[2px] mb-[2px] text-[15px]">
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
              <h3 className="text-foreground mb-2 sm:mb-3 flex items-center space-x-2 text-[20px] font-semibold">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                <span>Key Takeaways</span>
              </h3>
              <div className="space-y-3">
                {summary.keyTakeaways?.map((takeaway, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-blue-900 text-base font-semibold">
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
                    <p className="text-blue-800 text-[15px]">
                      {parseMarkdownLinks(takeaway.description)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Next Steps */}
            <div>
              <h3 className="text-foreground mb-2 sm:mb-3 flex items-center space-x-2 text-[20px] font-semibold">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                <span>Next Steps</span>
              </h3>
              <div className="space-y-3">
                {summary.actionableSteps?.map((step, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <ArrowRight className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400`} />
                        <h4 className="text-foreground text-base font-semibold">
                          {step.step}
                        </h4>
                      </div>
                      <Badge variant="outline" className={`${getPriorityColor(step.priority)} text-xs`}>
                        {step.priority}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground ml-6 text-[15px]">
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
                    {summary.keyTakeaways?.length || 0}
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
              </>
            )}
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

          {/* Personalized Plan Tab */}
          <TabsContent value="plan" className="space-y-4 mt-4">
            {!isAuthenticated ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sign in to create personalized plans</h3>
                <p className="text-muted-foreground mb-4">
                  Get tailored action plans based on your profile
                </p>
                <Button onClick={() => window.location.href = '/api/login'} data-testid="button-signin-plan">
                  Sign In
                </Button>
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No profiles found</h3>
                <p className="text-muted-foreground mb-4">
                  Create a profile first to get personalized action plans
                </p>
                <Button onClick={() => window.location.href = '/profile'} data-testid="button-create-profile-plan">
                  Create Profile
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Profile Selector */}
                <div className="flex items-center space-x-4">
                  <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                    <SelectTrigger className="flex-1" data-testid="select-profile">
                      <SelectValue placeholder="Select a profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile: Profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => generatePlan.mutate(selectedProfileId)}
                    disabled={!selectedProfileId || generatePlan.isPending}
                    data-testid="button-generate-plan"
                  >
                    {generatePlan.isPending ? "Generating..." : "Generate Plan"}
                  </Button>
                </div>

                {/* Personalized Plan Content */}
                {currentPlan && currentPlan.plan && (
                  <div className="space-y-6">
                    {/* Priority Action Items */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                        <Target className="w-5 h-5 text-primary" />
                        <span>Priority Action Items</span>
                      </h3>
                      <div className="space-y-4">
                        {currentPlan.plan.items?.map((item, index) => (
                          <Card key={index} className="p-4">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-lg flex-1">{item.title}</h4>
                                <div className="flex space-x-2">
                                  <Badge variant={item.effort === 'low' ? 'secondary' : item.effort === 'medium' ? 'default' : 'destructive'}>
                                    {item.effort} effort
                                  </Badge>
                                  <Badge variant={item.impact === 'high' ? 'default' : item.impact === 'medium' ? 'secondary' : 'outline'}>
                                    {item.impact} impact
                                  </Badge>
                                </div>
                              </div>

                              <p className="text-muted-foreground text-sm">{item.whyItMatters}</p>

                              <div className="space-y-2">
                                <div className="text-sm font-medium">Steps:</div>
                                <ol className="list-decimal list-inside space-y-1">
                                  {item.steps?.map((step, stepIndex) => (
                                    <li key={stepIndex} className="text-sm text-muted-foreground">
                                      {step}
                                    </li>
                                  ))}
                                </ol>
                              </div>

                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-1">
                                    <BarChart className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                      {item.metric?.name}: {item.metric?.target} in {item.metric?.timeframeDays} days
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    Complete in {item.suggestedDeadlineDays} days
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Quick Wins */}
                    {currentPlan.plan.quickWins && currentPlan.plan.quickWins.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                          <Zap className="w-5 h-5 text-accent" />
                          <span>Quick Wins</span>
                        </h3>
                        <div className="space-y-3">
                          {currentPlan.plan.quickWins.map((quickWin, index) => (
                            <Card key={index} className="p-4">
                              <h4 className="font-semibold mb-2">{quickWin.title}</h4>
                              <ul className="space-y-1">
                                {quickWin.steps?.map((step, stepIndex) => (
                                  <li key={stepIndex} className="text-sm text-muted-foreground flex items-start">
                                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                    {step}
                                  </li>
                                ))}
                              </ul>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty State */}
                {selectedProfileId && !currentPlan && !generatePlan.isPending && (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No plan generated yet</h3>
                    <p className="text-muted-foreground">
                      Click "Generate Plan" to create your personalized action plan
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  );
}
