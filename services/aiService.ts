import type { AiSearchParams, FunFact } from '../types.ts';

// User-provided API Key
const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// This is a list of common genres from TMDb to help the AI.
const TMDb_GENRES = "Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, TV Movie, Thriller, War, Western";

const systemPrompt = `
You are an expert movie and TV show recommendation assistant. Your task is to interpret a user's natural language query and convert it into a structured JSON object that can be used to search The Movie Database (TMDb).

The JSON object should have the following structure:
- keywords: An array of strings. These are general search terms, vibes, or plot elements.
- genres: An array of strings. Must be from the provided list of valid genres.
- actors: An array of strings, containing actor names.
- directors: An array of strings, containing director names.
- companies: An array of strings, containing production company or studio names (e.g., "Disney", "A24").
- year_from: A number representing the starting year of a range.
- year_to: A number representing the ending year of a range.
- sort_by: A string, either 'popularity.desc', 'release_date.desc', or 'vote_average.desc'. Default to 'popularity.desc'.

Rules:
1.  Analyze the user's query to extract relevant entities.
2.  For genres, ONLY use values from this list: ${TMDb_GENRES}. Do not invent genres.
3.  If a query contains a mood or vibe (e.g., "happy", "mind-bending"), add it to the 'keywords' array.
4.  If no specific entities can be extracted, use the entire query as a single keyword.
5.  Always respond with ONLY the JSON object that can be parsed by JSON.parse(). Do not add any extra text, explanations, or markdown formatting like \`\`\`json.

Examples:
- User: "A happy Disney movie."
- You:
{
  "keywords": ["happy"],
  "companies": ["Disney"]
}

- User: "A Marvel movie starring Chris Evans"
- You:
{
  "companies": ["Marvel Studios"],
  "actors": ["Chris Evans"]
}

- User: "mind-bending sci-fi movies from the 90s"
- You:
{
  "keywords": ["mind-bending"],
  "genres": ["Science Fiction"],
  "year_from": 1990,
  "year_to": 1999
}

- User: "something funny and upbeat"
- You:
{
  "keywords": ["funny", "upbeat"],
  "genres": ["Comedy"]
}
`;

/**
 * Uses an AI to parse a natural language query into structured search parameters.
 */
export const getSearchParamsFromQuery = async (query: string): Promise<AiSearchParams> => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': 'https://screenscape.com', // Required by some providers like OpenRouter
                'X-Title': 'ScreenScape AI Search', // Required by some providers
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo', // A good default model
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: query },
                ],
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('AI API Error:', response.status, errorBody);
            throw new Error(`AI service failed: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        
        if (!content) {
            throw new Error('AI returned an empty response.');
        }

        const params: AiSearchParams = JSON.parse(content);
        params.original_query = query;
        return params;

    } catch (error) {
        console.error('Error getting search params from AI:', error);
        // Fallback: If AI fails, treat the whole query as a keyword search.
        return { keywords: [query], original_query: query };
    }
};

const funFactsSystemPrompt = `
You are a movie and TV show trivia expert. Your task is to generate 5-7 interesting, concise, and little-known fun facts about a specific media title.

You must cover a variety of topics, including:
- **Casting**: "What if" scenarios, original casting choices, actor preparations.
- **Production**: On-set stories, special effects challenges, script changes.
- **Box Office**: Surprising financial performance, records broken.
- **Reception**: Critical reception, audience reactions, awards.
- **Legacy**: Cultural impact, influence on other media.

The user will provide the title, release year, and type (movie/tv).

You MUST respond with ONLY a JSON object that can be parsed by \`JSON.parse()\`. The JSON object must have a single key "facts" which is an array of objects. Each object in the array must have two keys: "category" (a string from the list above) and "fact" (a string containing the fun fact).

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
    },
    {
      "category": "Reception",
      "fact": "President Ronald Reagan was a huge fan of the film and even quoted it in his 1986 State of the Union address, saying, 'Where we're going, we don't need roads.'"
    }
  ]
}
`;

export const getFunFactsForMedia = async (title: string, year: string, type: 'movie' | 'tv'): Promise<{facts: FunFact[]}> => {
    const query = `Title: ${title}, Year: ${year}, Type: ${type}`;
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': 'https://screenscape.com',
                'X-Title': 'ScreenScape Fun Facts',
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: funFactsSystemPrompt },
                    { role: 'user', content: query },
                ],
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('AI API Error (Fun Facts):', response.status, errorBody);
            throw new Error(`AI service failed for fun facts: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        
        if (!content) {
            throw new Error('AI returned an empty response for fun facts.');
        }

        const funFactsData: {facts: FunFact[]} = JSON.parse(content);
        return funFactsData;

    } catch (error) {
        console.error('Error getting fun facts from AI:', error);
        throw new Error('Could not generate fun facts.');
    }
};

const aiDescriptionSystemPrompt = `
You are a passionate film and TV critic. Your task is to provide a deeper, more insightful analysis of a media title based on the details provided.

Rules:
1.  Write an engaging, extended description of about 150-200 words.
2.  Do NOT simply rephrase the provided overview. Go deeper.
3.  Touch upon the main themes, character motivations, overall tone, and what makes the title unique or appealing.
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
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': 'https://screenscape.com',
                'X-Title': 'ScreenScape AI Description',
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: aiDescriptionSystemPrompt },
                    { role: 'user', content: query },
                ],
                max_tokens: 300,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('AI API Error (Description):', response.status, errorBody);
            throw new Error(`AI service failed for description: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        
        if (!content) {
            throw new Error('AI returned an empty response for the description.');
        }

        return content.trim();

    } catch (error) {
        console.error('Error getting description from AI:', error);
        throw new Error('Could not generate an AI-powered description.');
    }
};