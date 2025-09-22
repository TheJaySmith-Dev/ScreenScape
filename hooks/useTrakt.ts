import { useState, useEffect, useCallback } from 'react';
import { useSettings } from './useSettings.ts';
import * as traktService from '../services/traktService.ts';
import * as mediaService from '../services/mediaService.ts';
import type { MediaDetails, TraktWatchlistItem } from '../types.ts';

// Cache to store fetched posters to avoid re-fetching
const posterCache = new Map<number, string>();

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
            const items = await traktService.getWatchlist(trakt.accessToken);

            // Fetch poster URLs for items that don't have them in the cache
            const itemsWithPosters = await Promise.all(items.map(async (item) => {
                if (posterCache.has(item.id)) {
                    return { ...item, posterUrl: posterCache.get(item.id)! };
                }
                try {
                    // This is a minimal fetch just to get the poster
                    const details = await mediaService.fetchApi<any>(`/${item.type}/${item.id}`);
                    const posterUrl = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : `https://picsum.photos/seed/${encodeURIComponent(item.title)}/500/750`;
                    posterCache.set(item.id, posterUrl);
                    return { ...item, posterUrl };
                } catch (e) {
                    console.error(`Failed to fetch poster for ${item.title}`);
                    // Use a placeholder if the fetch fails
                    return { ...item, posterUrl: `https://picsum.photos/seed/${encodeURIComponent(item.title)}/500/750` };
                }
            }));

            setWatchlist(itemsWithPosters);
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
