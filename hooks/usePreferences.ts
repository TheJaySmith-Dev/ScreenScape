
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth.ts';
import type { MediaDetails, LikedItem, DislikedItem } from '../types.ts';

const getPreferencesFromStorage = (key: string) => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to parse preferences from local storage", error);
  }
  return { likes: [], dislikes: [] };
};

export const usePreferences = () => {
  const { currentUser } = useAuth();
  const [likes, setLikes] = useState<LikedItem[]>([]);
  const [dislikes, setDislikes] = useState<DislikedItem[]>([]);

  const storageKey = currentUser ? `watchnow_prefs_${currentUser.email}` : null;

  useEffect(() => {
    if (storageKey) {
      const { likes: storedLikes, dislikes: storedDislikes } = getPreferencesFromStorage(storageKey);
      setLikes(storedLikes || []);
      setDislikes(storedDislikes || []);
    } else {
      // Clear preferences if user logs out
      setLikes([]);
      setDislikes([]);
    }
  }, [storageKey]);

  const savePreferences = useCallback((newLikes: LikedItem[], newDislikes: DislikedItem[]) => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ likes: newLikes, dislikes: newDislikes }));
      } catch (error) {
        console.error("Failed to save preferences to local storage", error);
      }
    }
  }, [storageKey]);

  const likeItem = useCallback((item: MediaDetails) => {
    const newLike: LikedItem = {
      id: item.id,
      type: item.type,
      title: item.title,
      posterUrl: item.posterUrl,
      releaseYear: item.releaseYear,
    };

    setLikes(prevLikes => {
      const updatedLikes = [newLike, ...prevLikes.filter(l => l.id !== item.id)];
      const updatedDislikes = dislikes.filter(d => d.id !== item.id);
      setDislikes(updatedDislikes);
      savePreferences(updatedLikes, updatedDislikes);
      return updatedLikes;
    });
  }, [dislikes, savePreferences]);

  const dislikeItem = useCallback((item: MediaDetails) => {
    const newDislike: DislikedItem = {
      id: item.id,
      type: item.type,
    };

    setDislikes(prevDislikes => {
      const updatedDislikes = [newDislike, ...prevDislikes.filter(d => d.id !== item.id)];
      const updatedLikes = likes.filter(l => l.id !== item.id);
      setLikes(updatedLikes);
      savePreferences(updatedLikes, updatedDislikes);
      return updatedDislikes;
    });
  }, [likes, savePreferences]);

  const unlistItem = useCallback((item: MediaDetails) => {
    setLikes(prevLikes => {
      const updatedLikes = prevLikes.filter(l => l.id !== item.id);
      setDislikes(prevDislikes => {
        const updatedDislikes = prevDislikes.filter(d => d.id !== item.id);
        savePreferences(updatedLikes, updatedDislikes);
        return updatedDislikes;
      });
      return updatedLikes;
    });
  }, [savePreferences]);

  const isLiked = useCallback((itemId: number) => likes.some(l => l.id === itemId), [likes]);
  const isDisliked = useCallback((itemId: number) => dislikes.some(d => d.id === itemId), [dislikes]);

  return {
    likes,
    dislikes,
    likeItem,
    dislikeItem,
    unlistItem,
    isLiked,
    isDisliked,
  };
};
