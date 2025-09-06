
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { AiSearchParams, FunFact, MediaDetails, ViewingGuide } from '../types.ts';

// Per instructions, the GoogleGenAI instance is initialized using the API key from environment variables.
// This assumes `process.env.API_KEY` is available in the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

// This is a list of common genres from TMDb to help the AI.
const TMDb_GENRES = "Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, TV Movie, Thriller, War, Western";

const getSearchParamsSchema = {
    type: Type.OBJECT,
    properties: {
        search_params: {
            type: Type.OBJECT,
            description: "An object containing search parameters for TMDb.",
            properties: {
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                characters: { type: Type.ARRAY, items: { type: Type.STRING } },
                genres: { type: Type.ARRAY, items: { type: Type.STRING } },
                actors: { type: Type.ARRAY, items: { type: Type.STRING } },
                directors: { type: Type.ARRAY, items: { type: Type.STRING } },
                companies: { type: Type.ARRAY, items: { type: Type.STRING } },
                year_from: { type: Type.INTEGER },
                year_to: { type: Type.INTEGER },
                sort_by: { type: Type.STRING },
            },
        },
        response_title: {
            type: Type.STRING,
            description: "A short, friendly, conversational title for the search results page."
        }
    },
    required: ['search_params', 'response_title']
};

/**
 * Uses Gemini to parse a natural language query into structured search parameters.
 */
export const getSearchParamsFromQuery = async (query: string): Promise<{ search_params: AiSearchParams; response_title: string; }> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: `User Query: "${query}"`,
            config: {
                systemInstruction: `You are an expert movie and TV show recommendation assistant. Your task is to interpret a user's natural language query and convert it into a structured JSON object.

The JSON object must have two top-level keys: "search_params" and "response_title".

1. "search_params": An object containing search parameters. It can have the following keys:
    - keywords: An array of strings for general search terms, vibes, or plot elements.
    - characters: An array of strings for specific character names mentioned (e.g., "Tony Stark").
    - genres: An array of strings from the provided list.
    - actors: An array of strings with actor names.
    - directors: An array of strings with director names.
    - companies: An array of strings with production company names (e.g., "A24").
    - year_from: A number for the starting year.
    - year_to: A number for the ending year.
    - sort_by: A string, one of 'popularity.desc', 'release_date.desc', or 'vote_average.desc'.

2. "response_title": A short, friendly, conversational title for the search results page that summarizes the user's request.

Rules:
- For genres, ONLY use values from this list: ${TMDb_GENRES}.
- Put character names (e.g., "Thor", "Batman") in the 'characters' array.
- Put moods or vibes (e.g., "happy") in the 'keywords' array.
- Create a natural sentence for "response_title".

Always respond with ONLY the JSON object.`,
                responseMimeType: "application/json",
                responseSchema: getSearchParamsSchema,
            }
        });

        const result = JSON.parse(response.text);
        result.search_params.original_query = query;
        return result;

    } catch (error) {
        console.error('Error getting search params from AI:', error);
        // Fallback to a simple keyword search if AI fails
        return { 
            search_params: { keywords: [query], original_query: query },
            response_title: `Here are the results for "${query}"`
        };
    }
};

const funFactsSchema = {
    type: Type.OBJECT,
    properties: {
        facts: {
            type: Type.ARRAY,
            description: "An array of fun facts about the media.",
            items: {
                type: Type.OBJECT,
                properties: {
                    category: {
                        type: Type.STRING,
                        description: "The category of the fact (e.g., CASTING, PRODUCTION, RECEPTION, LEGACY, BOX OFFICE, PRE-PRODUCTION)."
                    },
                    fact: {
                        type: Type.STRING,
                        description: "The fun fact itself."
                    }
                },
                required: ['category', 'fact']
            }
        }
    },
    required: ['facts']
};

/**
 * Generates fun facts for a given media title.
 */
