import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
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
      <CardContent className="p-3 sm:p-4">
        <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'} mb-2 text-[var(--text-main)] leading-tight`}>
          {video.title}
        </h3>
        <div className={`flex items-center ${isMobile ? 'flex-col items-start space-y-1' : 'space-x-4'} ${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
          <span className="font-medium">{video.channel}</span>
          {!isMobile && (
            <>
              <span>{video.duration}</span>
              <span>{video.views}</span>
            </>
          )}
          {isMobile && (
            <div className="flex items-center space-x-3">
              <span>{video.duration}</span>
              <span>{video.views}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
