import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateProductDescription = async (
  name: string,
  category: string,
  price: number,
  keywords: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key missing.";

  try {
    const prompt = `
      Write a compelling, short, and premium product description (max 60 words) for a shoe.
      Product Name: ${name}
      Category: ${category}
      Price: $${price}
      Keywords/Style: ${keywords}
      
      Tone: Sophisticated, energetic, and persuasive. Focus on comfort and style.
      Do not include quotes or markdown formatting in the output, just raw text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "Could not generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating description. Please try again.";
  }
};

export const analyzeInventoryTrends = async (inventoryText: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key missing.";

  try {
    const prompt = `
      Here is a summary of our current shoe inventory:
      ${inventoryText}

      Provide a 3-sentence executive summary of the inventory health. 
      Point out if any stock is too low or if there's a good balance. 
      Keep it professional and actionable for a store manager.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "Could not analyze trends.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to analyze inventory at this time.";
  }
};