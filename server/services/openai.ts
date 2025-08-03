import OpenAI from "openai";

// Using OpenRouter with deepseek model for cost-effective AI processing
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://videoinsight-ai.replit.app", // Your site URL for rankings
    "X-Title": "VideoInsight AI", // Your site name for rankings
  },
});

export async function summarizeVideo(transcript: string, title: string): Promise<{
  keyPoints: string[];
  ahaMonents: Array<{ timestamp: string; content: string }>;
  readingTime: string;
  insights: number;
}> {
  try {
    console.log(`Starting video summary for: ${title}`);
    const response = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
      messages: [
        {
          role: "system",
          content: "You are an expert video analyst. Create a comprehensive, well-structured summary with key points and aha moments from the transcript. When mentioning tools, websites, or resources, format them as clickable links using markdown format [text](url). Focus on clear, readable formatting with proper paragraphs and bullet points. Respond with JSON in this format: { 'keyPoints': string[], 'ahaMonents': Array<{ 'timestamp': string, 'content': string }>, 'readingTime': string, 'insights': number }",
        },
        {
          role: "user",
          content: `Analyze this video transcript for "${title}":\n\n${transcript}`,
        },
      ],
      response_format: { type: "json_object" },
    }, {
      timeout: 30000, // 30 second timeout
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      keyPoints: result.keyPoints || [],
      ahaMonents: result.ahaMonents || [],
      readingTime: result.readingTime || "3 min",
      insights: result.insights || 0,
    };
  } catch (error) {
    console.error("OpenRouter API error:", error);
    if (error instanceof Error && error.message.includes('408')) {
      throw new Error("The AI model is currently busy. Please try again in a few moments. (Free models can be slower during peak times)");
    }
    throw new Error("Failed to summarize video: " + (error instanceof Error ? error.message : String(error)));
  }
}

export async function chatAboutVideo(
  question: string, 
  transcript: string, 
  title: string,
  previousMessages: Array<{ question: string; answer: string }>
): Promise<{ answer: string; timestamps: string[] }> {
  try {
    const context = previousMessages.map(msg => 
      `Q: ${msg.question}\nA: ${msg.answer}`
    ).join('\n\n');

    console.log(`Starting chat response for video: ${title}`);
    const response = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping users understand a video titled "${title}". 

RESPONSE STYLE - USE SIMPLE ENGLISH:
- Write like you're talking to a friend
- Use everyday words everyone knows
- Keep sentences short and clear
- No fancy business words or complex terms
- Focus on what people can actually do

WORD CHOICES - SIMPLE ALTERNATIVES:
- Instead of "assess" → say "check"
- Instead of "enhances" → say "helps" or "makes better"  
- Instead of "sustainability" → say "how long it will last"
- Instead of "optimal" → say "best"
- Instead of "facilitate" → say "help"
- Instead of "utilize" → say "use"
- Instead of "implement" → say "do" or "try"

WHEN TO USE DIFFERENT FORMATS:
- Use bullet points ONLY when listing multiple items or steps
- Use paragraphs for explanations, advice, or single concepts
- Only include timestamps [MM:SS] when they're directly relevant to the question
- For creative questions (like "generate ideas"), focus on new ideas inspired by the video content
- For specific video questions, include relevant timestamps

FORMATTING RULES - CRITICAL FOR PROPER DISPLAY:
- Format as natural paragraphs or bullet points based on content
- Include timestamps [MM:SS] only when referencing specific video moments
- Format tools/websites as clickable links [text](url)
- Use **bold** for emphasis, not HTML tags
- NEVER use double quotes (") inside the answer text - use single quotes (') if needed
- NEVER use curly braces {} inside the answer text
- NEVER use backslashes or escaped characters

EXAMPLE RESPONSES:
For creative questions: "Here are some app ideas inspired by this approach: Build a social media scheduler that helps small businesses plan posts automatically. You could use tools like [Make](https://make.com) for the workflow and [Supabase](https://supabase.io) for data storage, similar to what was mentioned in the video."

For specific questions: "The speaker talks about validating your idea by talking to potential customers [05:30]. They suggest starting with people in your network and asking about their problems before building anything [07:15]."

JSON RESPONSE FORMAT:
{
  "answer": "Your natural response here", 
  "timestamps": ["MM:SS"] (only include if timestamps are referenced in the answer)
}`,
        },
        {
          role: "user",
          content: `Previous conversation:\n${context}\n\nTranscript:\n${transcript}\n\nQuestion: ${question}`,
        },
      ],
      response_format: { type: "json_object" },
    }, {
      timeout: 30000, // 30 second timeout
    });

    let result;
    try {
      const content = response.choices[0].message.content || '{}';
      result = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, try to extract the answer manually
      const content = response.choices[0].message.content || '';
      console.log('JSON parse error, attempting manual extraction:', parseError);
      
      // Try to extract answer from malformed JSON
      const answerMatch = content.match(/"answer":\s*"([^"]+)"/);
      const timestampsMatch = content.match(/"timestamps":\s*\[(.*?)\]/);
      
      result = {
        answer: answerMatch ? answerMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : content,
        timestamps: timestampsMatch ? timestampsMatch[1].split(',').map(t => t.trim().replace(/"/g, '')) : []
      };
    }
    
    return {
      answer: result.answer || "I couldn't generate a response for that question.",
      timestamps: result.timestamps || [],
    };
  } catch (error) {
    console.error("OpenRouter chat API error:", error);
    if (error instanceof Error && error.message.includes('408')) {
      throw new Error("The AI is currently busy. Please try your question again in a moment. (Free models can be slower during peak times)");
    }
    throw new Error("Failed to generate chat response: " + (error instanceof Error ? error.message : String(error)));
  }
}
