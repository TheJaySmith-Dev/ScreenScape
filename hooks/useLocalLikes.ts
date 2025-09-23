import { useState, useEffect, useCallback } from 'react';
import type { MediaDetails } from '../types.ts';

const LIKES_STORAGE_KEY = 'screenscape_local_likes';

const getInitialLikes = (): MediaDetails[] => {
    try {
        const stored = localStorage.getItem(LIKES_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to parse likes from local storage", e);
        return [];
    }
};

export const useLocalLikes = () => {
    const [likes, setLikes] = useState<MediaDetails[]>(getInitialLikes());
    const [isLoading, setIsLoading] = useState(false); // Kept for compatibility, but not really async.
    const [error, setError] = useState<string | null>(null); // Kept for compatibility

    // Persist likes to localStorage whenever they change.
    useEffect(() => {
        try {
            localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likes));
        } catch (e) {
            console.error("Failed to save likes to local storage", e);
            setError("Could not save your likes.");
        }
    }, [likes]);

    const isOnLikes = (tmdbId: number) => likes.some(item => item.id === tmdbId);

    const addToLikes = useCallback((media: MediaDetails) => {
        if (isOnLikes(media.id)) return;
        setLikes(prev => [media, ...prev]);
    }, [likes]);

    const removeFromLikes = useCallback((media: MediaDetails) => {
        setLikes(prev => prev.filter(item => item.id !== media.id));
    }, []);

    return { likes, isLoading, error, isOnLikes, addToLikes, removeFromLikes };
};