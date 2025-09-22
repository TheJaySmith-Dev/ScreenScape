import type { MediaDetails, TmdbAccountDetails } from '../types.ts';
import { TMDB_API_KEY } from './constants.ts';

const API_BASE_URL = 'https://api.themoviedb.org/3';

const tmdbApiRequest = async <T>(endpoint: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', body: object | null = null, sessionId?: string): Promise<T> => {
    const apiKey = TMDB_API_KEY;
    // FIX: This comparison appears to be unintentional because the types '"c45a857c193f6302f2b5061c3b85e743"' and '"YOUR_TMDB_API_KEY_V3"' have no overlap.
    if (!apiKey) {
        throw new Error("TMDb API key is not set. Please add it to services/constants.ts.");
    }
    
    const url = `${API_BASE_URL}${endpoint}?api_key=${apiKey}${sessionId ? `&session_id=${sessionId}` : ''}`;
    
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.status_message || 'TMDb API request failed.');
    }

    if (response.status === 204 || response.status === 201) { // 201 for watchlist add/remove success
        const data = await response.json().catch(() => ({})); // some successful POSTs return a body
        return data as T;
    }
    return response.json();
};

// --- Authentication Flow ---

export const createRequestToken = async (): Promise<string> => {
    const data = await tmdbApiRequest<{ request_token: string }>('/authentication/token/new');
    return data.request_token;
};

export const createSession = async (requestToken: string): Promise<{ session_id: string }> => {
    return tmdbApiRequest('/authentication/session/new', 'POST', { request_token: requestToken });
};

export const getAccountDetails = async (sessionId: string): Promise<TmdbAccountDetails> => {
    return tmdbApiRequest('/account', 'GET', null, sessionId);
};

// --- Watchlist Management ---

export const getLikes = async (accountId: number, sessionId: string): Promise<MediaDetails[]> => {
    const movies = await tmdbApiRequest<{ results: any[] }>(`/account/${accountId}/watchlist/movies`, 'GET', null, sessionId);
    const tvShows = await tmdbApiRequest<{ results: any[] }>(`/account/${accountId}/watchlist/tv`, 'GET', null, sessionId);

    const formatItem = (item: any, type: 'movie' | 'tv'): MediaDetails => ({
        id: item.id,
        title: item.title || item.name,
        overview: item.overview,
        posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : `https://picsum.photos/seed/${encodeURIComponent(item.title || item.name)}/500/750`,
        backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : `https://picsum.photos/seed/${encodeURIComponent(item.title || item.name)}/1280/720`,
        releaseYear: (item.release_date || item.first_air_date || '').substring(0, 4),
        rating: item.vote_average,
        trailerUrl: null, // not available in this endpoint
        type: type,
        releaseDate: item.release_date || item.first_air_date,
    });
    
    const formattedMovies = movies.results.map(item => formatItem(item, 'movie'));
    const formattedTv = tvShows.results.map(item => formatItem(item, 'tv'));

    return [...formattedMovies, ...formattedTv];
};

export const modifyLikes = async (accountId: number, sessionId: string, mediaId: number, mediaType: 'movie' | 'tv', isInWatchlist: boolean): Promise<void> => {
    const body = {
        media_type: mediaType,
        media_id: mediaId,
        watchlist: isInWatchlist,
    };
    await tmdbApiRequest(`/account/${accountId}/watchlist`, 'POST', body, sessionId);
};