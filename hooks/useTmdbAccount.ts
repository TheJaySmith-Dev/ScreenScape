import { useState, useEffect, useCallback } from 'react';
import { useSettings } from './useSettings.ts';
import * as tmdbAuthService from '../services/tmdbAuthService.ts';
import type { MediaDetails } from '../types.ts';

export const useTmdbAccount = () => {
    const { tmdb } = useSettings();
    const [likes, setLikes] = useState<MediaDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLikes = useCallback(async () => {
        if (tmdb.state !== 'authenticated' || !tmdb.accountDetails?.id || !tmdb.sessionId) {
            setLikes([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const items = await tmdbAuthService.getLikes(tmdb.accountDetails.id, tmdb.sessionId);
            setLikes(items);
        } catch (err) {
            setError('Could not load your TMDb likes.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [tmdb.state, tmdb.accountDetails, tmdb.sessionId]);

    useEffect(() => {
        fetchLikes();
    }, [fetchLikes]);

    const isOnLikes = (tmdbId: number) => likes.some(item => item.id === tmdbId);

    const addToLikes = async (media: MediaDetails) => {
        if (isOnLikes(media.id) || !tmdb.accountDetails?.id || !tmdb.sessionId) return;
        
        try {
            setLikes(prev => [media, ...prev]); // Optimistic update
            await tmdbAuthService.modifyLikes(tmdb.accountDetails.id, tmdb.sessionId, media.id, media.type, true);
        } catch (err) {
            setError("Failed to add to likes. Please try again.");
            fetchLikes(); // Revert
        }
    };

    const removeFromLikes = async (media: MediaDetails) => {
        if (!isOnLikes(media.id) || !tmdb.accountDetails?.id || !tmdb.sessionId) return;

        try {
            setLikes(prev => prev.filter(item => item.id !== media.id)); // Optimistic update
            await tmdbAuthService.modifyLikes(tmdb.accountDetails.id, tmdb.sessionId, media.id, media.type, false);
        } catch (err) {
            setError("Failed to remove from likes. Please try again.");
            fetchLikes(); // Revert
        }
    };

    return { likes, isLoading, error, isOnLikes, addToLikes, removeFromLikes };
};