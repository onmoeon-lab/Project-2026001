import { GoogleGenAI } from "@google/genai";
import { EnhancementType, PromptSetting } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

export const enhanceText = async (
  text: string, 
  promptSetting: PromptSetting,
  context: string = ""
): Promise<string> => {
  if (!text) return "";
  
  // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
     throw new Error("API Key is missing from environment variables (process.env.API_KEY).");
  }

  // Instantiate client with the environment key
  const ai = new GoogleGenAI({ apiKey });

  // Replace placeholders in the custom template
  let finalPrompt = promptSetting.promptTemplate
    .replace('{{text}}', text)
    .replace('{{context}}', context);

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: finalPrompt,
      config: {
        systemInstruction: promptSetting.systemInstruction,
        temperature: 0.3,
      }
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to enhance text. Please check your API Key and connection.");
  }
};