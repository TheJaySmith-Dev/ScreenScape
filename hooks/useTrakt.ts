import { useState, useEffect, useCallback } from 'react';
import { useSettings } from './useSettings.ts';
import * as traktService from '../services/traktService.ts';
import type { MediaDetails, TraktWatchlistItem } from '../types.ts';

export const useTrakt = () => {
    const { trakt } = useSettings();
    const [watchlist, setWatchlist] = useState<TraktWatchlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWatchlist = useCallback(async () => {
        if (trakt.state !== 'authenticated' || !trakt.accessToken) {
            setWatchlist([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            // This is a simplified fetch. A full implementation would fetch posters from TMDB.
            const items = await traktService.getWatchlist(trakt.accessToken);
            
            // For now, we'll just use the basic info. A more robust solution might
            // involve fetching full MediaDetails for each watchlist item from TMDB.
            setWatchlist(items);

        } catch (err) {
            setError('Could not load your Trakt watchlist.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [trakt.state, trakt.accessToken]);

    useEffect(() => {
        fetchWatchlist();
    }, [fetchWatchlist]);

    const isOnWatchlist = (tmdbId: number) => watchlist.some(item => item.id === tmdbId);

    const addToWatchlist = async (media: MediaDetails) => {
        if (trakt.state !== 'authenticated' || !trakt.accessToken) return;
        if (isOnWatchlist(media.id)) return;

        try {
            await traktService.addToWatchlist(media, trakt.accessToken);
            // Optimistically update UI
            const newItem: TraktWatchlistItem = {
                id: media.id,
                type: media.type,
                title: media.title,
                posterUrl: media.posterUrl,
                releaseYear: media.releaseYear,
            };
            setWatchlist(prev => [newItem, ...prev]);
        } catch (err) {
            console.error("Failed to add to watchlist:", err);
            // Revert optimistic update if API call fails
            fetchWatchlist(); 
        }
    };

    const removeFromWatchlist = async (media: MediaDetails) => {
        if (trakt.state !== 'authenticated' || !trakt.accessToken) return;
        if (!isOnWatchlist(media.id)) return;

        try {
            await traktService.removeFromWatchlist(media, trakt.accessToken);
             // Optimistically update UI
            setWatchlist(prev => prev.filter(item => item.id !== media.id));
        } catch (err) {
            console.error("Failed to remove from watchlist:", err);
            // Revert optimistic update
            fetchWatchlist();
        }
    };

    return { watchlist, isLoading, error, isOnWatchlist, addToWatchlist, removeFromWatchlist, fetchWatchlist };
};
