interface YouTubeVideoInfo {
  title: string;
  channel: string;
  duration: string;
  views: string;
  thumbnail: string;
  transcript?: string;
}

export function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export async function getVideoInfo(videoId: string): Promise<YouTubeVideoInfo> {
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY_ENV_VAR || "default_key";
  
  try {
    // Get video details
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,statistics,contentDetails`
    );
    
    if (!videoResponse.ok) {
      throw new Error('Failed to fetch video information');
    }
    
    const videoData = await videoResponse.json();
    
    if (!videoData.items || videoData.items.length === 0) {
      throw new Error('Video not found');
    }
    
    const video = videoData.items[0];
    
    // Format duration from ISO 8601 to readable format
    const duration = formatDuration(video.contentDetails.duration);
    
    // Format view count
    const views = formatViewCount(video.statistics.viewCount);
    
    return {
      title: video.snippet.title,
      channel: video.snippet.channelTitle,
      duration,
      views,
      thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url,
      transcript: await getVideoTranscript(videoId), // This would need a transcript service
    };
  } catch (error) {
    throw new Error("Failed to fetch video information: " + (error instanceof Error ? error.message : String(error)));
  }
}

function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return "0:00";
  
  const hours = parseInt(match[1]?.replace('H', '') || '0');
  const minutes = parseInt(match[2]?.replace('M', '') || '0');
  const seconds = parseInt(match[3]?.replace('S', '') || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatViewCount(count: string): string {
  const num = parseInt(count);
  if (num >= 1000000) {
    return Math.floor(num / 1000000) + 'M views';
  } else if (num >= 1000) {
    return Math.floor(num / 1000) + 'K views';
  }
  return num + ' views';
}

async function getVideoTranscript(videoId: string): Promise<string> {
  // For now, return a placeholder since transcript extraction requires additional setup
  // In production, you'd use a service like youtube-transcript-api or similar
  return `This is a placeholder transcript for video ${videoId}. In production, this would contain the actual video transcript extracted from YouTube's captions or a transcript service.`;
}
