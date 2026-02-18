
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google GenAI client using the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductCopy = async (productName: string, category: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a premium, seductive, and faith-inspired marketing description for a fashion product named "${productName}" in the category "${category}". Keep it under 60 words.`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    return response.text || "Elevate your style with our latest premium collection.";
  } catch (error) {
    console.error("Gemini AI error:", error);
    return "Experience the perfect blend of luxury and faith in every stitch.";
  }
};

export const getStyleTips = async (productName: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `List 3 professional style tips for wearing "${productName}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return ["Pair with neutral tones", "Accessoirze minimally", "Ideal for formal evening events"];
  }
};
