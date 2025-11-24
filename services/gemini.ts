/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface MediaItem {
  id?: string;
  title: string;
  type: 'Movie' | 'TV' | 'Book' | 'Music';
  date: string;
  thoughts: string;
  tags: string[];
  rating: number;
  summary: string;
  coverImage?: string; // Base64 string for the cover
}

export async function parseMediaEntry(prompt: string, fileBase64?: string, mimeType?: string): Promise<MediaItem> {
  const model = 'gemini-2.5-flash';
  
  const systemInstruction = `You are a personal cultural archivist. 
  Your goal is to analyze the user's input (which could be a text review, a photo of a book cover, a movie poster, or a screenshot of a music player) and extract structured data for a personal media tracking log.
  
  Classify the item into one of these types: 'Movie' (电影), 'TV' (电视剧), 'Book' (书籍), 'Music' (音乐).
  
  If the input is just an image, infer the title and details from visual cues.
  If the input is text, extract the user's feelings.
  
  Return a JSON object.`;

  const parts: any[] = [];
  
  if (fileBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: fileBase64,
        mimeType: mimeType,
      },
    });
  }
  
  const userPrompt = prompt || "Analyze this item.";
  parts.push({ text: userPrompt });

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The title of the work" },
            type: { type: Type.STRING, enum: ["Movie", "TV", "Book", "Music"] },
            date: { type: Type.STRING, description: "Date consumed in YYYY-MM-DD format. Use today if unknown." },
            thoughts: { type: Type.STRING, description: "The user's thoughts or first impressions. If not provided, generate a brief interesting fact or summary." },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 relevant tags (genre, mood, etc.)" },
            rating: { type: Type.NUMBER, description: "Rating from 1 to 5" },
            summary: { type: Type.STRING, description: "A one-sentence objective summary of the work." }
          },
          required: ["title", "type", "thoughts", "rating", "summary", "date", "tags"]
        }
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    return JSON.parse(jsonText) as MediaItem;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}