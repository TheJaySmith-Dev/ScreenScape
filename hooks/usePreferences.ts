import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth.ts';
import type { MediaDetails, LikedItem, DislikedItem } from '../types.ts';
import * as api from '../services/apiService.ts';

export const usePreferences = () => {
  const { currentUser } = useAuth();
  const [likes, setLikes] = useState<LikedItem[]>([]);
  const [dislikes, setDislikes] = useState<DislikedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.email) {
      setLoading(true);
      const fetchPrefs = async () => {
        try {
          const { likes: storedLikes, dislikes: storedDislikes } = await api.getPreferences(currentUser.email!);
          setLikes(storedLikes || []);
          setDislikes(storedDislikes || []);
        } catch (error) {
          console.error("Failed to fetch preferences:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPrefs();
    } else {
      // Clear preferences if user logs out
      setLikes([]);
      setDislikes([]);
      setLoading(false);
    }
  }, [currentUser]);

  const savePreferences = useCallback(async (newLikes: LikedItem[], newDislikes: DislikedItem[]) => {
    if (currentUser?.email) {
      try {
        await api.savePreferences(currentUser.email, newLikes, newDislikes);
      } catch (error) {
        console.error("Failed to save preferences", error);
        // In a real app, you might want to handle this with a toast notification to the user
      }
    }
  }, [currentUser]);

  const likeItem = useCallback((item: MediaDetails) => {
    const newLike: LikedItem = {
      id: item.id,
      type: item.type,
      title: item.title,
      posterUrl: item.posterUrl,
      releaseYear: item.releaseYear,
    };

    // Optimistic UI update
    const updatedLikes = [newLike, ...likes.filter(l => l.id !== item.id)];
    const updatedDislikes = dislikes.filter(d => d.id !== item.id);
    setLikes(updatedLikes);
    setDislikes(updatedDislikes);
    
    // Persist change in the background
    savePreferences(updatedLikes, updatedDislikes);
  }, [likes, dislikes, savePreferences]);

  const dislikeItem = useCallback((item: MediaDetails) => {
    const newDislike: DislikedItem = {
      id: item.id,
      type: item.type,
    };

    // Optimistic UI update
    const updatedDislikes = [newDislike, ...dislikes.filter(d => d.id !== item.id)];
    const updatedLikes = likes.filter(l => l.id !== item.id);
    setDislikes(updatedDislikes);
    setLikes(updatedLikes);

    // Persist change in the background
    savePreferences(updatedLikes, updatedDislikes);
  }, [likes, dislikes, savePreferences]);

  const unlistItem = useCallback((item: MediaDetails) => {
    // Optimistic UI update
    const updatedLikes = likes.filter(l => l.id !== item.id);
    const updatedDislikes = dislikes.filter(d => d.id !== item.id);
    setLikes(updatedLikes);
    setDislikes(updatedDislikes);
    
    // Persist change in the background
    savePreferences(updatedLikes, updatedDislikes);
  }, [likes, dislikes, savePreferences]);

  const isLiked = useCallback((itemId: number) => likes.some(l => l.id === itemId), [likes]);
  const isDisliked = useCallback((itemId: number) => dislikes.some(d => d.id === itemId), [dislikes]);

  return {
    likes,
    dislikes,
    loading,
    likeItem,
    dislikeItem,
    unlistItem,
    isLiked,
    isDisliked,
  };
};
