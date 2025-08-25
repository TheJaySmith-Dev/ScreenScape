import React, { useState, useEffect, useCallback } from 'react';
import { usePreferences } from '../hooks/usePreferences.ts';
import { getRecommendations } from '../services/geminiService.ts';
import { fetchDetailsByTitle } from '../services/tmdbService.ts';
import type { MediaDetails } from '../types.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { RecommendationGrid } from './RecommendationGrid.tsx';

interface ForYouPageProps {
  onSelectMedia: (media: MediaDetails) => void;
}

export const ForYouPage: React.FC<ForYouPageProps> = ({ onSelectMedia }) => {
  const { likes } = usePreferences();
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
      const likedTitles = likes.map(item => item.title).join(', ');
      const prompt = `Based on my interest in the following movies and TV shows, please recommend some others I might enjoy. My liked items are: ${likedTitles}.`;

      const geminiResults = await getRecommendations(prompt);
      if (!geminiResults || geminiResults.length === 0) {
        throw new Error('Could not find any recommendations based on your liked items.');
      }

      const tmdbPromises = geminiResults.map(rec =>
        fetchDetailsByTitle(rec.title, rec.type)
      );

      const tmdbResults = await Promise.all(tmdbPromises);
      const validResults = tmdbResults.filter((result): result is MediaDetails => result !== null);

      if (validResults.length === 0) {
        setError("Found recommendations, but couldn't fetch their details. Please try again.");
      } else {
        setRecommendations(validResults);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [likes]);

  useEffect(() => {
    fetchForYouRecommendations();
  }, [fetchForYouRecommendations]);

  if (likes.length === 0) {
    return (
      <div className="text-center text-gray-400 fade-in">
        <h2 className="text-2xl font-bold mb-4 text-white">Your Personal Recommendations</h2>
        <p>Start liking movies and TV shows to get personalized suggestions here.</p>
        <p className="text-sm mt-2">Use the <span className="text-green-400">👍</span> button on any title's detail page.</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>;
  }

  return (
    <div className="w-full max-w-7xl fade-in">
      <h2 className="text-3xl font-bold mb-6">For You</h2>
      <RecommendationGrid recommendations={recommendations} onSelect={onSelectMedia} />
    </div>
  );
};
