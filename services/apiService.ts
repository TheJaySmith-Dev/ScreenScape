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

// FIX: Add getTmdbApiKey to read from local storage for use in service files.
// This is now more of a legacy function; the primary key management is through context.
// However, it can be useful for services that don't have access to React hooks.
// A better long-term solution would be to pass the key explicitly or use a singleton service.
let localTmdbApiKey: string | null = null;
export const getTmdbApiKey = (): string | null => {
    // This function will rely on the key being set in the context first.
    // The context will update this local variable.
    return localTmdbApiKey;
};

export const getPreferences = async (uid: string): Promise<Preferences> => {
    try {
        // FIX: Using Firebase v8 syntax for Firestore.
        const docRef = db.collection('users').doc(uid);
        const docSnap = await docRef.get();

        // FIX: In Firebase v8, `exists` is a property, not a method.
        if (docSnap.exists) {
            const data = docSnap.data() as Preferences;
            // Update the local variable for legacy services
            if (data.tmdbApiKey) {
                localTmdbApiKey = data.tmdbApiKey;
            }
            return data;
        } else {
            // No document found, return default.
            return { likes: [], dislikes: [] };
        }
    } catch (error) {
        console.error("Error fetching preferences from Firestore:", error);
        // Fallback to a default structure on error.
        return { likes: [], dislikes: [] };
    }
};

export const savePreferences = async (uid: string, prefs: Partial<Preferences>): Promise<void> => {
    try {
        // FIX: Using Firebase v8 syntax for Firestore.
        const docRef = db.collection('users').doc(uid);
        // Use setDoc with merge: true to update fields without overwriting the entire document
        await docRef.set(prefs, { merge: true });
        
        // Update the local variable if the key is being saved
        if (prefs.tmdbApiKey) {
            localTmdbApiKey = prefs.tmdbApiKey;
        }
    } catch (error) {
        console.error("Error saving preferences to Firestore:", error);
        throw new Error("Failed to save preferences");
    }
};
