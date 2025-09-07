
import { db } from './firebase.ts';
import type { LikedItem, DislikedItem, RateLimitState } from '../types.ts';

// --- Preferences API ---

export interface Preferences {
    likes: LikedItem[];
    dislikes: DislikedItem[];
    tmdbApiKey?: string;
    geminiApiKey?: string;
    rateLimitState?: RateLimitState;
}

// This module-level variable holds the current TMDb API key for services
// that are outside the React component tree (e.g., mediaService).
// It is managed by the SettingsContext to ensure it's always in sync.
let localTmdbApiKey: string | null = null;

export const getTmdbApiKey = (): string | null => {
    return localTmdbApiKey;
};

export const setLocalTmdbApiKey = (key: string | null): void => {
    localTmdbApiKey = key;
};

export const getPreferences = async (uid: string): Promise<Preferences> => {
    try {
        const docRef = db.collection('users').doc(uid);
        const docSnap = await docRef.get();

        const defaultRateLimit = { count: 0, resetTime: new Date().getTime() + 24 * 60 * 60 * 1000 };

        if (docSnap.exists) {
            const data = docSnap.data() as Partial<Preferences>;

            // Return a complete object, ensuring all required fields have defaults.
            return {
                likes: data.likes || [],
                dislikes: data.dislikes || [],
                tmdbApiKey: data.tmdbApiKey,
                geminiApiKey: data.geminiApiKey,
                rateLimitState: data.rateLimitState || defaultRateLimit,
            };
        } else {
            // No document exists, return a default structure.
            return {
                likes: [],
                dislikes: [],
                rateLimitState: defaultRateLimit,
            };
        }
    } catch (error) {
        console.error("Error fetching preferences from Firestore:", error);
        // Fallback to a default structure on error.
        return {
            likes: [],
            dislikes: [],
            rateLimitState: { count: 0, resetTime: new Date().getTime() + 24 * 60 * 60 * 1000 },
        };
    }
};

export const savePreferences = async (uid: string, prefs: Partial<Preferences>): Promise<void> => {
    try {
        // FIX: Using Firebase v8 syntax for Firestore.
        const docRef = db.collection('users').doc(uid);
        // Use setDoc with merge: true to update fields without overwriting the entire document
        await docRef.set(prefs, { merge: true });
    } catch (error) {
        console.error("Error saving preferences to Firestore:", error);
        throw new Error("Failed to save preferences");
    }
};
