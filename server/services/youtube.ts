interface YouTubeVideoInfo {
  title: string;
  channel: string;
  duration: string;
  views: string;
  thumbnail: string;
  transcript?: string;
  transcriptData?: TranscriptItem[];
}

interface TranscriptItem {
  text: string;
  startMs: string;
  endMs: string;
  startTimeText: string;
}

interface ScrapeCreatorsResponse {
  videoId: string;
  type: string;
  url: string;
  transcript: TranscriptItem[];
  transcript_only_text: string;
}

export function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export async function getVideoInfo(videoId: string): Promise<YouTubeVideoInfo> {
  const youtubeApiKey = process.env.YOUTUBE_API_KEY;
  
  if (!youtubeApiKey) {
    throw new Error('YouTube API key is not configured');
  }
  
  try {
    // Get video details from YouTube API
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${youtubeApiKey}&part=snippet,statistics,contentDetails`
    );
    
    if (!videoResponse.ok) {
      const errorData = await videoResponse.json().catch(() => ({}));
      throw new Error(`YouTube API error: ${videoResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
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
    
    // Get transcript from ScrapeCreators API
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const transcriptResult = await getVideoTranscript(videoUrl);
    
    return {
      title: video.snippet.title,
      channel: video.snippet.channelTitle,
      duration,
      views,
      thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url,
      transcript: transcriptResult.text,
      transcriptData: transcriptResult.segments,
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

async function getVideoTranscript(videoUrl: string): Promise<{ text: string; segments: TranscriptItem[] }> {
  const scrapeCreatorsApiKey = process.env.SCRAPE_CREATORS_API_KEY;
  
  if (!scrapeCreatorsApiKey) {
    throw new Error('ScrapeCreators API key is not configured');
  }
  
  try {
    const response = await fetch(
      `https://api.scrapecreators.com/v1/youtube/video/transcript?url=${encodeURIComponent(videoUrl)}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': scrapeCreatorsApiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`ScrapeCreators API error: ${response.status} - ${errorData.message || 'Failed to fetch transcript'}`);
    }
    
    const data: ScrapeCreatorsResponse = await response.json();
    
    // Return both text and structured segments
    return {
      text: data.transcript_only_text || 'No transcript available for this video',
      segments: data.transcript || [],
    };
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw new Error("Failed to fetch video transcript: " + (error instanceof Error ? error.message : String(error)));
  }
}
