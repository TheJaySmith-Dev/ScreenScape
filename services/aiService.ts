import type { AiSearchParams, FunFact } from '../types.ts';

const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-chat';

/**
 * A generic function to call the AI model with improved error handling and JSON parsing.
 * @param systemPrompt The system prompt to guide the model.
 * @param userQuery The user's input.
 * @param expectJson Whether to expect a JSON object as a response.
 * @param maxTokens The maximum number of tokens to generate.
 * @param useWebSearch Whether to enable the web search tool for the model.
 * @returns The parsed AI response (string or object).
 */
const callAi = async (systemPrompt: string, userQuery: string, expectJson: boolean, maxTokens?: number, useWebSearch: boolean = false): Promise<any> => {
    const headers = {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://screenscape.dev', // Recommended by OpenRouter
        'X-Title': 'ScreenScape'                 // Recommended by OpenRouter
    };

    const body: any = {
        model: MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userQuery }
        ],
    };

    if (expectJson) {
        body.response_format = { type: 'json_object' };
    }

    if (maxTokens) {
        body.max_tokens = maxTokens;
    }

    // Enable web search if requested
    if (useWebSearch) {
        body.tool_choice = "auto";
        body.tools = [{ "type": "web_search" }];
    }

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API Error:', errorText);
        let errorMessage = `AI API request failed: ${response.status} ${response.statusText}`;
        try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error?.message) {
                errorMessage = `AI Error: ${errorJson.error.message}`;
            }
        } catch (e) { /* Ignore JSON parsing error on the error text */ }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
        throw new Error('AI returned an empty response.');
    }
    
    if (expectJson) {
        try {
            // The `response_format` should return clean JSON, so try parsing directly first.
            return JSON.parse(content);
        } catch (e1) {
            // If direct parsing fails, the model might have wrapped the JSON in text/markdown.
            // Extract the first valid JSON object from the string.
            console.warn("Direct JSON parsing failed, attempting to extract from text.", e1);
            const match = content.match(/\{[\s\S]*\}/);
            if (match) {
                try {
                    return JSON.parse(match[0]);
                } catch (e2) {
                    console.error("Failed to parse extracted JSON:", e2);
                    console.error("Original content from AI:", content);
                    throw new Error("AI returned invalid JSON.");
                }
            }
            console.error("No valid JSON object found in AI response:", content);
            throw new Error("AI did not return a valid JSON object.");
        }
    }
    
    return content;
};


// This is a list of common genres from TMDb to help the AI.
const TMDb_GENRES = "Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, TV Movie, Thriller, War, Western";

const getSearchParamsSystemPrompt = `
You are an expert movie and TV show recommendation assistant. Your task is to interpret a user's natural language query and convert it into a structured JSON object.

The JSON object must have two top-level keys: "search_params" and "response_title".

1. "search_params": An object containing search parameters for TMDb. It can have the following keys:
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

Rules for "search_params":
- For genres, ONLY use values from this list: ${TMDb_GENRES}.
- Put character names (e.g., "Thor", "Batman", "Tony Stark") in the 'characters' array, NOT 'actors' or 'keywords'.
- Put moods or vibes (e.g., "happy") in the 'keywords' array.

Rule for "response_title":
- Create a natural sentence. If a search for a character returns results that are just "mentions", it's good to hint at that. For example, for "Marvel movies with Tony Stark", a good title could be "Here are Marvel movies that mention or feature Tony Stark!".

Always respond with ONLY the JSON object.

Examples:
- User: "A happy Disney movie." ->
{
  "search_params": { "keywords": ["happy"], "companies": ["Disney"] },
  "response_title": "Here are some happy movies from Disney!"
}
- User: "Marvel movies starring Thor" ->
{
  "search_params": { "companies": ["Marvel Studios"], "characters": ["Thor"] },
  "response_title": "Here are Marvel movies featuring Thor!"
}
- User: "mind-bending sci-fi movies from the 90s" ->
{
  "search_params": { "keywords": ["mind-bending"], "genres": ["Science Fiction"], "year_from": 1990, "year_to": 1999 },
  "response_title": "Here are some mind-bending sci-fi movies from the 90s."
}
`;

/**
 * Uses an AI to parse a natural language query into structured search parameters.
 */
