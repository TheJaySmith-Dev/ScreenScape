import React, { useState, useEffect } from 'react';
import { RecommendationGrid } from './RecommendationGrid';
import { LoadingSpinner } from './LoadingSpinner';
import * as awardService from '../services/awardService';
import type { MediaDetails } from '../types';

interface AwardPageProps {
  awardId: number;
  onSelectMedia: (media: MediaDetails) => void;
}

export const AwardPage: React.FC<AwardPageProps> = ({ awardId, onSelectMedia }) => {
  const [movies, setMovies] = useState<MediaDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const results = await awardService.getMoviesByKeyword(awardId);
        setMovies(results);
      } catch (err) {
        setError('Failed to fetch movies for this award.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [awardId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
  }

  if (error) {
    return <p className="text-red-400 text-center">{error}</p>;
  }

  return <RecommendationGrid recommendations={movies} onSelect={onSelectMedia} />;
};
