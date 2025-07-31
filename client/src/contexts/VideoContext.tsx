import { createContext, useContext, useState, ReactNode } from 'react';
import type { Video } from '@shared/schema';

interface VideoContextType {
  currentVideo: Video | null;
  setCurrentVideo: (video: Video | null) => void;
  resetVideo: () => void;
}

const VideoContext = createContext<VideoContextType | null>(null);

export function VideoProvider({ children }: { children: ReactNode }) {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);

  const resetVideo = () => {
    setCurrentVideo(null);
    // Clear URL parameters if any
    window.history.replaceState({}, "", window.location.pathname);
  };

  return (
    <VideoContext.Provider value={{ currentVideo, setCurrentVideo, resetVideo }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
}