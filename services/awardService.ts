import { fetchApi } from './mediaService';
import type { MediaDetails } from '../types';

interface Keyword {
    id: number;
    name: string;
}

interface KeywordSearchResponse {
    results: Keyword[];
}

export interface Award {
    id: number;
    name: string;
    logoUrl: string;
    bgColor?: string;
    borderColor?: string;
}

// Hardcoded list of supported awards
export const supportedAwards: Award[] = [
    { id: 15, name: 'Academy Awards', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2d/Oscars_logo.svg/1280px-Oscars_logo.svg.png', bgColor: '#000000', borderColor: '#B49823' },
    { id: 16, name: 'Golden Globes', logoUrl: 'https://i.postimg.cc/W1pXy41m/golden-globes-logo.png' },
    { id: 17, name: 'BAFTA Awards', logoUrl: 'https://i.postimg.cc/P5YQJv7j/bafta-logo.png' },
];

export const searchKeyword = async (query: string): Promise<Keyword | null> => {
    try {
        const response = await fetchApi<KeywordSearchResponse>(`/search/keyword?query=${encodeURIComponent(query)}`);
        if (response.results.length > 0) {
            return response.results[0];
        }
        return null;
    } catch (error) {
        console.error(`Failed to search for keyword "${query}":`, error);
        return null;
    }
};

export const getMoviesByKeyword = async (keywordId: number): Promise<MediaDetails[]> => {
    try {
        const response = await fetchApi<{ results: MediaDetails[] }>(`/keyword/${keywordId}/movies`);
        return response.results;
    } catch (error) {
        console.error(`Failed to get movies for keyword ID ${keywordId}:`, error);
        return [];
    }
};
