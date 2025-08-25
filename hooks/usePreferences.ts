import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth.ts';
import type { MediaDetails } from '../types.ts';

// Simple type for stored preferences, only storing what's needed.
type LikedItem = { id: number; type: 'movie' | 'tv'; title: string };
type DislikedItem = { id: number; type: 'movie' | 'tv' };

interface Preferences {
  likes: LikedItem[];
  dislikes: DislikedItem[];
}

const getPreferencesKey = (email: string | null | undefined): string => {
    return email ? `watchnow_preferences_${email}` : 'watchnow_preferences_guest';
}

const loadPreferences = (key: string): Preferences => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            const prefs = JSON.parse(stored);
            // Basic validation
            return {
                likes: Array.isArray(prefs.likes) ? prefs.likes : [],
                dislikes: Array.isArray(prefs.dislikes) ? prefs.dislikes : []
            };
        }
    } catch (error) {
        console.error("Failed to load or parse preferences from local storage", error);
    }
    return { likes: [], dislikes: [] };
};

const savePreferences = (key: string, prefs: Preferences) => {
    try {
        localStorage.setItem(key, JSON.stringify(prefs));
    } catch (error) {
        console.error("Failed to save preferences to local storage", error);
    }
}

export const usePreferences = () => {
  const { currentUser } = useAuth();
  const preferencesKey = getPreferencesKey(currentUser?.email);
  const [preferences, setPreferences] = useState<Preferences>(() => loadPreferences(preferencesKey));

  // Effect to reload preferences when user changes
  useEffect(() => {
    setPreferences(loadPreferences(getPreferencesKey(currentUser?.email)));
  }, [currentUser]);

  const likeItem = useCallback((item: MediaDetails) => {
    setPreferences(currentPreferences => {
      const newLikes = [...currentPreferences.likes.filter(like => like.id !== item.id), { id: item.id, type: item.type, title: item.title }];
      const newDislikes = currentPreferences.dislikes.filter(dislike => dislike.id !== item.id);
      const updatedPrefs = { ...currentPreferences, likes: newLikes, dislikes: newDislikes };
      savePreferences(preferencesKey, updatedPrefs);
      return updatedPrefs;
    });
  }, [preferencesKey]);

  const dislikeItem = useCallback((item: MediaDetails) => {
    setPreferences(currentPreferences => {
      const newLikes = currentPreferences.likes.filter(like => like.id !== item.id);
      const newDislikes = [...currentPreferences.dislikes.filter(dislike => dislike.id !== item.id), { id: item.id, type: item.type }];
      const updatedPrefs = { ...currentPreferences, likes: newLikes, dislikes: newDislikes };
      savePreferences(preferencesKey, updatedPrefs);
      return updatedPrefs;
    });
  }, [preferencesKey]);
    
  const unlistItem = useCallback((item: MediaDetails) => {
    setPreferences(currentPreferences => {
      const newLikes = currentPreferences.likes.filter(like => like.id !== item.id);
      const newDislikes = currentPreferences.dislikes.filter(dislike => dislike.id !== item.id);
      const updatedPrefs = { ...currentPreferences, likes: newLikes, dislikes: newDislikes };
      savePreferences(preferencesKey, updatedPrefs);
      return updatedPrefs;
    });
  }, [preferencesKey]);

  const isLiked = useCallback((id: number) => preferences.likes.some(like => like.id === id), [preferences.likes]);
  const isDisliked = useCallback((id: number) => preferences.dislikes.some(dislike => dislike.id === id), [preferences.dislikes]);

  return {
    likes: preferences.likes,
    dislikes: preferences.dislikes,
    likeItem,
    dislikeItem,
    unlistItem,
    isLiked,
    isDisliked,
  };
};