import type { MediaDetails, TraktWatchlistItem, TraktStats } from '../types.ts';

const CLIENT_ID = '73f5fc3ac40020a73a2d207f82c08ad274a1bd702513bc7d686f1facb8dea492';
// SECURITY WARNING: Storing and using a client_secret in a client-side application is a significant security risk.
// It should ideally be handled by a backend proxy. This implementation proceeds because it's the only option
// in a purely client-side environment where the API provider does not support the PKCE flow.
const CLIENT_SECRET = 'cd44e8061745f1113a53fbb769a9b59103283e36a8d75af3891f43fe8a46aab8';
const API_URL = 'https://api.trakt.tv';

export interface DeviceCodeResponse {
    device_code: string;
    user_code: string;
    verification_url: string;
    expires_in: number;
    interval: number;
}

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

export const getDeviceCode = async (): Promise<DeviceCodeResponse> => {
    const response = await fetch(`${API_URL}/oauth/device/code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': CLIENT_ID,
        },
        body: JSON.stringify({ client_id: CLIENT_ID }),
    });
    if (!response.ok) throw new Error('Failed to get device code from Trakt.');
    return response.json();
};

export const pollForToken = async (deviceCode: string): Promise<TokenResponse> => {
    const response = await fetch(`${API_URL}/oauth/device/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': CLIENT_ID,
        },
        body: JSON.stringify({
            code: deviceCode,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        }),
    });
    
    // 200 means success, anything else means we keep polling or fail.
    if (response.status === 200) {
        return response.json();
    }
    
    if (response.status === 400) throw new Error('Pending: User has not authorized yet.');
    if (response.status === 404) throw new Error('Expired: The code has expired.');
    if (response.status === 409) throw new Error('Conflict: Code has already been used.');
    if (response.status === 410) throw new Error('Denied: User explicitly denied the request.');
    
    throw new Error(`Polling failed with status: ${response.status}`);
};


export const refreshToken = async (refreshToken: string): Promise<TokenResponse> => {
    const response = await fetch(`${API_URL}/oauth/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': CLIENT_ID,
        },
        body: JSON.stringify({
            refresh_token: refreshToken,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: 'urn:ietf:wg:oauth:2.0:oob', // Required for refresh, but value doesn't matter for device auth
            grant_type: 'refresh_token',
        }),
    });
     if (!response.ok) {
        throw new Error('Failed to refresh Trakt token');
    }
    return response.json();
}

const getTraktPayloadFromMedia = (media: MediaDetails) => {
    return {
        title: media.title,
        year: parseInt(media.releaseYear, 10),
        ids: {
            tmdb: media.id,
            imdb: media.imdbId
        }
    };
};

export const getWatchlist = async (accessToken: string): Promise<TraktWatchlistItem[]> => {
    const traktItems = await apiRequest<any[]>('/sync/watchlist/movies,shows', 'GET', accessToken);
    const watchlist: TraktWatchlistItem[] = [];

    for (const item of traktItems) {
        const media = item.movie || item.show;
        if (media.ids.tmdb) {
            watchlist.push({
                id: media.ids.tmdb,
                type: item.type === 'show' ? 'tv' : 'movie',
                title: media.title,
                releaseYear: String(media.year),
                // Poster URL needs to be fetched separately.
                posterUrl: '', 
            });
        }
    }
    return watchlist;
};

export const addToWatchlist = async (media: MediaDetails, accessToken: string): Promise<void> => {
    const body = {
        [media.type === 'tv' ? 'shows' : 'movies']: [getTraktPayloadFromMedia(media)]
    };
    await apiRequest('/sync/watchlist', 'POST', accessToken, body);
};

export const removeFromWatchlist = async (media: MediaDetails, accessToken: string): Promise<void> => {
     const body = {
        [media.type === 'tv' ? 'shows' : 'movies']: [getTraktPayloadFromMedia(media)]
    };
    await apiRequest('/sync/watchlist/remove', 'POST', accessToken, body);
};

export const getTraktStats = async (tmdbId: number, type: 'movie' | 'tv', accessToken: string): Promise<TraktStats | null> => {
     try {
        const searchType = type === 'tv' ? 'show' : 'movie';
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