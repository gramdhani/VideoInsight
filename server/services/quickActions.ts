import { chatAboutVideo } from "./openai";

export async function generateQuickAction(
  action: string,
  transcript: string,
  title: string,
  previousMessages: Array<{ question: string; answer: string }>
): Promise<{ answer: string; timestamps: string[] }> {
  
  const prompts: Record<string, string> = {
    "Shorter Summary": `Provide a concise 3-bullet point summary of the key takeaways from this video "${title}". Focus on the most important actionable insights. Format your response with clear bullet points and include any relevant tools or websites mentioned as clickable links.`,
    
    "Detailed Analysis": `Provide a comprehensive analysis of "${title}" including:

**Main Themes:**
- Core concepts and ideas presented

**Detailed Insights:**
- Deep dive into the key points
- Context and implications

**Practical Applications:**
- How viewers can apply this information
- Real-world use cases

**Tools & Resources:**
- Any software, websites, or resources mentioned (format as clickable links)
- Additional recommended resources

Format your response with clear headings and structure for easy reading.`,

    "Action Items": `Extract actionable steps and recommendations from "${title}". Structure your response as:

**Immediate Actions:**
- Steps viewers can take right away

**Short-term Goals:**
- Actions to complete within the next week

**Long-term Objectives:**
- Bigger picture goals and aspirations

**Resources Needed:**
- Tools, websites, or materials required (format as clickable links)

Make each action item specific and measurable when possible.`,

    "Key Quotes": `Identify the most impactful quotes, statements, and memorable phrases from "${title}". For each quote:

- Provide the exact quote in quotation marks
- Include the approximate timestamp when possible
- Explain why this quote is significant
- Add context about how it relates to the main message

Focus on quotes that are:
- Inspirational or motivational
- Contain key insights or "aha moments"
- Summarize important concepts
- Are highly quotable or shareable

Format with clear sections and make timestamps clickable.`
  };

  const prompt = prompts[action] || `Generate ${action.toLowerCase()} for this video.`;
  
  return await chatAboutVideo(prompt, transcript, title, previousMessages);
}