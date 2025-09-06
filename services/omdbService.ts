
import type { OmdbDetails } from '../types.ts';

// User-provided API key for the OMDb public API.
const OMDb_API_KEY = '2b067fb4';
const OMDb_API_URL = `https://www.omdbapi.com/?apikey=${OMDb_API_KEY}`;

/**
 * Parses the box office string from OMDb (e.g., "$1,234,567") into a number.
 * @param value The string value from the API.
 * @returns A number, or null if the value is invalid.
 */
const parseBoxOffice = (value: string): number | null => {
    if (!value || value === 'N/A') {
        return null;
    }
    // Remove '$' and ',' and parse to number
    return parseInt(value.replace(/\$/g, '').replace(/,/g, ''), 10);
};

/**
 * Fetches the domestic box office gross for a given IMDb ID from OMDb.
 * @param imdbId The IMDb ID of the movie.
 * @returns A promise that resolves to the box office number, or null.
 */
export const fetchBoxOffice = async (imdbId: string): Promise<number | null> => {
    try {
        const response = await fetch(`${OMDb_API_URL}&i=${imdbId}`);
        if (!response.ok) {
            console.error(`OMDb API error for ${imdbId}: ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        if (data.Response === 'True' && data.BoxOffice) {
            return parseBoxOffice(data.BoxOffice);
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch box office for ${imdbId}:`, error);
        return null;
    }
};

/**
 * Fetches detailed information for a given IMDb ID from OMDb.
 * @param imdbId The IMDb ID of the media.
 * @returns A promise that resolves to the OMDb details, or null.
 */
export const fetchOmdbDetails = async (imdbId: string): Promise<OmdbDetails | null> => {
    try {
        const response = await fetch(`${OMDb_API_URL}&i=${imdbId}&plot=full`);
        if (!response.ok) {
            console.error(`OMDb API error for ${imdbId}: ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        if (data.Response === 'True') {
            return data;
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch details for ${imdbId}:`, error);
        return null;
    }
};
