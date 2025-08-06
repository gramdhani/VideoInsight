import OpenAI from "openai";
import { storage } from "../storage";

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
  shortSummary: string;
  outline: Array<{ title: string; items: string[] }>;
  keyTakeaways: Array<{ title: string; description: string; timestamp?: string }>;
  actionableSteps: Array<{ step: string; description: string; priority: 'high' | 'medium' | 'low' }>;
  readingTime: string;
  insights: number;
}> {
  try {
    console.log(`Starting video summary for: ${title}`);
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-lite-preview-06-17",
      messages: [
        {
          role: "system",
          content: `You are an expert video analyst. Create a comprehensive, well-structured summary following this exact format. Use simple, everyday language that's easy to understand. When mentioning tools, websites, or resources, format them as clickable links using markdown format [text](url).

Respond with JSON in this exact format:
{
  "shortSummary": "A brief 2-3 sentence overview of what this video is about and its main purpose",
  "outline": [
    {
      "title": "Section name (e.g., Introduction, Main Concept, etc.)",
      "items": ["Key point 1", "Key point 2", "Key point 3"]
    }
  ],
  "keyTakeaways": [
    {
      "title": "Simple takeaway title",
      "description": "Clear explanation of why this matters",
      "timestamp": "MM:SS (if specific moment mentioned)"
    }
  ],
  "actionableSteps": [
    {
      "step": "Clear action item",
      "description": "Simple explanation of how to do it",
      "priority": "high" or "medium" or "low"
    }
  ],
  "readingTime": "X min",
  "insights": number_of_insights
}

GUIDELINES:
- Use simple words everyone can understand
- Make takeaways practical and useful
- Include timestamps when referencing specific video moments
- Prioritize action steps: high (do first), medium (do soon), low (do later)
- Keep everything clear and actionable`,
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
      shortSummary: result.shortSummary || "Video summary not available",
      outline: result.outline || [],
      keyTakeaways: result.keyTakeaways || [],
      actionableSteps: result.actionableSteps || [],
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
  previousMessages: Array<{ question: string; answer: string }>,
  videoDuration?: string
): Promise<{ answer: string; timestamps: string[] }> {
  try {
    const context = previousMessages.map(msg => 
      `Q: ${msg.question}\nA: ${msg.answer}`
    ).join('\n\n');

    console.log(`Starting chat response for video: ${title}`);
    console.log(`Video duration: ${videoDuration}`);
    console.log(`Transcript length: ${transcript.length} characters`);
    console.log(`Transcript preview: ${transcript.substring(0, 200)}...`);

    // Get active prompt configuration
    let systemPrompt = `You are an AI assistant helping users understand a video titled "${title}". You have access to the complete video transcript with timestamps. When users ask about specific information, events, numbers, or quotes, carefully search through the transcript to find the exact moment and provide the accurate timestamp.

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

TIMESTAMP USAGE - CRITICAL INSTRUCTIONS:
- When users ask about specific information, events, or mentions in the video, ALWAYS search the transcript carefully
- Include timestamps [MM:SS] when you find the relevant moment in the transcript
- If the user asks "what timestamp did he mention X?", find that exact moment and provide the timestamp
- Don't say "the video doesn't provide a timestamp" - instead search for the content and provide the timestamp where it occurs
- Be specific and accurate with timestamp references

WHEN TO USE DIFFERENT FORMATS:
- Use bullet points ONLY when listing multiple items or steps
- Use paragraphs for explanations, advice, or single concepts
- ALWAYS include timestamps [MM:SS] when referencing specific video moments or answering timestamp questions
- For creative questions (like "generate ideas"), focus on new ideas inspired by the video content
- For specific video questions, include relevant timestamps

FORMATTING RULES - CRITICAL FOR PROPER DISPLAY:
- Format as natural paragraphs or bullet points based on content
- Include timestamps [MM:SS] when referencing specific video moments
- Format tools/websites as clickable links [text](url)
- Use **bold** for emphasis, not HTML tags
- NEVER use double quotes (") inside the answer text - use single quotes (') if needed
- NEVER use curly braces {} inside the answer text
- NEVER use backslashes or escaped characters

EXAMPLE RESPONSES:
For timestamp questions: "He mentions reaching $11,000 MRR at [08:45] when talking about the business growth milestones."

For revenue/numbers questions: "The creator says EUform reached $11,000 in monthly recurring revenue at [12:30]. He explains this happened after implementing the pricing strategy he copied from the competitor."

For creative questions: "Here are some app ideas inspired by this approach: Build a social media scheduler that helps small businesses plan posts automatically. You could use tools like [Make](https://make.com) for the workflow and [Supabase](https://supabase.io) for data storage, similar to what was mentioned in the video."

For specific questions: "The speaker talks about validating your idea by talking to potential customers [05:30]. They suggest starting with people in your network and asking about their problems before building anything [07:15]."

JSON RESPONSE FORMAT:
{
  "answer": "Your natural response here", 
  "timestamps": ["MM:SS"] (only include if timestamps are referenced in the answer)
}`;

    let userPrompt = `Previous conversation:\n${context}\n\nVideo Duration: ${videoDuration || 'Unknown'}\n\nFull Video Transcript with Timestamps:\n${transcript}\n\nUser Question: ${question}\n\nIMPORTANT: Only provide timestamps that exist in the transcript above. Do not generate or guess timestamps. If you cannot find the exact information with a timestamp in the transcript, say so honestly. Make sure any timestamps you reference do not exceed the video duration.`;

    // Try to get active prompt configuration from database
    try {
      const activeConfig = await storage.getActivePromptConfig();
      if (activeConfig) {
        console.log(`Using active prompt config: ${activeConfig.name}`);
        
        // Replace variables in system prompt
        systemPrompt = activeConfig.systemPrompt.replace(/\$\{title\}/g, title);
        
        // Replace variables in user prompt
        userPrompt = activeConfig.userPrompt
          .replace(/\$\{context\}/g, context)
          .replace(/\$\{videoDuration\}/g, videoDuration || 'Unknown')
          .replace(/\$\{transcript\}/g, transcript)
          .replace(/\$\{question\}/g, question);
      }
    } catch (error) {
      console.log("Using default prompts due to error:", error);
    }
    
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-lite-preview-06-17",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
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
    
    // Validate timestamps don't exceed video duration
    let validatedTimestamps = result.timestamps || [];
    if (videoDuration && validatedTimestamps.length > 0) {
      // Convert video duration (e.g., "10:23") to seconds
      const durationParts = videoDuration.split(':').map(Number);
      const totalDurationSeconds = durationParts.length === 2 
        ? durationParts[0] * 60 + durationParts[1]
        : durationParts.length === 3
        ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
        : 0;
      
      validatedTimestamps = validatedTimestamps.filter((timestamp: string) => {
        const timestampParts = timestamp.split(':').map(Number);
        const timestampSeconds = timestampParts.length === 2
          ? timestampParts[0] * 60 + timestampParts[1]
          : timestampParts.length === 3
          ? timestampParts[0] * 3600 + timestampParts[1] * 60 + timestampParts[2]
          : 0;
        
        const isValid = timestampSeconds <= totalDurationSeconds;
        if (!isValid) {
          console.log(`Filtered invalid timestamp ${timestamp} (${timestampSeconds}s) exceeds video duration ${videoDuration} (${totalDurationSeconds}s)`);
        }
        return isValid;
      });
    }
    
    return {
      answer: result.answer || "I couldn't generate a response for that question.",
      timestamps: validatedTimestamps,
    };
  } catch (error) {
    console.error("OpenRouter chat API error:", error);
    if (error instanceof Error && error.message.includes('408')) {
      throw new Error("The AI is currently busy. Please try your question again in a moment. (Free models can be slower during peak times)");
    }
    throw new Error("Failed to generate chat response: " + (error instanceof Error ? error.message : String(error)));
  }
}
