import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth.ts';
import * as api from '../services/apiService.ts';
import type { MediaDetails, LikedItem, DislikedItem } from '../types.ts';

export const usePreferences = () => {
    const { currentUser } = useAuth();
    const [likes, setLikes] = useState<LikedItem[]>([]);
    const [dislikes, setDislikes] = useState<DislikedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPreferences = async () => {
            if (currentUser) {
                setIsLoading(true);
                try {
                    const prefs = await api.getPreferences(currentUser.email);
                    setLikes(prefs.likes);
                    setDislikes(prefs.dislikes);
                } catch (error) {
                    console.error("Failed to load preferences:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                // If no user, clear preferences
                setLikes([]);
                setDislikes([]);
                setIsLoading(false);
            }
        };
        loadPreferences();
    }, [currentUser]);

    const savePreferences = useCallback(async (newLikes: LikedItem[], newDislikes: DislikedItem[]) => {
        if (currentUser) {
            try {
                await api.savePreferences(currentUser.email, { likes: newLikes, dislikes: newDislikes });
            } catch (error) {
                console.error("Failed to save preferences:", error);
            }
        }
    }, [currentUser]);

    const likeItem = useCallback((item: MediaDetails) => {
        if (!currentUser) return;
        const newItem: LikedItem = {
            id: item.id,
            type: item.type,
            title: item.title,
            posterUrl: item.posterUrl,
            releaseYear: item.releaseYear,
        };
        const newLikes = [...likes.filter(l => l.id !== item.id), newItem];
        const newDislikes = dislikes.filter(d => d.id !== item.id);
        
        setLikes(newLikes);
        setDislikes(newDislikes);
        savePreferences(newLikes, newDislikes);

    }, [likes, dislikes, savePreferences, currentUser]);

    const dislikeItem = useCallback((item: MediaDetails) => {
        if (!currentUser) return;
        const newItem: DislikedItem = {
            id: item.id,
            type: item.type,
        };
        const newLikes = likes.filter(l => l.id !== item.id);
        const newDislikes = [...dislikes.filter(d => d.id !== item.id), newItem];

        setLikes(newLikes);
        setDislikes(newDislikes);
        savePreferences(newLikes, newDislikes);
    }, [likes, dislikes, savePreferences, currentUser]);
    
    const unlistItem = useCallback((item: MediaDetails) => {
        if (!currentUser) return;
        const newLikes = likes.filter(l => l.id !== item.id);
        const newDislikes = dislikes.filter(d => d.id !== item.id);

        setLikes(newLikes);
        setDislikes(newDislikes);
        savePreferences(newLikes, newDislikes);
    }, [likes, dislikes, savePreferences, currentUser]);

    const isLiked = (id: number) => likes.some(l => l.id === id);
    const isDisliked = (id: number) => dislikes.some(d => d.id === id);

    return { likes, dislikes, likeItem, dislikeItem, unlistItem, isLiked, isDisliked, isLoading };
};