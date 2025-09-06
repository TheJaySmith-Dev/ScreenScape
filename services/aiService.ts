import type { GoogleGenAI } from "@google/genai";
import { Type, GenerateContentResponse, Chat } from "@google/genai";
import type { AiSearchParams, MediaDetails, ViewingGuide, FunFact } from '../types.ts';

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
                media_type: { type: Type.STRING, description: "The type of media to search for. Can be 'movie', 'tv', or 'all'." },
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
export const getSearchParamsFromQuery = async (query: string, aiClient: GoogleGenAI): Promise<{ search_params: AiSearchParams; response_title: string; }> => {
    try {
        const response: GenerateContentResponse = await aiClient.models.generateContent({
            model,
            contents: `User Query: "${query}"`,
            config: {
                systemInstruction: `You are a highly precise API endpoint that converts natural language queries about movies and TV shows into a JSON object for the TMDb API. Adhere to the following rules with ZERO DEVIATION.

**RULE 1: ABSOLUTE NAME MATCHING**
- When a person's full name is in the query, you MUST use their FULL NAME.
- Example: If query is "movies with Tom Holland", 'actors' MUST be ["Tom Holland"].
- INCORRECT: ["Tom"], ["Tom Hardy"]. This is a critical failure.

**RULE 2: ABSOLUTE MEDIA TYPE**
- If the query contains "movies" or "films", 'media_type' MUST be "movie".
- If the query contains "TV shows", "series", or "show", 'media_type' MUST be "tv".
- If no media type is specified, 'media_type' MUST be "all".
- Example: "Tom Holland movies" -> 'media_type': "movie".
- Example: "shows by Marvel" -> 'media_type': "tv".
- It is a critical failure to return TV shows when the user asks for movies.

**RULE 3: FRANCHISE SPECIFICITY**
- For "Marvel", use company "Marvel Studios".

The JSON object must have two top-level keys: "search_params" and "response_title".

1. "search_params": An object containing search parameters.
    - media_type: (string) 'movie', 'tv', or 'all'. Follow RULE 2.
    - keywords: (array of strings) For general search terms, vibes, or plot elements.
    - characters: (array of strings) For specific character names.
    - genres: (array of strings) ONLY from this list: ${TMDb_GENRES}.
    - actors: (array of strings) Actor names. Follow RULE 1.
    - directors: (array of strings) Director names. Follow RULE 1.
    - companies: (array of strings) Production company names.
    - year_from: (number) Starting year.
    - year_to: (number) Ending year.
    - sort_by: (string) 'popularity.desc', 'release_date.desc', or 'vote_average.desc'.

2. "response_title": A short, friendly, conversational title for the search results page that summarizes the user's request.

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
export const getViewingGuidesForBrand = async (brandName: string, mediaList: MediaDetails[], aiClient: GoogleGenAI): Promise<{ guides: ViewingGuide[] }> => {
    const mediaString = mediaList.map(m => `${m.type.toUpperCase()}:${m.id} - ${m.title} (${m.releaseYear})`).join('\n');
    try {
        const response: GenerateContentResponse = await aiClient.models.generateContent({
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
export const getFunFactsForMedia = async (title: string, year: string, aiClient: GoogleGenAI): Promise<FunFact[]> => {
    try {
        const response: GenerateContentResponse = await aiClient.models.generateContent({
            model,
            contents: `Generate 3-5 interesting, little-known, behind-the-scenes fun facts for the movie titled "${title}" released around ${year}.`,
            config: {
                systemInstruction: "You are a movie trivia expert. Your task is to provide fun facts in a structured JSON format. For each fact, provide a relevant category like 'Casting', 'Production', 'Trivia', or 'Legacy'. Respond with ONLY a JSON object containing a 'facts' array.",
                responseMimeType: "application/json",
                responseSchema: funFactsSchema,
            }
        });
        
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

/**
 * Initializes a new conversational chat session for a specific media item.
 * @param media The media item to chat about.
 * @returns An initialized `Chat` object from the Gemini SDK.
 */
export const startChatForMedia = (media: MediaDetails, aiClient: GoogleGenAI): Chat => {
    const chat = aiClient.chats.create({
        model,
        config: {
            systemInstruction: `You are a friendly, conversational expert on movies and TV shows. The user is asking you questions about "${media.title}" (${media.releaseYear}).
            Here's a summary: "${media.overview}".
            Use this information and your own vast knowledge to answer their questions. Keep your answers concise and engaging. Do not answer questions that are not related to this specific movie/show or the film industry in general.`
        }
    });
    return chat;
};