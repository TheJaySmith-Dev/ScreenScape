import React, { useState, useEffect, useCallback } from 'react';
import { usePreferences } from '../hooks/usePreferences.ts';
// FIX: The function getAiCuratedRecommendations does not exist. Switched to getTmdbCuratedRecommendations from mediaService.
import { getTmdbCuratedRecommendations } from '../services/mediaService.ts';
import type { MediaDetails, AiCuratedCarousel } from '../types.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { MediaRow } from './MediaRow.tsx';
import { useSettings } from '../hooks/useSettings.ts';
import { ThumbsUpIcon } from './icons.tsx';
import { RateLimitMessage } from './RateLimitMessage.tsx';

interface ForYouPageProps {
  onSelectMedia: (media: MediaDetails) => void;
}

// Minimum likes needed to trigger curation
const MIN_LIKES = 3;

export const ForYouPage: React.FC<ForYouPageProps> = ({ onSelectMedia }) => {
  const { likes } = usePreferences();
  const { aiClient, canMakeRequest, incrementRequestCount } = useSettings();
  const [curatedRows, setCuratedRows] = useState<AiCuratedCarousel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  const fetchForYouRecommendations = useCallback(async () => {
    if (likes.length < MIN_LIKES) {
      setCuratedRows([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setLoadingMessage('Curating recommendations...');
    
    try {
      const results = await getTmdbCuratedRecommendations(likes);
      
      if (results.length === 0) {
        setError("Couldn't generate recommendations based on your likes. Try liking a few more diverse titles!");
      } else {
        setCuratedRows(results);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(errorMessage);
      setError("An error occurred while curating your recommendations. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [likes]);

  useEffect(() => {
    fetchForYouRecommendations();
  }, [fetchForYouRecommendations]);

  // Render logic for different states
  if (likes.length < MIN_LIKES) {
    return (
      <div className="text-center text-gray-300 fade-in glass-panel p-8">
        <ThumbsUpIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4 text-white">Unlock Your 'For You' Page</h2>
        <p>Like at least <span className="font-bold text-white">{MIN_LIKES}</span> movies or shows to get personalized recommendations.</p>
        <p className="text-sm mt-2">You've liked <span className="font-bold text-white">{likes.length}</span> so far. Keep going!</p>
      </div>
    );
  }

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh]">
            <LoadingSpinner className="w-12 h-12"/>
            <p className="mt-4 text-lg text-gray-300">{loadingMessage}</p>
        </div>
    );
  }

  if (error) {
    return <div className="text-red-400 bg-red-500/20 p-4 rounded-lg">{error}</div>;
  }

  return (
    <div className="w-full max-w-7xl fade-in space-y-12">
      <h2 className="text-3xl font-bold text-white">For You</h2>
      {curatedRows.map((row, index) => (
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
