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

// Check if a query needs web search based on keywords and context
export function needsWebSearch(question: string, videoTitle?: string): boolean {
  const webSearchKeywords = [
    'competitor', 'competitors', 'compare', 'vs', 'versus', 'alternative',
    'current', 'latest', 'recent', 'today', 'now', 'price', 'cost',
    'who is', 'what is', 'where can', 'how much does', 'is there',
    'similar to', 'like', 'other', 'market', 'industry',
    'reviews', 'rating', 'better than', 'worse than'
  ];

  const questionLower = question.toLowerCase();
  
  // Check for explicit web search needs
  return webSearchKeywords.some(keyword => questionLower.includes(keyword));
}

// Use GPT-4o-mini-search-preview to gather web information
export async function searchWebWithAI(question: string, videoTitle: string): Promise<WebSearchInfo> {
  try {
    console.log(`Using GPT-4o-mini-search-preview for web search: ${question}`);
    
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