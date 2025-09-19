import React, { useState, useEffect, useCallback } from 'react';
import { usePreferences } from '../hooks/usePreferences.ts';
import { getAiCuratedRecommendations } from '../services/aiService.ts';
import type { MediaDetails, AiCuratedCarousel } from '../types.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { MediaRow } from './MediaRow.tsx';
import { useSettings } from '../hooks/useSettings.ts';
import { ThumbsUpIcon } from './icons.tsx';
import { RateLimitMessage } from './RateLimitMessage.tsx';

interface ForYouPageProps {
  onSelectMedia: (media: MediaDetails) => void;
}

// Minimum likes needed to trigger AI curation
const MIN_LIKES_FOR_AI = 3;

export const ForYouPage: React.FC<ForYouPageProps> = ({ onSelectMedia }) => {
  const { likes } = usePreferences();
  const { aiClient, canMakeRequest, incrementRequestCount } = useSettings();
  const [curatedRows, setCuratedRows] = useState<AiCuratedCarousel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  const fetchForYouRecommendations = useCallback(async () => {
    if (likes.length < MIN_LIKES_FOR_AI || !aiClient) {
      setCuratedRows([]);
      setIsLoading(false);
      return;
    }
    
    const { canRequest } = canMakeRequest();
    if (!canRequest) {
      // The rate limit message will be shown in the render logic
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingMessage('Analyzing your tastes...');
    
    try {
      const results = await getAiCuratedRecommendations(likes, aiClient);
      incrementRequestCount();
      
      if (results.length === 0) {
        setError("ScapeAI couldn't generate recommendations based on your likes. Try liking a few more diverse titles!");
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
  }, [likes, aiClient, canMakeRequest, incrementRequestCount]);

  useEffect(() => {
    fetchForYouRecommendations();
  }, [fetchForYouRecommendations]);

  const { canRequest, resetTime } = canMakeRequest();
  
  // Render logic for different states
  if (!canRequest && resetTime) {
      return (
        <div className="flex justify-center items-center h-[50vh]">
            <RateLimitMessage resetTime={resetTime} featureName="For You curations" />
        </div>
      )
  }

  if (likes.length < MIN_LIKES_FOR_AI) {
    return (
      <div className="text-center text-gray-300 fade-in glass-panel p-8">
        <ThumbsUpIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4 text-white">Unlock Your AI-Powered 'For You' Page</h2>
        <p>Like at least <span className="font-bold text-white">{MIN_LIKES_FOR_AI}</span> movies or shows to get personalized recommendations curated by ScapeAI.</p>
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