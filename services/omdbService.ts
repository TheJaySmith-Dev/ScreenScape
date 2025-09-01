import type { ExternalRatings, MediaDetails } from '../types.ts';

// Using the user's provided OMDb API key as requested.
const OMDB_API_KEY = '2b067fb4';
const OMDB_API_BASE_URL = 'https://www.omdbapi.com';

interface OmdbRating {
  Source: string;
  Value: string;
}

interface OmdbResponse {
  Response: 'True' | 'False';
  Error?: string;
  imdbRating?: string;
  Ratings?: OmdbRating[];
  Rated?: string;
  Awards?: string;
  Poster?: string;
}

export const fetchOmdbDetails = async (imdbId: string): Promise<Partial<MediaDetails>> => {
    if (!OMDB_API_KEY) {
        console.warn("OMDb API key is not configured.");
        return { otherRatings: {} };
    }
    try {
        const url = `${OMDB_API_BASE_URL}/?i=${imdbId}&apikey=${OMDB_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('OMDb API request failed');
        }
        const data: OmdbResponse = await response.json();

        if (data.Response === 'False') {
            console.warn(`OMDb API error for ${imdbId}:`, data.Error);
            return { otherRatings: {} };
        }

        const otherRatings: ExternalRatings = {};

        if (data.Ratings) {
            data.Ratings.forEach(rating => {
                if (rating.Source === 'Rotten Tomatoes') {
                    otherRatings.rottenTomatoes = rating.Value;
                } else if (rating.Source === 'Metacritic') {
                    otherRatings.metacritic = rating.Value.split('/')[0]; // Often comes as '75/100'
                }
            });
        }
        
        // Get poster and try to get a higher resolution version.
        let posterUrl = data.Poster && data.Poster !== 'N/A' ? data.Poster : undefined;
        if (posterUrl && posterUrl.includes('_SX300')) {
            posterUrl = posterUrl.replace('_SX300', '_SX800');
        }

        return {
            otherRatings,
            rated: data.Rated && data.Rated !== 'N/A' ? data.Rated : undefined,
            awards: data.Awards && data.Awards !== 'N/A' ? data.Awards : undefined,
            posterUrl: posterUrl,
        };

    } catch (error) {
        console.error(`Failed to fetch details from OMDb for ${imdbId}:`, error);
        return { otherRatings: {} };
    }
};