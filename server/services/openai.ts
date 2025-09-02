import OpenAI from "openai";
import { storage } from "../storage";
import { needsWebSearch, searchWebWithAI } from "./webSearchAI";

// Using OpenRouter with OpenAI GPT-4o-mini model for cost-effective AI processing
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
  storage: any,
): Promise<{
  shortSummary: string;
  outline: Array<{ title: string; timestamp?: string; items: Array<{ point: string; context: string }> }>;
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
    
    // Get active summary prompt configuration or use default
    const activeSummaryConfig = await storage.getActiveSummaryPromptConfig();
    
    let systemPrompt: string;
    let userPromptTemplate: string;
    
    if (activeSummaryConfig) {
      systemPrompt = activeSummaryConfig.systemPrompt;
      userPromptTemplate = activeSummaryConfig.userPrompt;
    } else {
      // Default system prompt for video summarization
      systemPrompt = `You are an expert video analyst. Create a comprehensive, well-structured summary following this exact format. Use simple, everyday language that's easy to understand. When mentioning tools, websites, or resources, format them as clickable links using markdown format [text](url).

Respond with JSON in this exact format:
{
  "shortSummary": "A brief 2-3 sentence overview of what this video is about and its main purpose",
  "outline": [
    {
      "title": "Section name (e.g., Introduction, Main Concept, etc.)",
      "timestamp": "MM:SS (when this section starts in the video)",
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
- Include timestamps for each outline section (when each major section starts)
- Include timestamps when referencing specific video moments in takeaways
- Prioritize action steps: high (do first), medium (do soon), low (do later)
- Keep everything clear and actionable`;

      // Default user prompt template
      userPromptTemplate = `Analyze this video transcript for "\${title}":\n\n\${transcript}`;
    }
    
    // Replace template variables in user prompt
    let userPrompt = userPromptTemplate;
    if (userPromptTemplate.includes('${title}')) {
      userPrompt = userPrompt.replace(/\$\{title\}/g, title);
    }
    if (userPromptTemplate.includes('${transcript}')) {
      userPrompt = userPrompt.replace(/\$\{transcript\}/g, transcript);
    }
    
    const response = await openai.chat.completions.create(
      {
        model: "openai/gpt-4o-mini",
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
        "The AI model is currently busy. Please try again in a few moments.",
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
        model: "openai/gpt-4o-mini",
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

    // Get active prompt configuration or use default
    const activeConfig = await storage.getActivePromptConfig();
    
    let systemPrompt: string;
    let userPromptTemplate: string | undefined;
    
    if (activeConfig) {
      systemPrompt = activeConfig.systemPrompt;
      userPromptTemplate = activeConfig.userPrompt;
    } else {
      // Default system prompt
      systemPrompt = `You are an AI assistant helping users understand a video titled "${title}". You have access to the complete video transcript with timestamps and can supplement with current web information when needed. When users ask about specific information, events, numbers, or quotes, carefully search through the transcript to find the exact moment and provide the accurate timestamp.

ENHANCED CAPABILITIES:
- Primary focus: Analyze and discuss video content with accurate timestamps
- Secondary support: Use current web information to provide context about competitors, market data, or topics not covered in the video
- Always prioritize video content first, then supplement with web information when relevant

CRITICAL: BULLET POINTS ARE MANDATORY
- YOU MUST START EVERY RESPONSE WITH BULLET POINTS
- NO PARAGRAPHS AT THE BEGINNING - START WITH BULLETS IMMEDIATELY
- Use bullet points for everything: video info, web research results, explanations
- Only use a paragraph if absolutely impossible to format as bullets

RESPONSE STYLE - BULLET POINTS FIRST:
- • Use bullet points for video content analysis
- • Use bullet points for web research results  
- • Use bullet points for competitor information
- • Use bullet points for explanations and answers
- Keep each bullet to 1-2 short sentences maximum
- Write like you're talking to a friend - simple words

TIMESTAMP USAGE - CRITICAL INSTRUCTIONS:
- When a user asks about specific information, events, or mentions in a video, you must ALWAYS search the transcript carefully
- Include timestamps in [MM:SS] format whenever you reference a specific moment
- If the user asks "what timestamp did he mention X?", find that exact moment and provide the precise timestamp

FORMATTING RULES - CRITICAL FOR PROPER DISPLAY:
- Format tools and websites as clickable links: link text
- Use bold for emphasis, not HTML tags
- NEVER use double quotes (") inside the answer text - use single quotes (') if needed
- NEVER use curly braces {} or backslashes () inside the answer text

MANDATORY BULLET FORMAT EXAMPLES:
For Session app competitors question, respond EXACTLY like this:
"• Session is a Pomodoro focus app mentioned at [11:45]
• Video doesn't name direct competitors but suggests many alternatives exist
• From current web research, Session alternatives include:
  - **Forest** - Gamified focus app that grows virtual trees
  - **Focus@Will** - Music service optimized for concentration  
  - **Freedom** - Cross-device app and website blocker
  - **Cold Turkey** - Strict blocking capabilities"

NEVER start with paragraphs. ALWAYS start with bullet points (•) immediately.

JSON RESPONSE FORMAT:
{
  "answer": "Your natural response here", 
  "timestamps": ["MM:SS"] (only include if timestamps are referenced in the answer)
}`;
    }

    // Process template variables if custom prompt is used
    let userPrompt: string;
    if (userPromptTemplate) {
      // Replace template variables
      userPrompt = userPromptTemplate
        .replace(/\${context}/g, context)
        .replace(/\${videoDuration}/g, videoDuration || "Unknown")
        .replace(/\${transcript}/g, transcript)
        .replace(/\${webSearchInfo}/g, webSearchInfo)
        .replace(/\${question}/g, question)
        .replace(/\${title}/g, title);
    } else {
      // Default user prompt
      userPrompt = `Previous conversation:\n${context}\n\nVideo Duration: ${videoDuration || "Unknown"}\n\nFull Video Transcript with Timestamps:\n${transcript}${webSearchInfo}\n\nUser Question: ${question}\n\nIMPORTANT: Only provide timestamps that exist in the transcript above. Do not generate or guess timestamps. If you cannot find the exact information with a timestamp in the transcript, say so honestly. Make sure any timestamps you reference do not exceed the video duration.

WHEN USING WEB INFORMATION:
- Clearly label when information comes from current web sources vs. the video
- Combine video insights with current data when relevant
- Focus on video content first, use web info to add context`;
    }

    const response = await openai.chat.completions.create(
      {
        model: "openai/gpt-4o-mini",
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
        "The AI is currently busy. Please try your question again in a moment.",
      );
    }
    throw new Error(
      "Failed to generate chat response: " +
        (error instanceof Error ? error.message : String(error)),
    );
  }
}

export async function generatePersonalizedPlan(
  transcript: string,
  summary: any,
  profileDescription: string
): Promise<{
  items: Array<{
    title: string;
    whyItMatters: string;
    steps: string[];
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    metric: {
      name: string;
      target: string;
      timeframeDays: number;
    };
    suggestedDeadlineDays: number;
  }>;
  quickWins: Array<{
    title: string;
    steps: string[];
  }>;
}> {
  try {
    console.log(`Generating personalized plan for profile: ${profileDescription.substring(0, 50)}...`);
    
    const systemPrompt = `You are a career coach that converts video insights into a PERSONALIZED action plan.
- Always adapt to the user's context (role, experience, goals) from PROFILE.
- Be specific, pragmatic, and measurable. Avoid generic advice.
- Prefer low-effort/high-impact items first.

Output Requirements:
Prioritize the top 5 items that fit the PROFILE.
Each item must include:
title
whyItMatters
steps (3–5)
effort (low|medium|high)
impact (low|medium|high)
metric (name, target, timeframeDays)
suggestedDeadlineDays
Also include 3 quickWins (1–2 steps each).

Respond with JSON in this exact format:
{
  "items": [
    {
      "title": "Action item title",
      "whyItMatters": "Why this is important for the user",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "effort": "low",
      "impact": "high",
      "metric": {
        "name": "Metric name",
        "target": "Specific target",
        "timeframeDays": 30
      },
      "suggestedDeadlineDays": 7
    }
  ],
  "quickWins": [
    {
      "title": "Quick win title",
      "steps": ["Step 1", "Step 2"]
    }
  ]
}`;

    const userPrompt = `PROFILE: ${profileDescription}

VIDEO SUMMARY:
${summary?.shortSummary || ''}

KEY TAKEAWAYS:
${summary?.keyTakeaways?.map((t: any) => `- ${t.title}: ${t.description}`).join('\n') || ''}

ACTIONABLE STEPS FROM VIDEO:
${summary?.actionableSteps?.map((s: any) => `- ${s.step}: ${s.description} (${s.priority} priority)`).join('\n') || ''}

VIDEO TRANSCRIPT EXCERPT:
${transcript.substring(0, 3000)}

Create a personalized action plan that adapts these video insights specifically for this user's profile.`;

    const response = await openai.chat.completions.create(
      {
        model: "openai/gpt-4o-mini",
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
      },
      {
        timeout: 30000,
      },
    );

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      items: result.items || [],
      quickWins: result.quickWins || [],
    };
  } catch (error) {
    console.error("OpenRouter API error for personalized plan:", error);
    if (error instanceof Error && error.message.includes("408")) {
      throw new Error(
        "The AI model is currently busy. Please try again in a few moments.",
      );
    }
    throw new Error(
      "Failed to generate personalized plan: " +
        (error instanceof Error ? error.message : String(error)),
    );
  }
}
