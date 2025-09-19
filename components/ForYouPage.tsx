import React, { useState, useEffect, useCallback } from 'react';
import { usePreferences } from '../hooks/usePreferences.ts';
import { getSimilarContentRecommendations } from '../services/recommendationService.ts';
import type { MediaDetails, AiCuratedCarousel } from '../types.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { MediaRow } from './MediaRow.tsx';
import { ThumbsUpIcon } from './icons.tsx';

interface ForYouPageProps {
  onSelectMedia: (media: MediaDetails) => void;
}

const MIN_LIKES_FOR_RECOMMENDATIONS = 3;

export const ForYouPage: React.FC<ForYouPageProps> = ({ onSelectMedia }) => {
  const { likes } = usePreferences();
  const [genreRows, setGenreRows] = useState<AiCuratedCarousel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (likes.length < MIN_LIKES_FOR_RECOMMENDATIONS) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch genre-based recommendations
      const genreResults = await getSimilarContentRecommendations(likes);
      setGenreRows(genreResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(errorMessage);
      setError("An error occurred while fetching your recommendations. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [likes]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh]">
            <LoadingSpinner className="w-12 h-12"/>
            <p className="mt-4 text-lg text-gray-300">Analyzing your tastes...</p>
        </div>
    );
  }

  if (likes.length < MIN_LIKES_FOR_RECOMMENDations) {
    return (
      <div className="text-center text-gray-300 fade-in glass-panel p-8">
        <ThumbsUpIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4 text-white">Unlock Your 'For You' Page</h2>
        <p>Like at least <span className="font-bold text-white">{MIN_LIKES_FOR_RECOMMENDATIONS}</span> movies or shows to get personalized recommendations.</p>
        <p className="text-sm mt-2">You've liked <span className="font-bold text-white">{likes.length}</span> so far. Keep going!</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 bg-red-500/20 p-4 rounded-lg">{error}</div>;
  }

  if (genreRows.length === 0) {
      return (
           <div className="text-center text-gray-300 fade-in glass-panel p-8">
                <h2 className="text-2xl font-bold mb-4 text-white">Could Not Find Recommendations</h2>
                <p>We couldn't find any recommendations based on your current likes. Try liking a few more diverse titles!</p>
            </div>
      )
  }

  return (
    <div className="w-full max-w-7xl fade-in space-y-12">
      <h2 className="text-3xl font-bold text-white">For You</h2>

      {genreRows.map((row, index) => (
        <MediaRow 
            key={row.title}
            title={row.title}
            items={row.items}
            onSelect={onSelectMedia}
            animationDelay={`${index * 150}ms`}
        />
      ))}
    </div>
  );
};