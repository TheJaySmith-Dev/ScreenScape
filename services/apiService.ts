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

const TMDB_API_KEY_STORAGE_KEY = 'screenscape_tmdb_api_key';
const GEMINI_API_KEY_STORAGE_KEY = 'screenscape_gemini_api_key';


export const saveTmdbApiKey = (apiKey: string): void => {
    try {
        localStorage.setItem(TMDB_API_KEY_STORAGE_KEY, apiKey);
    } catch (error) {
        console.error("Failed to save TMDb API key to local storage", error);
    }
};

export const getTmdbApiKey = (): string | null => {
    try {
        return localStorage.getItem(TMDB_API_KEY_STORAGE_KEY);
    } catch (error) {
        console.error("Failed to retrieve TMDb API key from local storage", error);
        return null;
    }
};

export const saveGeminiApiKey = (apiKey: string): void => {
    try {
        localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, apiKey);
    } catch (error) {
        console.error("Failed to save Gemini API key to local storage", error);
    }
};

export const getGeminiApiKey = (): string | null => {
    try {
        return localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
    } catch (error) {
        console.error("Failed to retrieve Gemini API key from local storage", error);
        return null;
    }
};

// --- Gemini Rate Limiting ---

const GEMINI_RATE_LIMIT_KEY = 'screenscape_gemini_rate_limit';
const MAX_REQUESTS_PER_DAY = 500;

interface RateLimitState {
    count: number;
    resetTime: number; // Timestamp when the limit resets
}

export const getRateLimitState = (): { canRequest: boolean; resetTime: number | null; count: number } => {
    try {
        const storedState = localStorage.getItem(GEMINI_RATE_LIMIT_KEY);
        if (!storedState) {
            return { canRequest: true, resetTime: null, count: 0 };
        }
        const state: RateLimitState = JSON.parse(storedState);
        const now = Date.now();

        if (now > state.resetTime) {
            // It's a new day, reset.
            localStorage.removeItem(GEMINI_RATE_LIMIT_KEY);
            return { canRequest: true, resetTime: null, count: 0 };
        }

        if (state.count >= MAX_REQUESTS_PER_DAY) {
            return { canRequest: false, resetTime: state.resetTime, count: state.count };
        }

        return { canRequest: true, resetTime: state.resetTime, count: state.count };
    } catch (error) {
        console.error("Failed to read rate limit state", error);
        // Fail open, allow the request.
        return { canRequest: true, resetTime: null, count: 0 };
    }
};

export const incrementRequestCount = (): void => {
    try {
        const storedState = localStorage.getItem(GEMINI_RATE_LIMIT_KEY);
        const now = Date.now();
        let state: RateLimitState;

        if (!storedState || now > JSON.parse(storedState).resetTime) {
            // First request of the day or state is expired
            state = {
                count: 1,
                resetTime: now + 24 * 60 * 60 * 1000 // 24 hours from now
            };
        } else {
            state = JSON.parse(storedState);
            state.count += 1;
        }

        localStorage.setItem(GEMINI_RATE_LIMIT_KEY, JSON.stringify(state));
    } catch (error) {
        console.error("Failed to increment request count", error);
    }
};
