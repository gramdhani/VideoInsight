import OpenAI from "openai";
import { storage } from "../storage";
import { needsWebSearch, searchWebWithAI } from "./webSearchAI";

// Using OpenRouter with deepseek model for cost-effective AI processing
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://videoinsight-ai.replit.app", // Your site URL for rankings
    "X-Title": "VideoInsight AI", // Your site name for rankings
  },
});

export async function summarizeVideo(
  transcript: string,
  title: string,
): Promise<{
  shortSummary: string;
  outline: Array<{ title: string; items: string[] }>;
  keyTakeaways: Array<{
    title: string;
    description: string;
    timestamp?: string;
  }>;
  actionableSteps: Array<{
    step: string;
    description: string;
    priority: "high" | "medium" | "low";
  }>;
  readingTime: string;
  insights: number;
}> {
  try {
    console.log(`Starting video summary for: ${title}`);
    const response = await openai.chat.completions.create(
      {
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
      },
      {
        timeout: 30000, // 30 second timeout
      },
    );

    const result = JSON.parse(response.choices[0].message.content || "{}");

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
    if (error instanceof Error && error.message.includes("408")) {
      throw new Error(
        "The AI model is currently busy. Please try again in a few moments. (Free models can be slower during peak times)",
      );
    }
    throw new Error(
      "Failed to summarize video: " +
        (error instanceof Error ? error.message : String(error)),
    );
  }
}

export async function generateQuickQuestions(
  transcript: string,
  title: string,
): Promise<string[]> {
  try {
    console.log(`Generating context-aware questions for: ${title}`);

    const response = await openai.chat.completions.create(
      {
        model: "google/gemini-2.5-flash-lite-preview-06-17",
        messages: [
          {
            role: "system",
            content: `You are an expert at generating engaging conversation starters based on video content. 

Analyze the video transcript and title to create 4 context-specific questions that would naturally arise from watching this video. These should be conversational, like a curious friend asking follow-up questions.

CRITICAL LENGTH REQUIREMENT:
- Each question MUST be 70-120 characters maximum
- Cut unnecessary words while keeping context-specific references
- Questions exceeding 120 characters will be completely rejected

STYLE GUIDELINES:
- Start with simple phrases: "So...", "Wait...", "Could...", "Does..."
- Make them sound like quick follow-up questions

EXAMPLES OF PROPERLY SHORT QUESTIONS (80-120 chars):
- "So Reddit alone got you to $17K MRR with zero marketing budget?"
- "Wait, you built App Alchemi in just two weeks using AI?"
- "Could this Reddit strategy work for B2B products too?"
- "Does this mean UI libraries are key for fast prototyping?"

Respond with JSON in this exact format:
{
  "questions": ["Question 1", "Question 2", "Question 3", "Question 4"]
}`,
          },
          {
            role: "user",
            content: `Generate 4 context-aware conversation starter questions for this video:

Title: "${title}"

Transcript: ${transcript.substring(0, 4000)}...`, // Limit transcript length for token efficiency
          },
        ],
        response_format: { type: "json_object" },
      },
      {
        timeout: 30000,
      },
    );

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return (
      result.questions || [
        "What's the main takeaway from this video?",
        "How could I apply this to my situation?",
        "What tools or resources were mentioned?",
        "Are there any potential challenges with this approach?",
      ]
    );
  } catch (error) {
    console.error("Error generating quick questions:", error);
    // Return fallback questions if AI fails
    return [
      "What's the main takeaway from this video?",
      "How could I apply this to my situation?",
      "What tools or resources were mentioned?",
      "Are there any potential challenges with this approach?",
    ];
  }
}

