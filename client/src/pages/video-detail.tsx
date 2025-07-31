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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Left column - Video and Content */}
        <div className="lg:col-span-2 space-y-6 overflow-hidden flex flex-col">
          {/* Video Player */}
          <div className="relative flex-shrink-0">
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

          {/* Video Info */}
          <div className="flex-shrink-0 px-1">
            <div className="text-sm text-[var(--text-secondary)] mb-1">
              {video.channel} • {video.views} • {video.duration}
            </div>
          </div>

          {/* Content Tabs */}
          <div className="flex-1 min-h-0 flex flex-col">
            <Tabs defaultValue="summary" className="w-full h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                <TabsTrigger value="summary">
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 text-primary">✨</span>
                    AI Summary
                  </span>
                </TabsTrigger>
                <TabsTrigger value="transcript">
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 text-primary">📄</span>
                    Transcript
                  </span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="flex-1 min-h-0 mt-4 space-y-4 overflow-y-auto">
                {video.summary ? (
                  <Card className="h-fit">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">✨</span>
                          <CardTitle className="text-lg">AI Summary</CardTitle>
                          <Button variant="ghost" size="sm" className="ml-auto">
                            <Download className="w-4 h-4 mr-2" />
                            Export Notes
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <Badge variant="secondary">
                          {video.summary.insights} insights
                        </Badge>
                        <Badge variant="outline">
                          {video.summary.readingTime}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <span className="text-primary">🎯</span>
                          Key Points
                        </h4>
                        <ul className="space-y-2">
                          {video.summary.keyPoints.map((point, index) => (
                            <li key={index} className="text-sm flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
                              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                              <span className="leading-relaxed">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {video.summary.ahaMonents && video.summary.ahaMonents.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <span className="text-primary">💡</span>
                            Aha Moments
                          </h4>
                          <div className="space-y-3">
                            {video.summary.ahaMonents.map((moment, index) => (
                              <div key={index} className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                                <div className="text-xs text-primary font-medium mb-2 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {moment.timestamp}
                                </div>
                                <div className="text-sm leading-relaxed">{moment.content}</div>
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
              
              <TabsContent value="transcript" className="flex-1 min-h-0 mt-4 overflow-y-auto">
                {video.transcript ? (
                  <Card className="h-fit">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-primary">📄</span>
                        Transcript
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
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
        </div>

        {/* Right column - Chat Interface */}
        <div className="space-y-4 h-full flex flex-col">
          {/* Quick Actions */}
          <div className="flex-shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs h-8">
                <span className="mr-1">📝</span>
                Shorter Summary
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-8">
                <span className="mr-1">🔍</span>
                Detailed Analysis
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-8">
                <span className="mr-1">✅</span>
                Action Items
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-8">
                <span className="mr-1">💬</span>
                Key Quotes
              </Button>
            </div>
          </div>

          {/* Chat Interface */}
          <Card className="flex-1 min-h-0 flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💬</span>
                  <CardTitle className="text-base">Ask About This Video</CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  <span className="sr-only">Delete chat</span>
                  🗑️
                </Button>
              </div>
              <CardDescription className="text-xs">
                Ask specific questions about the video content
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory && chatHistory.length > 0 ? (
                  chatHistory.map((chat) => (
                    <div key={chat.id} className="space-y-3">
                      <div className="bg-[var(--muted)] p-3 rounded-lg">
                        <div className="text-xs font-medium text-[var(--text-secondary)] mb-1">
                          You asked:
                        </div>
                        <div className="text-sm">{chat.message}</div>
                      </div>
                      <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                        <div className="text-xs font-medium text-primary mb-1">
                          AI Response:
                        </div>
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">{chat.response}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-[var(--text-secondary)] py-8">
                    <div className="text-2xl mb-2">🤖</div>
                    <div className="text-sm font-medium mb-1">Hi! I've analyzed the video. Ask me anything</div>
                    <div className="text-xs">about the content, key concepts, or specific moments.</div>
                    <div className="text-xs text-primary mt-2">Just now</div>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 p-4 border-t">
                <div className="text-center text-xs text-[var(--text-secondary)]">
                  Go back to the main page to continue the conversation
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}