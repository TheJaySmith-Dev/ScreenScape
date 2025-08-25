
import { GoogleGenAI, Type } from "@google/genai";
import type { GeminiRecommendation, UserLocation, VisionResponse } from '../types.ts';
import { cinemaData } from './cinemaService.ts';
import { searchForFirstMediaResult, getWatchLink, fetchDetailsById } from "./tmdbService.ts";

export const getBookingInfo = async (movieTitle: string, country: string, countryCode: string): Promise<string> => {
  const chains = cinemaData[countryCode.toUpperCase() as keyof typeof cinemaData] || [];
  if (chains.length === 0) {
    return `Sorry, we don't have specific cinema information for ${country}. You can try searching for tickets for "${movieTitle}" online.`;
  }

  const encodedTitle = encodeURIComponent(movieTitle);
  const formattedChains = chains.map(c => {
    const googleSearchUrl = `https://www.google.com/search?q=${encodedTitle}+site%3A${c.domain}`;
    return `*   **${c.name}:** [Find on ${c.domain}](${googleSearchUrl})`;
  }).join('\n');

  const responseText = `To find showtimes for "${movieTitle}" in ${country}, here are some direct search links for major cinema websites:\n\n${formattedChains}`;
  
  return responseText;
};

const visionResponseSchema = {
    type: Type.OBJECT,
    properties: {
        responseText: { type: Type.STRING, description: "A conversational, friendly response to the user's query." },
        recommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The full title of the movie or TV show." },
                    year: { type: Type.INTEGER, description: "The release year." },
                    type: { type: Type.STRING, description: "The type of media, either 'movie' or 'tv'.", enum: ['movie', 'tv'] },
                },
                required: ['title', 'year', 'type'],
            },
            description: "A list of 5-10 recommended movies or TV shows. Omit if not applicable."
        },
        bookingQuery: { 
            type: Type.STRING, 
            description: "The title of the movie the user wants to book tickets for. Use this for explicit requests for cinemas/theaters." 
        },
        streamingQuery: { 
            type: Type.STRING, 
            description: "The title of the movie or show the user wants a link for. Use this for explicit requests for streaming/online links." 
        },
        ambiguousWatchQuery: {
            type: Type.STRING,
            description: "The title of the movie/show for a generic 'where can I watch' query."
        }
    },
};

export const chatWithVision = async (prompt: string, userLocation: UserLocation | null): Promise<VisionResponse> => {
    if (!process.env.API_KEY) {
        throw new Error("Gemini API key is missing. Please set the API_KEY environment variable to use the Vision Assistant.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `You are 'WatchNow Vision', a friendly and helpful AI assistant for discovering movies and TV shows.
    Your capabilities are:
    1. Provide movie or TV show recommendations based on user queries (e.g., genre, actor, director, era, mood).
    2. Identify when a user is asking where to book tickets for a specific movie to watch IN CINEMAS. Use keywords like 'book', 'tickets', 'showtimes', 'cinema', 'in theaters'.
    3. Identify when a user is asking for a direct link to watch a movie ONLINE. Use keywords like 'stream', 'rent', 'buy', 'online', 'link'.
    4. Handle ambiguous "where to watch" queries.

    Analyze the user's prompt and respond with a single JSON object that strictly adheres to the provided schema.

    - If the user is asking for RECOMMENDATIONS (e.g., "funny movies", "sci-fi shows"):
      - Your JSON should contain 'responseText' with a friendly message and 'recommendations' with a list of relevant titles.

    - If the user is explicitly asking where to BOOK TICKETS for a movie in a THEATER (e.g., "where can I watch Dune in theaters?", "book tickets for Barbie"):
      - Your JSON should contain 'bookingQuery' with the identified movie title.

    - If the user is explicitly asking for a LINK TO WATCH ONLINE (e.g., "give me the link for The Matrix", "where can I stream Inception?"):
      - Your JSON should contain 'streamingQuery' with the identified movie title.

    - If the user asks an AMBIGUOUS question like "where can I watch [movie title]?" without specifying cinema or streaming:
      - Your JSON should contain 'ambiguousWatchQuery' with the identified movie title.

    - If the request is not understood or you cannot fulfill it:
      - Your JSON should contain only 'responseText' explaining what you can do.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `User prompt: "${prompt}"`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: visionResponseSchema,
            },
        });

        const result = JSON.parse(response.text.trim());

        if (result.bookingQuery) {
            if (userLocation) {
                const bookingInfo = await getBookingInfo(result.bookingQuery, userLocation.name, userLocation.code);
                return { responseText: bookingInfo };
            } else {
                return { responseText: "I can look up where to book tickets, but I need your location first. This is usually enabled automatically, if not please ensure location services are not blocked for this site." };
            }
        }

        if (result.ambiguousWatchQuery) {
            if (userLocation) {
                const media = await searchForFirstMediaResult(result.ambiguousWatchQuery);
                if (media) {
                    const details = await fetchDetailsById(media.id, media.type);
                    const currentYear = new Date().getFullYear();
                    
                    // Heuristic: If it's a movie released this year or last year, assume a cinema query.
                    // Otherwise, or if it's a TV show, assume a streaming query.
                    if (details && details.type === 'movie' && parseInt(details.releaseYear, 10) >= currentYear - 1) {
                        const bookingInfo = await getBookingInfo(media.title, userLocation.name, userLocation.code);
                        return { responseText: bookingInfo };
                    } else {
                        // Fallback to streaming query for older movies, TV shows, or if details fail
                        const link = await getWatchLink(media.id, media.type, userLocation.code);
                        if (link) {
                            return { responseText: `I found a link to watch "${media.title}" online. For cinema showtimes, please ask specifically for 'tickets' or 'showtimes'.\n\n[Watch on JustWatch](${link})` };
                        } else {
                            return { responseText: `I couldn't find a direct link to watch "${media.title}" in ${userLocation.name}. It might not be available for streaming there yet.` };
                        }
                    }
                } else {
                    return { responseText: `Sorry, I couldn't find any movie or TV show matching "${result.ambiguousWatchQuery}". Please check the title and try again.` };
                }
            } else {
                return { responseText: "I can look up where to watch things, but I need your location first. This is usually enabled automatically." };
            }
        }

        if (result.streamingQuery) {
            if (userLocation) {
                const media = await searchForFirstMediaResult(result.streamingQuery);
                if (media) {
                    const link = await getWatchLink(media.id, media.type, userLocation.code);
                    if (link) {
                        return { responseText: `Here is a link to see where you can watch "${media.title}" in your region:\n\n[Watch on JustWatch](${link})` };
                    } else {
                        return { responseText: `I couldn't find a direct link to watch "${media.title}" in ${userLocation.name}. It might not be available for streaming there yet.` };
                    }
                } else {
                    return { responseText: `Sorry, I couldn't find any movie or TV show matching "${result.streamingQuery}". Please check the title and try again.` };
                }
            } else {
                return { responseText: "I can look up where to watch things, but I need your location first. This is usually enabled automatically." };
            }
        }
        
        return {
            responseText: result.responseText || "Here is what I found:",
            recommendations: result.recommendations || [],
        };

    } catch (error) {
        console.error("Error in chatWithVision:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    
        if (errorMessage.includes('API key not valid')) {
            throw new Error("The provided Gemini API key is not valid. Please check your configuration.");
        }
    
        throw new Error("The AI assistant is currently unavailable. Please try again later.");
    }
};
