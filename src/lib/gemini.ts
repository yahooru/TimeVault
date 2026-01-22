import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "" });

export async function enhanceContent(content: string): Promise<string> {
  try {
    const response = await genAI.models.generateContent({
      model: process.env.MODEL_NAME || "gemini-2.5-flash",
      contents: `Enhance and polish the following message for a digital time capsule. Make it sound more emotional, thoughtful, and meaningful, while keeping the core message intact. Return ONLY the enhanced message, no explanations:\n\n"${content}"`,
    });
    
    return response.text || content;
  } catch (error) {
    console.error("Gemini Enhancement Error:", error);
    return content;
  }
}