export const getSearchParamsFromQuery = async (query: string): Promise<{ search_params: AiSearchParams; response_title: string; }> => {
    try {
        const response: { search_params: AiSearchParams; response_title: string; } = await callAi(getSearchParamsSystemPrompt, query, true, 1024);
        response.search_params.original_query = query;
        return response;
    } catch (error) {
        console.error('Error getting search params from AI:', error);
        // Fallback: If AI fails, treat the whole query as a keyword search.
        return { 
            search_params: { keywords: [query], original_query: query },
            response_title: `Here are the results for "${query}"`
        };
    }
};

const funFactsSystemPrompt = `
You are a movie and TV show trivia expert. Your task is to generate 5-7 interesting, concise, and little-known fun facts about a specific media title. You have access to the web to find up-to-date and accurate information.

You must cover a variety of topics, including:
- **Casting**: "What if" scenarios, original casting choices, actor preparations.
- **Production**: On-set stories, special effects challenges, script changes.
- **Box Office**: Surprising financial performance, records broken.
- **Reception**: Critical reception, audience reactions, awards.
- **Legacy**: Cultural impact, influence on other media.

The user will provide the title, release year, and type (movie/tv).

You MUST respond with a JSON object with a single key "facts" which is an array of objects. Each object in the array should have two keys: "category" (string) and "fact" (string).

Example Request:
Title: Back to the Future, Year: 1985, Type: movie

Example Response:
{
  "facts": [
    {
      "category": "Casting",
      "fact": "Eric Stoltz was originally cast as Marty McFly and filmed for five weeks before being replaced by Michael J. Fox, as the director felt Stoltz's performance was too dramatic for the role."
    },
    {
      "category": "Production",
      "fact": "The DeLorean was chosen for its futuristic, spaceship-like appearance. The speedometer was custom-built for the film because no car at the time had a speedometer that went up to 88 mph."
    }
  ]
}
`;

export const getFunFactsForMedia = async (title: string, year: string, type: 'movie' | 'tv'): Promise<{facts: FunFact[]}> => {
    const query = `Title: ${title}, Year: ${year}, Type: ${type}`;
    try {
        const funFactsData: {facts: FunFact[]} = await callAi(funFactsSystemPrompt, query, true, 2048, true);
        // Ensure the response has the correct structure.
        if (!funFactsData || !Array.isArray(funFactsData.facts)) {
             throw new Error("AI returned data in an unexpected format.");
        }
        return funFactsData;

    } catch (error) {
        console.error('Error getting fun facts from AI:', error);
        throw new Error('Could not generate fun facts.');
    }
};

const aiDescriptionSystemPrompt = `
You are a passionate film and TV critic with access to web search for the latest information and context. Your task is to provide a deeper, more insightful analysis of a media title based on the details provided.

Rules:
1.  Write an engaging, extended description of about 150-200 words.
2.  Do NOT simply rephrase the provided overview. Go deeper.
3.  Touch upon the main themes, character motivations, overall tone, and what makes the title unique or appealing. Use your web search ability to find critical reception or interesting production details to include.
4.  Your tone should be enthusiastic and insightful, like a professional critic writing for an entertainment magazine.
5.  Respond with ONLY the descriptive text. Do not include any headers, titles, or introductory phrases like "Here is the description:".

Example Request:
Title: Blade Runner 2049, Year: 2017, Type: movie, Overview: "A young Blade Runner's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years."

Example Response:
"Denis Villeneuve's stunning sequel expands upon the rain-soaked, neon-noir world of the original, delving deeper into questions of what it means to be human. The film is a contemplative sci-fi masterpiece, exploring themes of memory, identity, and manufactured love through the eyes of its lonely protagonist, K. It's a visually breathtaking and emotionally resonant journey, less concerned with action and more with the melancholic search for a soul in a synthetic world. Its deliberate pace and philosophical questions will linger with you long after the credits roll."
`;

export const getAiDescriptionForMedia = async (title: string, year: string, type: 'movie' | 'tv', overview: string): Promise<string> => {
    const query = `Title: ${title}, Year: ${year}, Type: ${type}, Overview: "${overview}"`;
    try {
        const content: string = await callAi(aiDescriptionSystemPrompt, query, false, 512, true);
        return content.trim();

    } catch (error) {
        console.error('Error getting description from AI:', error);
        throw new Error('Could not generate an AI-powered description.');
    }
};