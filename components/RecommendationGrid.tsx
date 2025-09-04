import React from 'react';
import { RecommendationCard } from './RecommendationCard.tsx';
import type { MediaDetails } from '../types.ts';

interface RecommendationGridProps {
  recommendations: MediaDetails[];
  onSelect: (media: MediaDetails) => void;
}

export const RecommendationGrid: React.FC<RecommendationGridProps> = ({ recommendations, onSelect }) => {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {recommendations.map((media, index) => (
        <div 
          key={media.id} 
          className="fade-in" 
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <RecommendationCard media={media} onSelect={() => onSelect(media)} />
        </div>
      ))}
    </div>
  );
};