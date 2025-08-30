import { useState, useEffect, useCallback } from 'react';
import type { MediaDetails, LikedItem, DislikedItem } from '../types.ts';
import { getPreferences, savePreferences } from '../services/apiService.ts';

export const usePreferences = () => {
  const [likes, setLikes] = useState<LikedItem[]>([]);
  const [dislikes, setDislikes] = useState<DislikedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const { likes: storedLikes, dislikes: storedDislikes } = getPreferences();
    setLikes(storedLikes || []);
    setDislikes(storedDislikes || []);
    setLoading(false);
  }, []);

  const persistPreferences = useCallback((newLikes: LikedItem[], newDislikes: DislikedItem[]) => {
    savePreferences(newLikes, newDislikes);
  }, []);

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
