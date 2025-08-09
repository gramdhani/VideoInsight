import OpenAI from "openai";

// OpenRouter client using OpenAI GPT-4o-mini for web search simulation  
const openaiSearch = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://videoinsight-ai.replit.app", // Your site URL for rankings
    "X-Title": "VideoInsight AI", // Your site name for rankings
  },
});

export interface WebSearchInfo {
  hasWebInfo: boolean;
  webContent: string;
  searchQuery: string;
}

// Intelligent detection: Check if a query needs web search based on keywords and context
export function needsWebSearch(question: string, videoTitle?: string): boolean {
  const questionLower = question.toLowerCase();
  
  // High-priority web search indicators (current information needed)
  const highPriorityKeywords = [
    'competitor', 'competitors', 'alternative', 'alternatives',
    'compare', 'vs', 'versus', 'compared to', 'similar to',
    'current', 'latest', 'recent', 'today', 'now', '2024', '2025',
    'price', 'cost', 'pricing', 'how much', 'expensive',
    'market', 'industry', 'trends', 'popular'
  ];
  
  // Question patterns that need web search
  const webSearchPatterns = [
    /who is .+/,           // "who is the CEO of..."
    /what is .+ doing/,    // "what is Company X doing now"
    /is there .+/,         // "is there a better alternative"
    /are there .+/,        // "are there competitors to..."
    /how does .+ compare/, // "how does X compare to Y"
    /what are the .+ options/, // "what are the current options"
  ];
  
  // Context-aware detection: company/product names often need current info
  const hasCompanyContext = /\b(company|startup|business|app|service|tool|platform)\b/.test(questionLower);
  const hasCurrentContext = /\b(nowadays|currently|right now|these days)\b/.test(questionLower);
  
  // Check high-priority keywords
  if (highPriorityKeywords.some(keyword => questionLower.includes(keyword))) {
    return true;
  }
  
  // Check question patterns
  if (webSearchPatterns.some(pattern => pattern.test(questionLower))) {
    return true;
  }
  
  // Context-based detection
  if (hasCompanyContext && hasCurrentContext) {
    return true;
  }
  
  return false;
}

// Use GPT-4o-mini to simulate web search information (without real web search)
export async function searchWebWithAI(question: string, videoTitle: string): Promise<WebSearchInfo> {
  try {
    console.log(`🔍 Simulating web search for: ${question}`);
    
    const searchPrompt = `The user is asking about a video titled "${videoTitle}" and has this question: "${question}"

Since this question appears to need current market information, competitors, or pricing data, provide general knowledge-based information that would typically be found through web search. Focus on:
- Known competitors or alternatives in the space
- General market information and industry context
- Common pricing models or approaches
- Industry trends you're aware of

Important: Be clear that this is general knowledge, not current web search results. If you don't have specific current information, acknowledge that and provide what general context you can.

Format your response as informative context that supplements video analysis.`;

    const response = await openaiSearch.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: searchPrompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    const webContent = response.choices[0].message.content || "";
    
    // Check if meaningful information was provided
    const hasWebInfo = webContent.length > 50 && 
                      !webContent.toLowerCase().includes("i cannot search") &&
                      !webContent.toLowerCase().includes("i don't have access") &&
                      !webContent.toLowerCase().includes("unable to search") &&
                      !webContent.toLowerCase().includes("i don't have specific current information");

    return {
      hasWebInfo,
      webContent: hasWebInfo ? webContent : "",
      searchQuery: question
    };

  } catch (error) {
    console.error("Web search with AI failed:", error);
    return {
      hasWebInfo: false,
      webContent: "",
      searchQuery: question
    };
  }
}