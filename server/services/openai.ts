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

RESPONSE STYLE - BE CONCISE AND DIRECT:
- Keep responses short and scannable
- Use bullet points with brief, punchy statements
- Maximum 1-2 sentences per bullet point
- Focus on actionable insights, not lengthy explanations
- Use simple, conversational language
- Get straight to the point

FORMATTING:
- Use bullet points for main ideas
- Include timestamps as [MM:SS] naturally within text
- Format tools/websites as clickable links [text](url)
- Bold key terms for emphasis

EXAMPLE STYLE:
Instead of: "Samuel shares a structured approach to validate app ideas effectively. His method involves several crucial steps including looking for traction..."
Write: "**Look for Traction:** Check if founders share monthly revenue screenshots. If they're making money, that's solid proof [11:22]"

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
