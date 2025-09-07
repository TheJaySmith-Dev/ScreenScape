import type { User, LikedItem, DislikedItem, RateLimitState } from '../types.ts';

// Authentication is now handled by Logto. The mock API functions are no longer needed.
// For this example, we'll continue to use localStorage for preferences,
// keyed by the user's email from Logto.

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Preferences API ---

const getPreferencesStorageKey = (uid: string) => `screenscape_prefs_${uid}`;

export interface Preferences {
    likes: LikedItem[];
    dislikes: DislikedItem[];
    tmdbApiKey?: string;
    geminiApiKey?: string;
    rateLimitState?: RateLimitState;
}

// FIX: Add getTmdbApiKey to read from local storage for use in service files.
export const getTmdbApiKey = (): string | null => {
    try {
        // Since we can't use Logto hooks here, we'll fall back to a local key
        // if the user isn't logged in. This isn't perfect but allows services to work.
        const localKey = localStorage.getItem('screenscape_tmdb_api_key');
        // A more robust solution might involve passing the key from context to each service call.
        return localKey;
    } catch (error) {
        console.error("Failed to get TMDb API key from local storage", error);
    }
    return null;
};

export const getPreferences = async (uid: string): Promise<Preferences> => {
    // In a real app, this would fetch from a backend database.
    await delay(200);
    const key = getPreferencesStorageKey(uid);
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error("Failed to parse preferences from local storage", error);
    }
    return { likes: [], dislikes: [] };
};

export const savePreferences = async (uid: string, prefs: Partial<Preferences>): Promise<void> => {
    // In a real app, this would save to a backend database.
    await delay(100); 
    const key = getPreferencesStorageKey(uid);
    try {
        const existingPrefs = await getPreferences(uid);
        const newPrefs = { ...existingPrefs, ...prefs };
        localStorage.setItem(key, JSON.stringify(newPrefs));
    } catch (error) {
        console.error("Failed to save preferences to local storage", error);
        throw new Error("Failed to save preferences");
    }
};