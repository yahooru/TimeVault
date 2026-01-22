import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set");
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.MODEL_NAME || "gemini-1.5-flash";
    
    // Validate model name - sometimes users put gemini-2.0 or 2.5 which might not be available
    const model = genAI.getGenerativeModel({ model: modelName.includes('gemini') ? modelName : "gemini-1.5-flash" });

    const prompt = `You are a professional message writer for a digital time capsule app called TimeVault. 
    Enhance and polish the following message to make it sound more emotional, thoughtful, and meaningful, while keeping the core message and intent exactly the same. 
    If it's a short note, make it poetic. If it's a letter, make it formal yet warm.
    
    Return ONLY the enhanced message text. No conversational filler, no quotes around the response, no explanations.

    Message to enhance:
    "${content}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ 
      success: true, 
      enhanced: text.trim().replace(/^["']|["']$/g, '')
    });
  } catch (error) {
    console.error("AI Enhancement Error:", error);
    return NextResponse.json({ 
      error: "Failed to enhance content", 
      message: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
