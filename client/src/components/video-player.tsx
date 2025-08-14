import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRef, useImperativeHandle, forwardRef, useState } from "react";

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

export interface VideoPlayerRef {
  jumpToTime: (timeInSeconds: number) => void;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({ video }, ref) => {
  const isMobile = useIsMobile();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [startTime, setStartTime] = useState<number>(0);
  
  useImperativeHandle(ref, () => ({
    jumpToTime: (timeInSeconds: number) => {
      console.log(`Jumping to time: ${timeInSeconds} seconds`);
      // Update state to trigger re-render with new start time
      setStartTime(timeInSeconds);
    }
  }));
  
  return (
    <Card className={`modern-card shadow-modern overflow-hidden ${isMobile ? 'mobile-card' : ''}`}>
      <div className="aspect-video bg-gray-900 relative">
        <iframe
          ref={iframeRef}
          key={startTime} // Force re-render when startTime changes
          src={`https://www.youtube.com/embed/${video.youtubeId}?start=${startTime}&autoplay=1&rel=0`}
          title={video.title}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
      <CardContent className={`${isMobile ? 'p-4' : 'p-3 sm:p-4'}`}>
        <h3 className={`font-semibold ${
          isMobile 
            ? 'text-lg mb-3 text-foreground leading-tight' 
            : 'text-base sm:text-lg mb-2 text-foreground leading-tight'
        }`}>
          {video.title}
        </h3>
        <div className={`flex items-center ${
          isMobile 
            ? 'flex-col items-start space-y-2' 
            : 'space-x-4'
        } ${
          isMobile ? 'text-sm' : 'text-xs sm:text-sm'
        } text-muted-foreground`}>
          <span className="font-medium">{video.channel}</span>
          {!isMobile && (
            <>
              <span>{video.duration}</span>
              <span>{video.views}</span>
            </>
          )}
          {isMobile && (
            <div className="flex items-center space-x-4 text-xs">
              <span>{video.duration}</span>
              <span>{video.views}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
