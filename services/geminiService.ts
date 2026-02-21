import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Use Vite's environment variable syntax to prevent the white screen crash
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Model configuration
const MODEL_NAME = "gemini-3-flash-preview";

export const generateProductCopy = async (productName: string, category: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 100,
      }
    });

    const prompt = `Generate a premium, seductive, and faith-inspired marketing description for a fashion product named "${productName}" in the category "${category}". Keep it under 60 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Elevate your style with our latest premium collection.";
  } catch (error) {
    console.error("Gemini AI error:", error);
    return "Experience the perfect blend of luxury and faith in every stitch.";
  }
};

export const getStyleTips = async (productName: string): Promise<string[]> => {
  try {
    // Define the schema for structured JSON output
    const schema = {
      description: "List of style tips",
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
      },
    };

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const prompt = `List 3 professional style tips for wearing "${productName}".`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Style tips error:", error);
    return ["Pair with neutral tones", "Accessorize minimally", "Ideal for formal evening events"];
  }
};
