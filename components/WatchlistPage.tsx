import React from 'react';
import { usePreferences } from '../hooks/usePreferences.ts';
import type { MediaDetails } from '../types.ts';
import { RecommendationGrid } from './RecommendationGrid.tsx';
import { ThumbsUpIcon } from './icons.tsx';

interface WatchlistPageProps {
  onSelectMedia: (media: MediaDetails) => void;
}

export const WatchlistPage: React.FC<WatchlistPageProps> = ({ onSelectMedia }) => {
  const { likes } = usePreferences();

  // Convert LikedItem[] to MediaDetails[] for RecommendationGrid
  const watchlistItems: MediaDetails[] = likes.map(item => ({
    ...item,
    overview: '', // Not needed for grid view
    backdropUrl: '', // Not needed for grid view
    rating: 0, // Not needed for grid view
    trailerUrl: null, // Not needed for grid view
  }));

  if (likes.length === 0) {
    return (
      <div className="text-center text-gray-400 fade-in">
        <h2 className="text-2xl font-bold mb-4 text-white">My Watchlist</h2>
        <p>Your liked movies and TV shows will appear here.</p>
        <p className="text-sm mt-2 flex items-center justify-center gap-1">
            Use the <ThumbsUpIcon className="w-5 h-5 text-green-400" /> button on any title to add it to your list.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl fade-in">
      <h2 className="text-3xl font-bold mb-6">My Watchlist</h2>
      <RecommendationGrid recommendations={watchlistItems} onSelect={onSelectMedia} />
    </div>
  );
};
