import { useState, useEffect, useCallback } from 'react';
import { useSettings } from './useSettings.ts';
import * as tmdbAuthService from '../services/tmdbAuthService.ts';
import type { MediaDetails } from '../types.ts';

export const useTmdbAccount = () => {
    const { tmdb } = useSettings();
    const [watchlist, setWatchlist] = useState<MediaDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWatchlist = useCallback(async () => {
        if (tmdb.state !== 'authenticated' || !tmdb.accountDetails?.id || !tmdb.sessionId) {
            setWatchlist([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const items = await tmdbAuthService.getWatchlist(tmdb.accountDetails.id, tmdb.sessionId);
            setWatchlist(items);
        } catch (err) {
            setError('Could not load your TMDb watchlist.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [tmdb.state, tmdb.accountDetails, tmdb.sessionId]);

    useEffect(() => {
        fetchWatchlist();
    }, [fetchWatchlist]);

    const isOnWatchlist = (tmdbId: number) => watchlist.some(item => item.id === tmdbId);

    const addToWatchlist = async (media: MediaDetails) => {
        if (isOnWatchlist(media.id) || !tmdb.accountDetails?.id || !tmdb.sessionId) return;
        
        try {
            setWatchlist(prev => [media, ...prev]); // Optimistic update
            await tmdbAuthService.modifyWatchlist(tmdb.accountDetails.id, tmdb.sessionId, media.id, media.type, true);
        } catch (err) {
            setError("Failed to add to watchlist. Please try again.");
            fetchWatchlist(); // Revert
        }
    };

    const removeFromWatchlist = async (media: MediaDetails) => {
        if (!isOnWatchlist(media.id) || !tmdb.accountDetails?.id || !tmdb.sessionId) return;

        try {
            setWatchlist(prev => prev.filter(item => item.id !== media.id)); // Optimistic update
            await tmdbAuthService.modifyWatchlist(tmdb.accountDetails.id, tmdb.sessionId, media.id, media.type, false);
        } catch (err) {
            setError("Failed to remove from watchlist. Please try again.");
            fetchWatchlist(); // Revert
        }
    };

    return { watchlist, isLoading, error, isOnWatchlist, addToWatchlist, removeFromWatchlist };
};