export const getFunFactsForMedia = async (title: string, releaseYear: string, type: 'movie' | 'tv'): Promise<{ facts: FunFact[] }> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: `Find 3-5 interesting and uncommon fun facts about the ${type} "${title}" (${releaseYear}). Focus on behind-the-scenes, casting, production, or legacy details.`,
            config: {
                systemInstruction: `You are a movie and TV show trivia expert. Provide fun facts in a structured JSON format. The top-level key must be "facts", which is an array of objects. Each object must have a "category" (e.g., CASTING, PRODUCTION, RECEPTION, LEGACY, 'BOX OFFICE', 'PRE-PRODUCTION') and a "fact" (the trivia string).`,
                responseMimeType: "application/json",
                responseSchema: funFactsSchema
            }
        });

        const result = JSON.parse(response.text);
        if (result && result.facts) {
            return result;
        } else {
            throw new Error("AI response is not in the expected format.");
        }
    } catch (error) {
        console.error('Error getting fun facts from AI:', error);
        throw new Error("Could not generate fun facts.");
    }
};

/**
 * Generates an evocative, spoiler-free description for a media title.
 */
export const getAiDescriptionForMedia = async (title: string, releaseYear: string, type: 'movie' | 'tv', overview: string): Promise<string> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: `Title: ${title} (${releaseYear})
Type: ${type}
Official Overview: "${overview}"

Based on the official overview, write an expanded, more evocative, and engaging description. Your goal is to entice a potential viewer by highlighting themes, tone, and potential emotional impact, without giving away major spoilers. Aim for 2-3 paragraphs.`,
            config: {
                systemInstruction: `You are a creative and insightful film and television critic. You write compelling, spoiler-free summaries that capture the essence of a show or movie.`
            }
        });

        return response.text;
    } catch (error) {
        console.error('Error getting AI description:', error);
        throw new Error("Could not generate an AI-powered description.");
    }
};

const viewingGuideSchema = {
    type: Type.OBJECT,
    properties: {
        guides: {
            type: Type.ARRAY,
            description: "A list of viewing guides.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the viewing guide." },
                    description: { type: Type.STRING, description: "A short description of this guide." },
                    steps: {
                        type: Type.ARRAY,
                        description: "The steps in the viewing guide.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                mediaId: { type: Type.INTEGER, description: "The TMDb ID of the movie or show." },
                                mediaType: { type: Type.STRING, description: "The type of media, either 'movie' or 'tv'." },
                                title: { type: Type.STRING, description: "The title of the media." },
                                reasoning: { type: Type.STRING, description: "Why this item is at this step in the guide." }
                            },
                            required: ['mediaId', 'mediaType', 'title', 'reasoning']
                        }
                    }
                },
                required: ['title', 'description', 'steps']
            }
        }
    },
    required: ['guides']
};

/**
 * Generates curated viewing guides for a franchise.
 */
export const getViewingGuidesForBrand = async (brandName: string, mediaList: MediaDetails[]): Promise<{ guides: ViewingGuide[] }> => {
    const mediaString = mediaList.map(m => `${m.type.toUpperCase()}:${m.id} - ${m.title} (${m.releaseYear})`).join('\n');
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: `Create 3 distinct viewing guides for the "${brandName}" franchise.
Base your guides ONLY on the media provided below.

Available Media:
${mediaString}

For each guide:
1.  Give it a unique, descriptive title (e.g., "Chronological Story Order", "Release Order", "Best for Newcomers").
2.  Write a brief description of what the guide is for.
3.  List the steps. Each step must include the media's TMDb ID, type ('movie' or 'tv'), title, and a short, 1-2 sentence reasoning for its placement in that specific order.

The output MUST be a JSON object with a single top-level key "guides".`,
            config: {
                systemInstruction: "You are an expert on movie and TV franchises. Your task is to generate curated viewing orders for a given franchise based on a list of its media.",
                responseMimeType: "application/json",
                responseSchema: viewingGuideSchema,
            }
        });

        const result = JSON.parse(response.text);
        if (result && result.guides) {
            return result;
        } else {
            throw new Error("AI response is not in the expected format for viewing guides.");
        }

    } catch (error) {
        console.error(`Error getting viewing guides for ${brandName}:`, error);
        throw new Error(`Could not generate viewing guides for ${brandName}.`);
    }
};
