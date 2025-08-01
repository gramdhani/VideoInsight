import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function summarizeVideo(transcript: string, title: string): Promise<{
  keyPoints: string[];
  ahaMonents: Array<{ timestamp: string; content: string }>;
  readingTime: string;
  insights: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      keyPoints: result.keyPoints || [],
      ahaMonents: result.ahaMonents || [],
      readingTime: result.readingTime || "3 min",
      insights: result.insights || 0,
    };
  } catch (error) {
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping users understand a video titled "${title}". 

RESPONSE STYLE - USE SIMPLE ENGLISH:
- Write like you're talking to a friend
- Use everyday words everyone knows
- Keep sentences short and clear
- No fancy business words or complex terms
- Maximum 1-2 sentences per bullet point
- Focus on what people can actually do

WORD CHOICES - SIMPLE ALTERNATIVES:
- Instead of "assess" → say "check"
- Instead of "enhances" → say "helps" or "makes better"  
- Instead of "sustainability" → say "how long it will last"
- Instead of "optimal" → say "best"
- Instead of "facilitate" → say "help"
- Instead of "utilize" → say "use"
- Instead of "implement" → say "do" or "try"

FORMATTING:
- Use bullet points for main ideas
- Include timestamps as [MM:SS] naturally within text
- Format tools/websites as clickable links [text](url)
- Bold key terms for emphasis

EXAMPLE STYLE:
Instead of: "If traction is only from one channel, assess the sustainability of that approach"
Write: "If you're only getting customers from one place, check if that will keep working [11:22]"

Respond with JSON in this format: { 'answer': string, 'timestamps': string[] }. Keep the answer concise and scannable.`,
        },
        {
          role: "user",
          content: `Previous conversation:\n${context}\n\nTranscript:\n${transcript}\n\nQuestion: ${question}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      answer: result.answer || "I couldn't generate a response for that question.",
      timestamps: result.timestamps || [],
    };
  } catch (error) {
    throw new Error("Failed to generate chat response: " + (error instanceof Error ? error.message : String(error)));
  }
}
