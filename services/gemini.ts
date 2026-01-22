
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, SearchResult } from "../types";

const API_KEY = process.env.API_KEY || "";

export const searchWithGemini = async (query: string): Promise<{ text: string; sources: SearchResult[] }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for and explain: ${query}. Be concise and helpful like a mobile browser assistant.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "I couldn't find information on that.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources: SearchResult[] = chunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Search Source",
        uri: chunk.web?.uri || "",
      }));

    return { text, sources };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return { text: "Error connecting to the intelligence network.", sources: [] };
  }
};

export const summarizePage = async (content: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize this text into 3 key bullet points for a mobile user: ${content.substring(0, 5000)}`,
    });
    return response.text || "Unable to summarize.";
  } catch (error) {
    return "Failed to summarize page content.";
  }
};
