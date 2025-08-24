import { GoogleGenAI, Type } from "@google/genai";
import type { GeminiRecommendation } from '../types';

const recommendationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'The full title of the movie or TV show.',
      },
      year: {
        type: Type.INTEGER,
        description: 'The release year of the movie or first air year of the TV show.',
      },
      type: {
        type: Type.STRING,
        description: "The type of media, either 'movie' or 'tv'.",
        enum: ['movie', 'tv'],
      },
    },
    required: ['title', 'year', 'type'],
  },
};


export const getRecommendations = async (prompt: string): Promise<GeminiRecommendation[]> => {
  if (!process.env.API_KEY) {
    // This error is caught by the App component and displayed gracefully in the UI.
    throw new Error("Gemini API key is missing. Please set the API_KEY environment variable to use the AI search.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the following user request, provide a list of 5-10 relevant movie or TV show recommendations. For each, provide the title, the release year, and whether it is a 'movie' or a 'tv' show. User request: "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: recommendationSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      return [];
    }
    const recommendations: GeminiRecommendation[] = JSON.parse(jsonText);
    
    return recommendations;
  } catch (error) {
    console.error("Error fetching recommendations from Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    
    if (errorMessage.includes('API key not valid')) {
        throw new Error("The provided Gemini API key is not valid. Please check your configuration.");
    }

    throw new Error(`Failed to get recommendations from AI. Please check your prompt or try again later.`);
  }
};
