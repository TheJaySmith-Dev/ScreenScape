import { useState, useEffect, useCallback } from 'react';
import { getSimilarContentRecommendations, getRecommendationsForSingleItem } from '../services/recommendationService.ts';
import type { MediaDetails, AiCuratedCarousel, LikedItem } from '../types.ts';
import { usePreferences } from './usePreferences.ts';
import { useSettings } from './useSettings.ts';

export const useRecommendations = () => {
    const { likes, isLoading: preferencesLoading } = usePreferences();
    const { tmdbApiKey, geminiApiKey } = useSettings();
    const [forYouRecs, setForYouRecs] = useState<AiCuratedCarousel[]>([]);
    const [sinceYouLikedRecs, setSinceYouLikedRecs] = useState<MediaDetails[]>([]);
    const [featuredLikedItem, setFeaturedLikedItem] = useState<LikedItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRecommendations = useCallback(() => {
        if (likes.length > 0 && tmdbApiKey && geminiApiKey) {
            setIsLoading(true);
            const randomLikedItem = likes[Math.floor(Math.random() * likes.length)];
            setFeaturedLikedItem(randomLikedItem);

            Promise.all([
                getRecommendationsForSingleItem(randomLikedItem),
                getSimilarContentRecommendations(likes)
            ]).then(([singleItemRecs, forYouRecs]) => {
                setSinceYouLikedRecs(singleItemRecs);
                setForYouRecs(forYouRecs);
            }).finally(() => {
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [likes, tmdbApiKey, geminiApiKey]);

    useEffect(() => {
        if (!preferencesLoading) {
            fetchRecommendations();
        }
    }, [likes, preferencesLoading, fetchRecommendations]);

    return { forYouRecs, sinceYouLikedRecs, featuredLikedItem, isLoading };
};
