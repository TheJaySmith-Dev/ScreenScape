import type { MediaDetails, TraktWatchlistItem, TraktStats } from '../types.ts';

const CLIENT_ID = '73f5fc3ac40020a73a2d207f82c08ad274a1bd702513bc7d686f1facb8dea492';
const CLIENT_SECRET = 'cd44e8061745f1113a53fbb769a9b59103283e36a8d75af3891f43fe8a46aab8';
// FIX: Export the REDIRECT_URI so it can be displayed in the UI for easy copying.
export const REDIRECT_URI = window.location.href.split('#')[0].replace(/\/$/, '') + '/#/callback/trakt';
const API_URL = 'https://api.trakt.tv';

interface TokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    created_at: number;
}

const apiRequest = async <T>(endpoint: string, method: 'GET' | 'POST', accessToken: string, body?: object): Promise<T> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': CLIENT_ID,
            'Authorization': `Bearer ${accessToken}`,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Trakt API Error: ${response.status} - ${errorText}`);
        throw new Error(`Trakt API request failed: ${response.statusText}`);
    }

    if (response.status === 204) { // No Content
        return null as T;
    }

    return response.json();
};

export const initiateAuth = () => {
    console.log(
        '%cTRAKT AUTH:', 
        'font-weight: bold; color: #ed1c24;', 
        'Your Redirect URI is:', 
        `'${REDIRECT_URI}'`,
        '\nPlease make sure this EXACTLY matches the Redirect URI in your Trakt application settings.'
    );
    const authUrl = `https://trakt.tv/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location.href = authUrl;
};

export const exchangeCodeForToken = async (code: string): Promise<TokenResponse> => {
    const response = await fetch(`${API_URL}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to exchange auth code for token');
    }
    return response.json();
};

export const refreshToken = async (refreshToken: string): Promise<TokenResponse> => {
    const response = await fetch(`${API_URL}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            refresh_token: refreshToken,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'refresh_token',
        }),
    });
     if (!response.ok) {
        throw new Error('Failed to refresh Trakt token');
    }
    return response.json();
}

const getTraktItemFromMedia = async (media: MediaDetails, accessToken: string) => {
    // Trakt uses slugs for shows, but TMDB ID works for lookup.
    // The sync/watchlist endpoint requires a more detailed object structure.
    const searchType = media.type === 'tv' ? 'show' : 'movie';
    const searchResult = await apiRequest<any[]>(`/search/tmdb/${media.id}?type=${searchType}`, 'GET', accessToken);

    if (searchResult && searchResult.length > 0) {
        return searchResult[0]; // The first result is usually the correct one
    }
    throw new Error(`Could not find ${media.title} on Trakt.`);
};

export const getWatchlist = async (accessToken: string): Promise<TraktWatchlistItem[]> => {
    const traktItems = await apiRequest<any[]>('/sync/watchlist/movies,shows', 'GET', accessToken);
    return traktItems.map(item => {
        const media = item.movie || item.show;
        return {
            id: media.ids.tmdb,
            type: item.type === 'show' ? 'tv' : 'movie',
            title: media.title,
            releaseYear: media.year,
            posterUrl: `https://image.tmdb.org/t/p/w500${media.ids.tmdb ? '' : ''}`, // Poster needs separate fetch if not available
        };
    });
};

export const addToWatchlist = async (media: MediaDetails, accessToken: string): Promise<void> => {
    const traktItem = await getTraktItemFromMedia(media, accessToken);
    const body = {
        [media.type === 'tv' ? 'shows' : 'movies']: [traktItem.show || traktItem.movie]
    };
    await apiRequest('/sync/watchlist', 'POST', accessToken, body);
};

export const removeFromWatchlist = async (media: MediaDetails, accessToken: string): Promise<void> => {
    const traktItem = await getTraktItemFromMedia(media, accessToken);
     const body = {
        [media.type === 'tv' ? 'shows' : 'movies']: [traktItem.show || traktItem.movie]
    };
    await apiRequest('/sync/watchlist/remove', 'POST', accessToken, body);
};

export const getTraktStats = async (tmdbId: number, type: 'movie' | 'tv', accessToken: string): Promise<TraktStats | null> => {
     try {
        const searchType = type === 'tv' ? 'show' : 'movie';
        // Trakt requires its own ID or slug for stats, so we must look it up first
        const searchResult = await apiRequest<any[]>(`/search/tmdb/${tmdbId}?type=${searchType}`, 'GET', accessToken);
        if (!searchResult || searchResult.length === 0) return null;
        
        const traktId = (searchResult[0].movie || searchResult[0].show).ids.trakt;
        const stats = await apiRequest<TraktStats>(`/${searchType}s/${traktId}/stats`, 'GET', accessToken);
        return stats;
    } catch(error) {
        console.error("Failed to get Trakt stats", error);
        return null;
    }
}