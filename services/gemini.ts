
import { GoogleGenAI, Type } from "@google/genai";

// Always use the process.env.API_KEY directly as per the coding guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMarketingContent = async (
  type: 'Email' | 'SMS',
  prompt: string,
  tone: string = 'Professional'
) => {
  // Use gemini-3-flash-preview for text generation tasks
  const model = 'gemini-3-flash-preview';
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      subject: { 
        type: Type.STRING, 
        description: type === 'Email' ? 'A catchy email subject line' : 'N/A for SMS' 
      },
      content: { 
        type: Type.STRING, 
        description: 'The main message body' 
      },
      previewText: { 
        type: Type.STRING, 
        description: 'Brief preview text or hook' 
      }
    },
    required: ['content']
  };

  const systemInstruction = `You are an expert marketing copywriter. 
  Generate a high-converting ${type} campaign based on the user's prompt. 
  The tone should be ${tone}. 
  ${type === 'SMS' ? 'Keep it under 160 characters if possible.' : 'Make it engaging and structured.'}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema
      },
    });

    // Access the .text property directly from the response object
    const text = response.text;
    if (!text) {
      throw new Error("No content generated");
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