export async function chatAboutVideo(
  question: string,
  transcript: string,
  title: string,
  previousMessages: Array<{ question: string; answer: string }>,
  videoDuration?: string,
): Promise<{ answer: string; timestamps: string[] }> {
  try {
    const context = previousMessages
      .map((msg) => `Q: ${msg.question}\nA: ${msg.answer}`)
      .join("\n\n");

    console.log(`Starting chat response for video: ${title}`);
    console.log(`User question: ${question}`);
    console.log(`Previous messages count: ${previousMessages.length}`);
    console.log(`Video duration: ${videoDuration}`);
    console.log(`Transcript length: ${transcript.length} characters`);
    console.log(`Transcript preview: ${transcript.substring(0, 200)}...`);

    // Check if question needs web search and gather information
    let webSearchInfo = "";
    if (needsWebSearch(question, title)) {
      const searchResult = await searchWebWithAI(question, title);
      if (searchResult.hasWebInfo) {
        webSearchInfo = `\n\nSUPPLEMENTAL WEB INFORMATION:\n${searchResult.webContent}\n\nUse this current web information to enhance your response about the video content. Clearly distinguish between video content and current web information.\n`;
      }
    }

    // Get active prompt configuration
    let systemPrompt = `You are an AI assistant helping users understand a video titled "${title}". You have access to the complete video transcript with timestamps and can supplement with current web information when needed.

CRITICAL INSTRUCTION: EACH QUESTION IS UNIQUE
- EVERY user question must receive a UNIQUE, SPECIFIC response tailored to that exact question
- DO NOT reuse previous answers or give generic responses
- Carefully read and directly address what the user is asking RIGHT NOW
- If the user asks "should I build this tool?" - give advice specific to their situation
- If the user asks about a competitor tool - analyze that specific tool
- NEVER give the same answer to different questions

ENHANCED CAPABILITIES:
- Primary focus: Analyze and discuss video content with accurate timestamps
- Secondary support: Use current web information to provide context about competitors, market data, or topics not covered in the video
- Always prioritize video content first, then supplement with web information when relevant

RESPONSE STYLE - BULLET POINTS:
- Start responses with bullet points (•) when listing information
- Keep each bullet to 1-2 short sentences maximum
- Write in simple, conversational language
- Be specific and directly answer the user's exact question

TIMESTAMP USAGE:
- Include timestamps in [MM:SS] format when referencing specific moments
- Search the transcript carefully for exact moments mentioned

FORMATTING RULES:
- Format tools and websites as clickable links when possible
- Use bold for emphasis, not HTML tags
- Use single quotes (') instead of double quotes (") in text
- Avoid curly braces {} or backslashes in the answer text

JSON RESPONSE FORMAT:
{
  "answer": "Your unique response tailored to this specific question", 
  "timestamps": ["MM:SS"] (only include if timestamps are referenced in the answer)
}`;

    let userPrompt = `CURRENT USER QUESTION (Answer THIS specific question, not previous ones):
"${question}"

Request ID: ${Date.now()}-${Math.random().toString(36).substring(7)}

Previous conversation context (for reference only, DO NOT repeat previous answers):
${context}

Video Duration: ${videoDuration || "Unknown"}

Full Video Transcript with Timestamps:
${transcript}${webSearchInfo}

CRITICAL INSTRUCTIONS:
1. Answer the CURRENT question above: "${question}"
2. This is a NEW question - provide a UNIQUE answer specific to what's being asked NOW
3. DO NOT repeat any previous answer even if the topic seems similar
4. Focus on the specific aspect the user is asking about in THIS question

IMPORTANT: Only provide timestamps that exist in the transcript above. Do not generate or guess timestamps. If you cannot find the exact information with a timestamp in the transcript, say so honestly. Make sure any timestamps you reference do not exceed the video duration.

WHEN USING WEB INFORMATION:
- Clearly label when information comes from current web sources vs. the video
- Combine video insights with current data when relevant
- Focus on video content first, use web info to add context`;

    const response = await openai.chat.completions.create(
      {
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
        temperature: 0.7, // Add some variability to responses
        max_tokens: 2000, // Ensure sufficient response length
        seed: Date.now(), // Use timestamp as seed for uniqueness
      },
      {
        timeout: 30000, // 30 second timeout
      },
    );

    let result;
    try {
      const content = response.choices[0].message.content || "{}";
      result = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, try to extract the answer manually
      const content = response.choices[0].message.content || "";
      console.log(
        "JSON parse error, attempting manual extraction:",
        parseError,
      );

      // Try to extract answer from malformed JSON
      const answerMatch = content.match(/"answer":\s*"([^"]+)"/);
      const timestampsMatch = content.match(/"timestamps":\s*\[(.*?)\]/);

      result = {
        answer: answerMatch
          ? answerMatch[1].replace(/\\"/g, '"').replace(/\\n/g, "\n")
          : content,
        timestamps: timestampsMatch
          ? timestampsMatch[1].split(",").map((t) => t.trim().replace(/"/g, ""))
          : [],
      };
    }

    // Validate timestamps don't exceed video duration
    let validatedTimestamps = result.timestamps || [];
    if (videoDuration && validatedTimestamps.length > 0) {
      // Convert video duration (e.g., "10:23") to seconds
      const durationParts = videoDuration.split(":").map(Number);
      const totalDurationSeconds =
        durationParts.length === 2
          ? durationParts[0] * 60 + durationParts[1]
          : durationParts.length === 3
            ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
            : 0;

      validatedTimestamps = validatedTimestamps.filter((timestamp: string) => {
        const timestampParts = timestamp.split(":").map(Number);
        const timestampSeconds =
          timestampParts.length === 2
            ? timestampParts[0] * 60 + timestampParts[1]
            : timestampParts.length === 3
              ? timestampParts[0] * 3600 +
                timestampParts[1] * 60 +
                timestampParts[2]
              : 0;

        const isValid = timestampSeconds <= totalDurationSeconds;
        if (!isValid) {
          console.log(
            `Filtered invalid timestamp ${timestamp} (${timestampSeconds}s) exceeds video duration ${videoDuration} (${totalDurationSeconds}s)`,
          );
        }
        return isValid;
      });
    }

    return {
      answer:
        result.answer || "I couldn't generate a response for that question.",
      timestamps: validatedTimestamps,
    };
  } catch (error) {
    console.error("OpenRouter chat API error:", error);
    if (error instanceof Error && error.message.includes("408")) {
      throw new Error(
        "The AI is currently busy. Please try your question again in a moment. (Free models can be slower during peak times)",
      );
    }
    throw new Error(
      "Failed to generate chat response: " +
        (error instanceof Error ? error.message : String(error)),
    );
  }
}
