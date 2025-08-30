import type { LikedItem, DislikedItem } from '../types.ts';

const PREFERENCES_STORAGE_KEY = 'watchNowPrefs';

interface Preferences {
    likes: LikedItem[];
    dislikes: DislikedItem[];
}

export const getPreferences = (): Preferences => {
    try {
        const storedPrefs = localStorage.getItem(PREFERENCES_STORAGE_KEY);
        if (storedPrefs) {
            return JSON.parse(storedPrefs);
        }
    } catch (error) {
        console.error("Failed to read preferences from localStorage:", error);
    }
    return { likes: [], dislikes: [] };
};

export const savePreferences = (likes: LikedItem[], dislikes: DislikedItem[]): void => {
    try {
        const prefs: Preferences = { likes, dislikes };
        localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
    } catch (error) {
        console.error("Failed to save preferences to localStorage:", error);
    }
};
