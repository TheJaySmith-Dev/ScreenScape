import type { GoogleGenAI } from "@google/genai";
import { Type, GenerateContentResponse, Chat } from "@google/genai";
import type { MediaDetails, ViewingGuide, FunFact, AiSearchParams, LikedItem, AiCuratedCarousel, Brand } from '../types.ts';
import { searchMedia, discoverMediaFromAi } from './mediaService.ts';

const model = 'gemini-2.5-flash';

const aiResponseSchema = {
    type: Type.OBJECT,
    properties: {
        intent: {
            type: Type.STRING,
            description: "Classification of the user's intent. Must be 'direct_search', 'discover', or 'vague'."
        },
        title: {
            type: Type.STRING,
            description: "A creative and relevant title for the list of recommendations that accurately reflects the user's query."
        },
        search_params: {
            type: Type.OBJECT,
            description: "Structured search parameters based on the classified intent.",
            properties: {
                direct_search_query: {
                    type: Type.STRING,
                    description: "For 'direct_search' intent ONLY. This is the cleaned-up search term for the TMDb API. E.g., for 'movies with Marty McFly', this should be 'Back to the Future'."
                },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific keywords from the query. Used for 'vague' intent or as a fallback." },
                genres: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Genres mentioned. The results must match ALL specified genres." },
                actors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of actor names. The results MUST star ALL actors listed." },
                directors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of director names. The results MUST be directed by ALL directors listed." },
                companies: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Production companies or studios mentioned (e.g., 'Marvel Studios', 'A24'). The results MUST be produced by ALL companies listed." },
                year_from: { type: Type.INTEGER, description: "The starting year for a required date range." },
                year_to: { type: Type.INTEGER, description: "The ending year for a required date range." },
                sort_by: { type: Type.STRING, description: "A sort order. Can be 'popularity.desc', 'release_date.desc', or 'vote_average.desc'." },
                media_type: { type: Type.STRING, description: "The type of media. Can be 'movie', 'tv', or 'all'. Infer from the query if possible." },
            },
        }
    },
    required: ['intent', 'title', 'search_params']
};


/**
 * Uses Gemini to parse a natural language query into structured search parameters,
 * then uses TMDb for more accurate recommendations. Includes robust fallbacks.
 */
export const getAiRecommendations = async (query: string, aiClient: GoogleGenAI): Promise<{ results: MediaDetails[], title: string }> => {
    let aiResult;
    try {
        const response = await aiClient.models.generateContent({
            model,
            contents: `Analyze and parse the following user request into a structured JSON object for searching a movie/TV show database.
            User Request: "${query}"`,
            config: {
                systemInstruction: `You are a movie search query analyzer. Your job is to classify the user's request and extract parameters into a strict JSON format.

**Key Entity Mapping Rules (MUST FOLLOW for 'discover' intent):**
- "Marvel" -> company "Marvel Studios"
- "Disney" -> company "Walt Disney Pictures"
- "Warner Bros" -> "Warner Bros. Pictures"
- "Universal" -> "Universal Pictures"
- "Star Wars" -> company "Lucasfilm Ltd."
- "A24" -> company "A24"

1.  **Analyze Intent:**
    *   \`direct_search\`: Use this for queries about a **specific title** (e.g., "Back to the Future from 1985") or a **specific character** (e.g., "movies with Marty McFly"). This intent is for finding a *known entity*.
    *   \`discover\`: Use this ONLY when the user is asking for a list of media based on combined, generic criteria and does NOT name a specific title (e.g., "action movies from the 90s", "A24 horror films", "movies starring Tom Hanks and directed by Spielberg").
    *   \`vague\`: Use this for mood, vibe, or conceptual queries (e.g., "sad movies", "something to watch on a rainy day").

2.  **Populate Parameters:**
    *   If \`intent\` is \`direct_search\`, your primary job is to determine the official media title the user is referring to. Put this cleaned-up title in the \`direct_search_query\` field. For "Movies with the character Marty McFly", \`direct_search_query\` should be "Back to the Future". For "Back To The Future from 1985", it should be "Back to the Future". IGNORE all other parameter fields for this intent.
    *   If \`intent\` is \`discover\`, extract all specific criteria into their respective fields (\`genres\`, \`actors\`, etc.). Do NOT use \`direct_search_query\`.
    *   If \`intent\` is \`vague\`, populate \`keywords\` with the key search terms.

3.  **Generate Title:**
    *   Always create a descriptive \`title\` for the results page that reflects the query.

4.  **Output:**
    *   Respond with ONLY the raw JSON object matching the provided schema. Do not include markdown formatting.`,
                responseMimeType: "application/json",
                responseSchema: aiResponseSchema,
            }
        });

        const responseText = response.text.trim();
        aiResult = JSON.parse(responseText);
    } catch (error) {
        console.error("AI parsing failed. Falling back to simple text search.", error);
        const fallbackResults = await searchMedia(query);
        return { results: fallbackResults, title: `Results for "${query}"` };
    }

    const { intent, search_params, title } = aiResult;
    let mediaResults: MediaDetails[] = [];
    let resultTitle = title || `Results for "${query}"`;

    if (intent === 'direct_search') {
        const searchQuery = search_params?.direct_search_query || query;
        mediaResults = await searchMedia(searchQuery);
        resultTitle = title || `Results for "${searchQuery}"`;
    } else if (intent === 'discover') {
        mediaResults = await discoverMediaFromAi(search_params);
        if (mediaResults.length === 0) {
            console.warn(`Discover search for "${query}" returned no results. Falling back to text search.`);
            mediaResults = await searchMedia(query);
            resultTitle = `Showing results for "${query}"`;
        }
    } else { // 'vague' or any other fallback
        const searchQuery = search_params?.keywords?.join(' ') || query;
        mediaResults = await searchMedia(searchQuery);
        resultTitle = title || `Results for "${searchQuery}"`;
    }

    if (mediaResults.length === 0) {
        throw new Error(`No results found for "${query}". Try being more specific!`);
    }

    return { results: mediaResults, title: resultTitle };
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
 * Generates an AI-powered description for a given brand or franchise.
 */
export const getAiDescriptionForBrand = async (brandName: string, aiClient: GoogleGenAI): Promise<string> => {
    try {
        const response: GenerateContentResponse = await aiClient.models.generateContent({
            model,
            contents: `Generate a concise, engaging, one-paragraph description for the brand or franchise known as "${brandName}". Focus on its cultural impact, key themes, and what makes it unique. The tone should be exciting and suitable for a movie discovery app.`,
            config: {
                 systemInstruction: "You are a film and pop culture expert. Your task is to write a short, compelling summary for a media franchise.",
            }
        });
        return response.text;
    } catch (error) {
        console.error(`Error getting AI description for ${brandName}:`, error);
        throw new Error(`Could not generate a description for ${brandName}. The AI may be temporarily unavailable.`);
    }
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

/**
 * Initializes a new conversational chat session for a specific brand/franchise.
 * @param brand The brand to chat about.
 * @returns An initialized `Chat` object from the Gemini SDK.
 */
export const startChatForBrand = (brand: Brand, aiClient: GoogleGenAI): Chat => {
    const chat = aiClient.chats.create({
        model,
        config: {
            systemInstruction: `You are a friendly, conversational expert on media franchises. The user is asking you questions about the "${brand.name}" franchise.
            Use your vast knowledge to answer their questions about characters, storylines, behind-the-scenes facts, and the overall universe. Keep your answers concise and engaging. Do not answer questions that are not related to this specific franchise or the film/TV industry in general.`
        }
    });
    return chat;
};
