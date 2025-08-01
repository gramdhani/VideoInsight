import { chatAboutVideo } from "./openai";

export async function generateQuickAction(
  action: string,
  transcript: string,
  title: string,
  previousMessages: Array<{ question: string; answer: string }>
): Promise<{ answer: string; timestamps: string[] }> {
  
  const prompts: Record<string, string> = {
    "Shorter Summary": `Give me 3 key takeaways from "${title}" in bullet points. Keep each point short and actionable. Include timestamps and links where relevant.`,
    
    "Detailed Analysis": `Break down "${title}" with these sections:

**Main Ideas:** Core concepts (1-2 sentences each)
**Key Insights:** Most important points with timestamps
**How to Apply:** Practical next steps
**Tools Mentioned:** Links to resources

Keep everything concise and scannable.`,

    "Action Items": `Extract clear action steps from "${title}":

**Do Now:** Immediate steps
**This Week:** Short-term actions  
**Long-term:** Bigger goals
**Tools Needed:** Resources and links

Make each item specific and brief.`,

    "Key Quotes": `Find the best quotes from "${title}":

For each quote:
- "Exact quote" [timestamp]
- Why it matters (1 sentence)

Focus on memorable, actionable, or inspiring statements.`
  };

  const prompt = prompts[action] || `Generate ${action.toLowerCase()} for this video.`;
  
  return await chatAboutVideo(prompt, transcript, title, previousMessages);
}