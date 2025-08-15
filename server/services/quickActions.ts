import { chatAboutVideo } from "./openai";

export async function generateQuickAction(
  action: string,
  transcript: string,
  title: string,
  previousMessages: Array<{ question: string; answer: string }>,
  storage: any
): Promise<{ answer: string; timestamps: string[] }> {
  
  // Try to get active prompt configuration for this quick action
  const activeConfig = await storage.getActiveQuickActionPromptConfig(action);
  
  let prompt: string;
  
  if (activeConfig) {
    // Use configurable prompt with template variable substitution
    prompt = activeConfig.userPrompt;
    if (prompt.includes('${title}')) {
      prompt = prompt.replace(/\$\{title\}/g, title);
    }
    if (prompt.includes('${transcript}')) {
      prompt = prompt.replace(/\$\{transcript\}/g, transcript);
    }
  } else {
    // Fallback to original hard-coded prompts
    const fallbackPrompts: Record<string, string> = {
      "Shorter Summary": `Give me 3 main points from "${title}" in simple bullet points. Keep each point short and easy to do. Include timestamps and links.`,
      
      "Detailed Analysis": `Break down "${title}" in simple terms:

**Main Ideas:** What's this about? (1-2 simple sentences each)
**Key Points:** Most important stuff with timestamps
**What You Can Do:** Easy next steps
**Tools Used:** Links to websites and apps

Keep everything simple and easy to read.`,

      "Action Items": `What should I do after watching "${title}"?

**Do Right Now:** Easy first steps
**Do This Week:** Things to try soon
**Do Later:** Bigger goals
**What You Need:** Tools and websites

Make each step clear and simple.`,

      "Key Quotes": `Best quotes from "${title}":

For each quote:
- "What they said" [timestamp]
- Why this matters (simple explanation)

Pick quotes that are inspiring or really useful.`
    };

    prompt = fallbackPrompts[action] || `Generate ${action.toLowerCase()} for this video.`;
  }
  
  return await chatAboutVideo(prompt, transcript, title, previousMessages);
}