import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { MediaDetails, LikedItem, DislikedItem } from '../types.ts';
import { getPreferences, savePreferences } from '../services/apiService.ts';

export const usePreferences = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth0();
  const [likes, setLikes] = useState<LikedItem[]>([]);
  const [dislikes, setDislikes] = useState<DislikedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch if authenticated and the auth state is no longer loading.
    if (isAuthenticated && !isAuthLoading) {
      setLoading(true);
      const fetchPrefs = async () => {
        try {
          // The user token is automatically handled by the apiService now.
          const { likes: storedLikes, dislikes: storedDislikes } = await getPreferences();
          setLikes(storedLikes || []);
          setDislikes(storedDislikes || []);
        } catch (error) {
          console.error("Failed to fetch preferences:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPrefs();
    } else if (!isAuthenticated && !isAuthLoading) {
      // Clear preferences if user logs out or is not logged in.
      setLikes([]);
      setDislikes([]);
      setLoading(false);
    }
  }, [isAuthenticated, isAuthLoading]);

  const persistPreferences = useCallback(async (newLikes: LikedItem[], newDislikes: DislikedItem[]) => {
    if (isAuthenticated) {
      try {
        await savePreferences(newLikes, newDislikes);
      } catch (error) {
        console.error("Failed to save preferences", error);
        // In a real app, you might want to handle this with a toast notification to the user
      }
    }
  }, [isAuthenticated]);

  const likeItem = useCallback((item: MediaDetails) => {
    const newLike: LikedItem = {
      id: item.id,
      type: item.type,
      title: item.title,
      posterUrl: item.posterUrl,
      releaseYear: item.releaseYear,
    };

    const updatedLikes = [newLike, ...likes.filter(l => l.id !== item.id)];
    const updatedDislikes = dislikes.filter(d => d.id !== item.id);
    setLikes(updatedLikes);
    setDislikes(updatedDislikes);
    
    persistPreferences(updatedLikes, updatedDislikes);
  }, [likes, dislikes, persistPreferences]);

  const dislikeItem = useCallback((item: MediaDetails) => {
    const newDislike: DislikedItem = {
      id: item.id,
      type: item.type,
    };

    const updatedDislikes = [newDislike, ...dislikes.filter(d => d.id !== item.id)];
    const updatedLikes = likes.filter(l => l.id !== item.id);
    setDislikes(updatedDislikes);
    setLikes(updatedLikes);

    persistPreferences(updatedLikes, updatedDislikes);
  }, [likes, dislikes, persistPreferences]);

  const unlistItem = useCallback((item: MediaDetails) => {
    const updatedLikes = likes.filter(l => l.id !== item.id);
    const updatedDislikes = dislikes.filter(d => d.id !== item.id);
    setLikes(updatedLikes);
    setDislikes(updatedDislikes);
    
    persistPreferences(updatedLikes, updatedDislikes);
  }, [likes, dislikes, persistPreferences]);

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