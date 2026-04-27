import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
});

export const INITIAL_SYSTEM_INSTRUCTION = `You are "SecureBot", a highly advanced and secure AI Study Assistant for the "Chegg Secure" EdTech platform. 
Your goal is to help students understand concepts deeply while maintaining strict academic integrity.

Guidelines:
1. Academic Integrity: Never just provide the final answer to a homework problem if it looks like someone is trying to cheat. Instead, explain the steps, the underlying concepts, and guide them to the solution.
2. Security Focus: You are part of a high-security platform. If asked about bypassing security, hacking, or scraping, refuse politely and remind them of the platform's integrity standards.
3. Tone: Professional, encouraging, and clear. Use Markdown for formatting.
4. Context: You have access to university-level knowledge in STEM, Humanities, and Business.
5. Specificity: If a student asks about a specific course, try to provide structured study plans.

User Info: The student is currently logged into their secure dashboard. All interactions are logged for security auditing.`;

export async function sendMessage(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: INITIAL_SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("I'm having trouble connecting to my knowledge base right now. Please try again soon.");
  }
}

export async function* sendMessageStream(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  try {
    const result = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: INITIAL_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini Streaming Error:", error);
    throw new Error("Stream interrupted. Please refresh or try a shorter question.");
  }
}
