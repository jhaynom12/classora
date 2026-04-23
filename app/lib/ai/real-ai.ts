// Real AI Service using Groq (FREE, fast, no limits)
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || "", // Get free key from console.groq.com
  dangerouslyAllowBrowser: true // For client-side use
});

export async function getRealAIResponse(prompt: string, role: string, context: any): Promise<string> {
  // Build system message based on user role
  let systemMessage = "";
  
  switch(role) {
    case "parent":
      systemMessage = `You are School Guardian, an AI educational assistant for parents. 
      You help parents track their children's academic progress, understand grades, 
      get study tips for their kids, and navigate school activities. 
      Be warm, encouraging, and practical. Use emojis occasionally.
      Keep responses concise but helpful.`;
      break;
    case "student":
      systemMessage = `You are School Guardian, an AI study assistant for students.
      You help with homework, explain concepts, provide study tips, and motivate students.
      Be encouraging, patient, and break down complex topics simply.
      Use examples and step-by-step explanations.`;
      break;
    case "teacher":
      systemMessage = `You are School Guardian, an AI teaching assistant for educators.
      You help with lesson planning, identifying at-risk students, teaching strategies,
      and classroom management. Be professional, data-driven, and practical.`;
      break;
    default:
      systemMessage = `You are School Guardian, an AI educational assistant.
      You help with all education-related questions including homework, exams,
      study techniques, and academic guidance. Be helpful and knowledgeable.`;
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "mixtral-8x7b-32768", // Free, fast, powerful
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || "I'm having trouble responding right now. Please try again.";
  } catch (error) {
    console.error("AI Error:", error);
    return fallbackResponse(prompt, role);
  }
}

function fallbackResponse(prompt: string, role: string): string {
  // Smart fallback when API is unavailable
  const q = prompt.toLowerCase();
  
  if (q.includes("math") || q.includes("algebra")) {
    return "I'd love to help with math! Since I'm having connection issues, here's a tip: Remember the quadratic formula: x = [-b ± √(b² - 4ac)] / 2a. Would you like me to explain it in detail once we're reconnected?";
  }
  
  if (q.includes("study") || q.includes("exam")) {
    return "Great question about studying! The Pomodoro Technique (45 min study, 15 min break) is very effective. I'll give you more personalized advice once we're fully connected!";
  }
  
  return `I'm here to help with your educational questions! Since I'm experiencing high demand, could you please rephrase your question or try again in a moment? I can help with homework, exam preparation, study tips, and understanding difficult concepts.`;
}
