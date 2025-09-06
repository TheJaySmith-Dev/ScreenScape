import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { AiSearchParams, MediaDetails, ViewingGuide, FunFact } from '../types.ts';
import { getGeminiApiKey, getRateLimitState, incrementRequestCount } from './apiService.ts';

const model = 'gemini-2.5-flash';

/**
 * Creates and returns an initialized GoogleGenAI client.
 * @throws {Error} if the Gemini API key is not set.
 */
const getAiClient = (): GoogleGenAI => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        throw new Error("Gemini API key is not set. Please add it via the settings.");
    }
    return new GoogleGenAI({ apiKey });
};

/**
 * Checks if the user can make an AI request based on the daily limit.
 * @throws {Error} with a `resetTime` property if the rate limit is exceeded.
 */
const checkRateLimit = () => {
    const { canRequest, resetTime } = getRateLimitState();
    if (!canRequest) {
        const error = new Error(`You have exceeded the daily limit of 500 requests. Please try again later.`);
        (error as any).resetTime = resetTime;
        throw error;
    }
};

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
    checkRateLimit();
    const ai = getAiClient();
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
    - companies: An array of strings with production company names (e.g., "A24", "Marvel Studios").
    - year_from: A number for the starting year.
    - year_to: A number for the ending year.
    - sort_by: A string, one of 'popularity.desc', 'release_date.desc', or 'vote_average.desc'.

2. "response_title": A short, friendly, conversational title for the search results page that summarizes the user's request.

Rules:
- For genres, ONLY use values from this list: ${TMDb_GENRES}.
- Put character names (e.g., "Thor", "Batman") in the 'characters' array.
- Put moods or vibes (e.g., "happy") in the 'keywords' array.
- Create a natural sentence for "response_title".
- **IMPORTANT FRANCHISE RULE**: When a user mentions a major franchise like "Marvel", they almost always mean the Marvel Cinematic Universe (MCU). To handle this, set the 'companies' parameter to "Marvel Studios". This is critical to exclude older, non-MCU films. For example, if the query is "Marvel movie starring Chris Evans", the company should be "Marvel Studios" and the actor should be "Chris Evans".
- **FULL NAME RULE**: When a user provides a full name for an actor or director (e.g., 'Tom Holland', 'Christopher Nolan'), you MUST use the full name in the corresponding array ('actors' or 'directors'). Do not shorten or split names. This is crucial for accuracy. For example, if the query is "movies with Tom Holland", the 'actors' array must be ["Tom Holland"], NOT ["Tom"].
- If a user is specific, like "Sam Raimi Spider-Man", then correctly identify the director.

Always respond with ONLY the JSON object.`,
                responseMimeType: "application/json",
                responseSchema: getSearchParamsSchema,
            }
        });
        
        incrementRequestCount();
        const result = JSON.parse(response.text);
        result.search_params.original_query = query;
        return result;

    } catch (error) {
        console.error('Error getting search params from AI:', error);
        // Propagate the error to be handled by the UI
        throw error;
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
    checkRateLimit();
    const ai = getAiClient();
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

        incrementRequestCount();
        const result = JSON.parse(response.text);
        if (result && result.guides) {
            return result;
        } else {
            throw new Error("AI response is not in the expected format for viewing guides.");
        }

    } catch (error) {
        console.error(`Error getting viewing guides for ${brandName}:`, error);
        throw error;
    }
};

const funFactsSchema = {
    type: Type.OBJECT,
    properties: {
        facts: {
            type: Type.ARRAY,
            description: "A list of fun facts about the movie.",
            items: {
                type: Type.OBJECT,
                properties: {
                    category: {
                        type: Type.STRING,
                        description: "A category for the fact, e.g., 'Casting', 'Production', 'Trivia', 'Legacy'."
                    },
                    fact: {
                        type: Type.STRING,
                        description: "The interesting fact or piece of trivia."
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
export const getFunFactsForMedia = async (title: string, year: string): Promise<FunFact[]> => {
    checkRateLimit();
    const ai = getAiClient();
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: `Generate 3-5 interesting, little-known, behind-the-scenes fun facts for the movie titled "${title}" released around ${year}.`,
            config: {
                systemInstruction: "You are a movie trivia expert. Your task is to provide fun facts in a structured JSON format. For each fact, provide a relevant category like 'Casting', 'Production', 'Trivia', or 'Legacy'. Respond with ONLY a JSON object containing a 'facts' array.",
                responseMimeType: "application/json",
                responseSchema: funFactsSchema,
            }
        });
        
        incrementRequestCount();
        const result = JSON.parse(response.text);
        if (result && result.facts) {
            return result.facts;
        } else {
            throw new Error("AI response did not contain 'facts' array.");
        }

    } catch (error) {
        console.error(`Error getting fun facts for ${title}:`, error);
        throw error;
    }
};