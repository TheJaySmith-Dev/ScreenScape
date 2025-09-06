import type { User, LikedItem, DislikedItem } from '../types.ts';

// In a real application, these functions would make network requests to a backend API
// (e.g., Netlify Functions) that interacts with a database like Neon.
// For this example, we'll simulate the async nature and use localStorage as a fallback.

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const LOCAL_STORAGE_KEY_USER = 'screenscape_user';

// --- Auth API ---

export const getUser = async (): Promise<User | null> => {
    // REAL IMPLEMENTATION: Replace with a fetch call to your backend endpoint
    // Example: const response = await fetch('/.netlify/functions/get-user');
    await delay(200); // Simulate network latency
    try {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from local storage", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
    }
    return null;
};

export const login = async (email: string): Promise<User> => {
    // REAL IMPLEMENTATION: Replace with a fetch call to your backend endpoint
    // Example: const response = await fetch('/.netlify/functions/login', { method: 'POST', body: JSON.stringify({ email }) });
    await delay(500); // Simulate network latency
    const user: User = {
        email,
        displayName: email.split('@')[0],
    };
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(user));
    } catch (error) {
        console.error("Failed to save user to local storage", error);
        // In a real app, the error would come from the server
        throw new Error("Failed to login");
    }
    return user;
};

export const logout = async (): Promise<void> => {
    // REAL IMPLEMENTATION: Replace with a fetch call to your backend endpoint
    // Example: await fetch('/.netlify/functions/logout', { method: 'POST' });
    await delay(200);
    try {
        localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
    } catch (error) {
        console.error("Failed to remove user from local storage", error);
    }
};

// --- Preferences API ---

const getPreferencesStorageKey = (email: string) => `screenscape_prefs_${email}`;

interface Preferences {
    likes: LikedItem[];
    dislikes: DislikedItem[];
}

export const getPreferences = async (email: string): Promise<Preferences> => {
    // REAL IMPLEMENTATION: Replace with a fetch call to your backend endpoint
    // Example: const response = await fetch(`/.netlify/functions/preferences?email=${email}`);
    await delay(200);
    const key = getPreferencesStorageKey(email);
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

export const savePreferences = async (email: string, likes: LikedItem[], dislikes: DislikedItem[]): Promise<void> => {
    // REAL IMPLEMENTATION: Replace with a fetch call to your backend endpoint
    // Example: await fetch('/.netlify/functions/preferences', { method: 'POST', body: JSON.stringify({ email, likes, dislikes }) });
    await delay(100); // Saving is usually faster
    const key = getPreferencesStorageKey(email);
    try {
        localStorage.setItem(key, JSON.stringify({ likes, dislikes }));
    } catch (error) {
        console.error("Failed to save preferences to local storage", error);
        throw new Error("Failed to save preferences");
    }
};


// --- API Keys Management ---

const TMDB_API_KEY_STORAGE_KEY = 'tmdb_api_key';

export const getTmdbApiKey = (): string | null => {
    try {
        return localStorage.getItem(TMDB_API_KEY_STORAGE_KEY);
    } catch (e) {
        console.error("Could not read from local storage", e);
        return null;
    }
};

export const setTmdbApiKey = (key: string): void => {
    try {
        localStorage.setItem(TMDB_API_KEY_STORAGE_KEY, key);
    } catch (e) {
        console.error("Could not write to local storage", e);
    }
};