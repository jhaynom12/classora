import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  try {
    const { question, role } = await request.json();

    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.log('❌ No Google AI API key found in environment variables');
      return NextResponse.json({
        response: "🔑 **Google AI Key Missing!**\n\nTo enable AI responses:\n1. Get an API key from https://makersuite.google.com/app/apikey\n2. Add to `.env.local`: `GOOGLE_AI_API_KEY=your-key`\n3. Restart server with `npm run dev`\n\nMeanwhile, I'm here to help with your study question!"
      });
    }

    console.log('✅ Using Google Gemini AI');

    const systemPrompt = `You are School Guardian, an AI educational assistant for ${role || 'student'}s. Be helpful, concise, and educational. Use simple language. Keep responses short and practical.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelCandidates = [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite'
    ];

    let lastErrorMessage = 'No valid Gemini model found.';
    
    // Try each model with retry logic
    for (const modelName of modelCandidates) {
      for (let retryAttempt = 0; retryAttempt < 3; retryAttempt++) {
        try {
          console.log(`Trying Gemini model: ${modelName} (attempt ${retryAttempt + 1}/3)`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent([systemPrompt, question]);
          const aiResponse = result.response.text();

          if (aiResponse && typeof aiResponse === 'string') {
            return NextResponse.json({ response: aiResponse.trim() });
          }
        } catch (err: any) {
          lastErrorMessage = err?.message || String(err);
          
          // Check for rate limiting or service unavailable errors
          if (lastErrorMessage.includes('503') || lastErrorMessage.includes('429') || lastErrorMessage.includes('high demand')) {
            console.warn(`⚠️ Model ${modelName} attempt ${retryAttempt + 1}/3: Service unavailable or rate limited. Waiting before retry...`);
            // Exponential backoff: 2s, 4s, 8s
            await sleep(Math.pow(2, retryAttempt + 1) * 1000);
            continue;
          }
          
          console.warn(`Model ${modelName} failed:`, lastErrorMessage);
          if (!/404|not found|blocked|not supported/i.test(lastErrorMessage)) {
            break; // Don't retry on other errors, try next model
          }
        }
      }
    }

    console.error('❌ Gemini AI: All model attempts failed');
    return NextResponse.json({ response: `⚠️ AI service is temporarily unavailable (${lastErrorMessage}). Please try again in a moment.` });
  } catch (error: any) {
    console.error('❌ Server error:', error?.message || error);
    return NextResponse.json({ response: '❌ Server error: ' + (error?.message || 'Please check your API key and the Generative Language API settings') });
  }
}
