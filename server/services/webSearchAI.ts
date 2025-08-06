import OpenAI from "openai";

// OpenAI client for web search using GPT-4o-mini-search-preview
const openaiSearch = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

// Use GPT-4o-mini-search-preview to gather web information
export async function searchWebWithAI(question: string, videoTitle: string): Promise<WebSearchInfo> {
  try {
    console.log(`🔍 Intelligent detection triggered web search for: ${question}`);
    
    const searchPrompt = `You have web search capabilities. The user is asking about a video titled "${videoTitle}" and has this question: "${question}"

Please search the web for current, relevant information that would help answer this question. Focus on:
- Competitors or alternatives mentioned in the question
- Current market information, pricing, or comparisons
- Recent developments or updates
- Industry context that supplements video content

Provide a comprehensive summary of what you found, including sources when possible. If you can't find relevant information, say so clearly.

Format your response as factual information that can be combined with video analysis.`;

    const response = await openaiSearch.chat.completions.create({
      model: "gpt-4o-mini-search-preview", // This model has web search capabilities
      messages: [
        {
          role: "user",
          content: searchPrompt
        }
      ],
      max_tokens: 800
    });

    const webContent = response.choices[0].message.content || "";
    
    // Check if meaningful web information was found
    const hasWebInfo = webContent.length > 50 && 
                      !webContent.toLowerCase().includes("i cannot search") &&
                      !webContent.toLowerCase().includes("i don't have access") &&
                      !webContent.toLowerCase().includes("unable to search");

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