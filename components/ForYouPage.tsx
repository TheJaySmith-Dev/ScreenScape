import React, { useState, useEffect, useCallback } from 'react';
import { usePreferences } from '../hooks/usePreferences.ts';
import { getRecommendationsFromTastes } from '../services/mediaService.ts';
import type { MediaDetails } from '../types.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { RecommendationGrid } from './RecommendationGrid.tsx';

interface ForYouPageProps {
  onSelectMedia: (media: MediaDetails) => void;
}

export const ForYouPage: React.FC<ForYouPageProps> = ({ onSelectMedia }) => {
  const { likes, dislikes } = usePreferences();
  const [recommendations, setRecommendations] = useState<MediaDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForYouRecommendations = useCallback(async () => {
    if (likes.length === 0) {
      setRecommendations([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const results = await getRecommendationsFromTastes(likes, dislikes);
      
      if (results.length === 0) {
        setError("Could not generate recommendations. Try liking a few more items!");
      } else {
        setRecommendations(results);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(errorMessage);
      setError("An error occurred while fetching recommendations.");
    } finally {
      setIsLoading(false);
    }
  }, [likes, dislikes]);

  useEffect(() => {
    fetchForYouRecommendations();
  }, [fetchForYouRecommendations]);

  if (likes.length === 0) {
    return (
      <div className="text-center text-white/80 fade-in">
        <h2 className="text-xl font-bold mb-4 text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>Your Personal Recommendations</h2>
        <p>Start liking movies and TV shows to get personalized suggestions here.</p>
        <p className="text-sm mt-2">Use the <span className="text-green-400">👍</span> button on any title's detail page.</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-200 bg-red-500/40 p-4 rounded-lg">{error}</div>;
  }

  return (
    <div className="w-full max-w-7xl fade-in text-white">
      <h2 className="text-2xl font-bold mb-6" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>For You</h2>
      <RecommendationGrid recommendations={recommendations} onSelect={onSelectMedia} />
    </div>
  );
};
