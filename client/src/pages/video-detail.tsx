import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Clock, Eye, Calendar, Download } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import type { Video, ChatMessage } from "@shared/schema";
// These components will be imported once they're available
// import ChatInterface from "@/components/chat-interface";
// import VideoPlayer from "@/components/video-player"; 
// import SummaryCard from "@/components/summary-card";
// import NotesExport from "@/components/notes-export";

export default function VideoDetail() {
  const { id } = useParams();
  
  const { data: video, isLoading: videoLoading } = useQuery<Video>({
    queryKey: ["/api/videos", id],
  });

  const { data: chatHistory } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", id],
    enabled: !!id,
  });

  if (videoLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Play className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-[var(--text-main)]">Video not found</h2>
          <p className="text-[var(--text-secondary)] max-w-md">
            This video doesn't exist or you don't have access to it.
          </p>
        </div>
        <Button asChild>
          <Link href="/library">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/library">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Library
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] line-clamp-2">
            {video.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] mt-2">
            <span>{video.channel}</span>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {video.views}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {video.duration}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {video.createdAt ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }) : 'Recently'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Video and Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="relative">
            <iframe
              width="100%"
              height="400"
              src={`https://www.youtube.com/embed/${video.youtubeId}`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            />
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">AI Summary</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4">
              {video.summary ? (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Summary</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Badge variant="secondary">
                        {video.summary.insights} insights
                      </Badge>
                      <Badge variant="outline">
                        {video.summary.readingTime}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Key Points</h4>
                      <ul className="space-y-1">
                        {video.summary.keyPoints.map((point, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {video.summary.ahaMonents && video.summary.ahaMonents.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Key Moments</h4>
                        <div className="space-y-2">
                          {video.summary.ahaMonents.map((moment, index) => (
                            <div key={index} className="p-3 bg-[var(--muted)] rounded-lg">
                              <div className="text-xs text-primary font-medium mb-1">
                                {moment.timestamp}
                              </div>
                              <div className="text-sm">{moment.content}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Summary Available</CardTitle>
                    <CardDescription>
                      This video hasn't been analyzed yet.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="transcript" className="space-y-4">
              {video.transcript ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Transcript</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {video.transcript}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Transcript Available</CardTitle>
                    <CardDescription>
                      Transcript is not available for this video.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column - Chat Interface */}
        <div className="space-y-6">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Chat History</CardTitle>
              <CardDescription>
                Your conversation about this video
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {chatHistory && chatHistory.length > 0 ? (
                    chatHistory.map((chat) => (
                      <div key={chat.id} className="space-y-3">
                        <div className="bg-[var(--muted)] p-3 rounded-lg">
                          <div className="text-sm font-medium text-[var(--text-main)]">
                            You asked:
                          </div>
                          <div className="text-sm mt-1">{chat.message}</div>
                        </div>
                        <div className="bg-primary/5 p-3 rounded-lg">
                          <div className="text-sm font-medium text-primary mb-1">
                            AI Response:
                          </div>
                          <div className="text-sm whitespace-pre-wrap">{chat.response}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-[var(--text-secondary)] py-8">
                      <div className="text-sm">No chat history for this video yet.</div>
                      <div className="text-xs mt-1">Start a conversation about this video on the main page.</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}