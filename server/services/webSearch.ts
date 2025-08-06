// Web search service for real-time internet browsing
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
}

export interface WebSearchResponse {
  query: string;
  results: SearchResult[];
  searchTimestamp: number;
}

// Simple web scraping function to extract content from URLs
async function extractContentFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VideoInsight-AI/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Simple text extraction - remove HTML tags and get meaningful content
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Return first 2000 characters of meaningful content
    return textContent.substring(0, 2000);
  } catch (error) {
    console.error(`Error extracting content from ${url}:`, error);
    return '';
  }
}

// Use DuckDuckGo's instant answer API for web search
export async function searchWeb(query: string, maxResults: number = 5): Promise<WebSearchResponse> {
  try {
    // DuckDuckGo Instant Answer API
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const data = await response.json();
    
    const results: SearchResult[] = [];

    // Process DuckDuckGo results
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (let i = 0; i < Math.min(data.RelatedTopics.length, maxResults); i++) {
        const topic = data.RelatedTopics[i];
        if (topic.FirstURL && topic.Text) {
          results.push({
            title: topic.Text.substring(0, 100),
            url: topic.FirstURL,
            snippet: topic.Text,
          });
        }
      }
    }

    // If no results from RelatedTopics, try Abstract
    if (results.length === 0 && data.Abstract) {
      results.push({
        title: data.Heading || 'Search Result',
        url: data.AbstractURL || '',
        snippet: data.Abstract,
      });
    }

    // Fallback: Use a simple news API for current events
    if (results.length === 0) {
      try {
        // Try NewsAPI (free tier) for current events
        const newsResponse = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=relevancy&pageSize=3&apiKey=demo`
        );
        
        if (newsResponse.ok) {
          const newsData = await newsResponse.json();
          if (newsData.articles) {
            newsData.articles.forEach((article: any) => {
              results.push({
                title: article.title,
                url: article.url,
                snippet: article.description || article.content?.substring(0, 200) || '',
                publishedDate: article.publishedAt,
              });
            });
          }
        }
      } catch (newsError) {
        console.error('News API fallback failed:', newsError);
      }
    }

    return {
      query,
      results: results.slice(0, maxResults),
      searchTimestamp: Date.now(),
    };

  } catch (error) {
    console.error('Web search error:', error);
    throw new Error(`Failed to search web: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Enhanced search that includes content extraction
export async function searchWebWithContent(query: string, maxResults: number = 3): Promise<WebSearchResponse & { detailedResults: Array<SearchResult & { content: string }> }> {
  const searchResponse = await searchWeb(query, maxResults);
  
  const detailedResults = await Promise.all(
    searchResponse.results.map(async (result) => {
      const content = await extractContentFromUrl(result.url);
      return {
        ...result,
        content,
      };
    })
  );

  return {
    ...searchResponse,
    detailedResults,
  };
}

// Check if a query needs web search
export function needsWebSearch(query: string, videoTitle?: string): boolean {
  const webSearchKeywords = [
    'current', 'latest', 'recent', 'today', 'now', 'news',
    'price', 'cost', 'stock', 'market', 'update',
    'who is', 'what is', 'when did', 'where is',
    'compare', 'vs', 'versus', 'difference between',
    'reviews', 'ratings', 'competitors',
    'weather', 'traffic', 'schedule',
    'search for', 'look up', 'find information about',
    'browse', 'internet', 'web search'
  ];

  const queryLower = query.toLowerCase();
  
  // Check for explicit web search requests
  if (webSearchKeywords.some(keyword => queryLower.includes(keyword))) {
    return true;
  }

  // Check for questions that likely need current info
  const currentInfoPatterns = [
    /how much (does|is|are)/i,
    /what.*(happening|going on)/i,
    /is.*still/i,
    /does.*exist/i,
    /where can i (buy|find|get)/i,
  ];

  return currentInfoPatterns.some(pattern => pattern.test(query));
}