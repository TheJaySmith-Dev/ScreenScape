import { useState, useEffect, useCallback } from 'react';
import type { MediaDetails, LikedItem, DislikedItem } from '../types.ts';

const LOCAL_STORAGE_KEY_LIKES = 'screenscape_likes';
const LOCAL_STORAGE_KEY_DISLIKES = 'screenscape_dislikes';

export const usePreferences = () => {
    const [likes, setLikes] = useState<LikedItem[]>([]);
    const [dislikes, setDislikes] = useState<DislikedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        try {
            const storedLikes = localStorage.getItem(LOCAL_STORAGE_KEY_LIKES);
            const storedDislikes = localStorage.getItem(LOCAL_STORAGE_KEY_DISLIKES);
            if (storedLikes) setLikes(JSON.parse(storedLikes));
            if (storedDislikes) setDislikes(JSON.parse(storedDislikes));
        } catch (error) {
            console.error("Failed to load preferences from local storage:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const savePreferences = useCallback((newLikes: LikedItem[], newDislikes: DislikedItem[]) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY_LIKES, JSON.stringify(newLikes));
            localStorage.setItem(LOCAL_STORAGE_KEY_DISLIKES, JSON.stringify(newDislikes));
        } catch (error) {
            console.error("Failed to save preferences to local storage:", error);
        }
    }, []);

    const likeItem = useCallback((item: MediaDetails) => {
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

    }, [likes, dislikes, savePreferences]);

    const dislikeItem = useCallback((item: MediaDetails) => {
        const newItem: DislikedItem = {
            id: item.id,
            type: item.type,
        };
        const newLikes = likes.filter(l => l.id !== item.id);
        const newDislikes = [...dislikes.filter(d => d.id !== item.id), newItem];

        setLikes(newLikes);
        setDislikes(newDislikes);
        savePreferences(newLikes, newDislikes);
    }, [likes, dislikes, savePreferences]);
    
    const unlistItem = useCallback((item: MediaDetails) => {
        const newLikes = likes.filter(l => l.id !== item.id);
        const newDislikes = dislikes.filter(d => d.id !== item.id);

        setLikes(newLikes);
        setDislikes(newDislikes);
        savePreferences(newLikes, newDislikes);
    }, [likes, dislikes, savePreferences]);

    const isLiked = (id: number) => likes.some(l => l.id === id);
    const isDisliked = (id: number) => dislikes.some(d => d.id === id);

    return { likes, dislikes, likeItem, dislikeItem, unlistItem, isLiked, isDisliked, isLoading };
};