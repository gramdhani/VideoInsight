import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";

interface VideoPlayerProps {
  video: {
    youtubeId: string;
    title: string;
    channel: string;
    duration: string;
    views: string;
    thumbnail: string;
  };
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  return (
    <Card className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="aspect-video bg-gray-900 relative">
        <iframe
          src={`https://www.youtube.com/embed/${video.youtubeId}`}
          title={video.title}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-[var(--text-main)]">
          {video.title}
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{video.channel}</span>
          <span>{video.duration}</span>
          <span>{video.views}</span>
        </div>
      </CardContent>
    </Card>
  );
}
