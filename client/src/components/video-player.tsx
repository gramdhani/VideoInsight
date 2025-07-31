import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRef, useImperativeHandle, forwardRef } from "react";

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
  
  useImperativeHandle(ref, () => ({
    jumpToTime: (timeInSeconds: number) => {
      if (iframeRef.current) {
        // Send postMessage to YouTube iframe to jump to specific time
        iframeRef.current.contentWindow?.postMessage(
          `{"event":"command","func":"seekTo","args":[${timeInSeconds}, true]}`,
          "*"
        );
      }
    }
  }));
  
  return (
    <Card className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="aspect-video bg-gray-900 relative">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${video.youtubeId}?enablejsapi=1&origin=${window.location.origin}`}
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
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
