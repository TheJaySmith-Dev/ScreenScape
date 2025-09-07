import type { GoogleGenAI } from "@google/genai";
import { Type, GenerateContentResponse, Chat } from "@google/genai";
import type { MediaDetails, ViewingGuide, FunFact, AiSearchParams } from '../types.ts';
import { searchMedia, discoverMediaFromAi } from './mediaService.ts';

const model = 'gemini-2.5-flash';

const aiSearchParamsSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A creative and relevant title for the list of recommendations that accurately reflects ALL conditions from the user's query. For example, if the user asks for 'Marvel movies with Chris Evans', a good title would be 'Marvel Movies Starring Chris Evans'."
        },
        search_params: {
            type: Type.OBJECT,
            description: "Strictly structured search parameters extracted from the user's query. Every parameter here is a mandatory 'AND' condition.",
            properties: {
                keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific keywords from the query that must be present." },
                genres: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Genres mentioned. The results must match ALL specified genres." },
                actors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of actor names. The results MUST star ALL actors listed." },
                directors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of director names. The results MUST be directed by ALL directors listed." },
                companies: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Production companies or studios mentioned (e.g., 'Marvel Studios', 'A24', 'Walt Disney Pictures'). The results MUST be produced by ALL companies listed." },
                characters: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Character names mentioned. Use this for specific character searches." },
                year_from: { type: Type.INTEGER, description: "The starting year for a required date range." },
                year_to: { type: Type.INTEGER, description: "The ending year for a required date range." },
                sort_by: { type: Type.STRING, description: "A sort order. Can be 'popularity.desc', 'release_date.desc', or 'vote_average.desc'." },
                media_type: { type: Type.STRING, description: "The type of media. Can be 'movie', 'tv', or 'all'. Infer from the query if possible." },
            },
        }
    },
    required: ['title', 'search_params']
};

/**
 * Uses Gemini to parse a natural language query into structured search parameters,
 * then uses TMDb's discovery endpoint for more accurate recommendations.
 */
export const getAiRecommendations = async (query: string, aiClient: GoogleGenAI): Promise<{ results: MediaDetails[], title: string }> => {
    try {
        const response = await aiClient.models.generateContent({
            model,
            contents: `Parse the following user request into a structured JSON object for searching a movie/TV show database.
            User Request: "${query}"`,
            config: {
                systemInstruction: `You are a highly precise API query generator. Your sole purpose is to convert a user's natural language request into a strict set of JSON parameters. Every condition specified by the user MUST be treated as a mandatory 'AND' requirement. For example, if the user asks for 'Marvel movies starring Chris Evans', your parameters must ensure the movie is from 'Marvel Studios' AND stars 'Chris Evans'. If a user asks for 'A24 horror movies', the company must be 'A24' AND the genre must be 'Horror'. Do not broaden the search. Your entire response must be ONLY the raw JSON object matching the provided schema, without any markdown formatting, comments, or extra text. If a parameter is not mentioned, omit the key from the 'search_params' object. For 'companies', use specific names like 'Marvel Studios' for Marvel, or 'Walt Disney Pictures' for Disney.`,
                responseMimeType: "application/json",
                responseSchema: aiSearchParamsSchema,
            }
        });

        const responseText = response.text.trim();
        const aiResult = JSON.parse(responseText);
        
        const searchParamsObject = aiResult.search_params;
        
        if (!searchParamsObject || Object.keys(searchParamsObject).length === 0) {
            // AI couldn't extract any specific parameters, so fall back to a general search for vague queries.
            console.log("AI could not parse specific params, falling back to text search.");
            const fallbackResults = await searchMedia(query);
            return { results: fallbackResults, title: `Results for "${query}"` };
        }

        const searchParams: AiSearchParams = { ...searchParamsObject, original_query: query };
        const mediaResults = await discoverMediaFromAi(searchParams);
        
        // If the structured search yields no results, it's more accurate to say so
        // than to fall back to a broad, inaccurate search.
        if (mediaResults.length === 0) {
            return { results: [], title: `Couldn't find anything matching all criteria for "${query}"` };
        }
        
        return { results: mediaResults, title: aiResult.title };

    } catch (error) {
        console.error('Error getting AI recommendations, falling back to text search:', error);
        // Catch-all fallback for JSON parsing errors or other unexpected issues.
        const fallbackResults = await searchMedia(query);
        return { results: fallbackResults, title: `Results for "${query}"` };
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
 * Generates fun facts for a given media title. Caches results in local storage.
 */
export const getFunFactsForMedia = async (title: string, year: string, aiClient: GoogleGenAI): Promise<FunFact[]> => {
    const cacheKey = `funfacts-cache-${title.toLowerCase().replace(/\s/g, '-')}-${year}`;
    
    try {
        const cachedFacts = localStorage.getItem(cacheKey);
        if (cachedFacts) {
            return JSON.parse(cachedFacts);
        }
    } catch (e) {
        console.error("Failed to read from cache", e);
    }

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
            try {
                localStorage.setItem(cacheKey, JSON.stringify(result.facts));
            } catch (e) {
                console.error("Failed to write to cache", e);
            }
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