import type { GoogleGenAI } from "@google/genai";
import { Type, GenerateContentResponse, Chat } from "@google/genai";
import type { MediaDetails, ViewingGuide, FunFact } from '../types.ts';
import { searchMedia } from './mediaService.ts';

const model = 'gemini-2.5-flash';

/**
 * Uses Gemini with Google Search grounding to provide movie and TV show recommendations
 * based on a natural language query. It returns a list of media details from TMDb.
 */
export const getAiRecommendations = async (query: string, aiClient: GoogleGenAI): Promise<{ results: MediaDetails[], title: string }> => {
    try {
        const response = await aiClient.models.generateContent({
            model,
            contents: `Based on the following user request, find relevant movies and TV shows using your search tool and provide a list of their titles.
            User Request: "${query}"`,
            config: {
                systemInstruction: `You are a movie and TV show recommendation expert. When a user asks for recommendations, you MUST use the provided search tool to find current and relevant titles.
                After finding titles, generate a creative and relevant title for the recommendation list.
                Finally, respond with a JSON object containing two keys: "title" (the creative list title) and "media_titles" (a string array of the movie/TV show titles you found).
                Example response:
                {
                  "title": "Thrilling Heist Movies",
                  "media_titles": ["Ocean's Eleven", "Inception", "The Italian Job", "Heat"]
                }
                Your entire response must be ONLY the raw JSON object, without any markdown formatting, comments, or extra text.`,
                tools: [{googleSearch: {}}],
            }
        });

        const responseText = response.text.trim();
        // More robustly find the JSON part of the response, as the model might include extra text.
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("The AI response did not contain a valid JSON object.");
        }
        
        const jsonString = jsonMatch[0];
        const aiResult = JSON.parse(jsonString);
        
        if (!aiResult.media_titles || !Array.isArray(aiResult.media_titles) || aiResult.media_titles.length === 0) {
            return { results: [], title: `No direct matches for "${query}"` };
        }

        // Take the first 5 titles and search TMDb to get rich data
        const searchPromises = aiResult.media_titles.slice(0, 5).map((title: string) => searchMedia(title));
        const searchResults = await Promise.all(searchPromises);
        
        // Flatten and deduplicate results
        const allMedia = searchResults.flat();
        const uniqueMedia = Array.from(new Map(allMedia.map(item => [item.id, item])).values());
        
        return { results: uniqueMedia, title: aiResult.title };

    } catch (error) {
        console.error('Error getting AI recommendations:', error);
         if (error instanceof SyntaxError) {
             throw new Error("The AI returned a response that wasn't in the correct JSON format. Please try again.");
        }
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