

import React from 'react';
import { RecommendationCard } from './RecommendationCard.tsx';
import type { MediaDetails } from '../types.ts';

interface MediaRowProps {
  title: string;
  items: MediaDetails[];
  onSelect: (media: MediaDetails) => void;
  // FIX: Added onPlayTrailer prop to be passed to RecommendationCard.
  onPlayTrailer: (media: MediaDetails) => void;
  animationDelay?: string;
}

export const MediaRow: React.FC<MediaRowProps> = ({ title, items, onSelect, onPlayTrailer, animationDelay = '0ms' }) => {
  if (items.length === 0) return null;

  return (
    <section 
      className="w-full fade-in" 
      style={{ opacity: 0, animationDelay }}
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-4 ml-4 md:ml-0">{title}</h2>
      <div className="media-row flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {items.map((item, index) => (
          <div 
            key={`${item.id}-${index}`} 
            className="flex-shrink-0 w-40 sm:w-44 md:w-48"
          >
            <RecommendationCard media={item} onSelect={() => onSelect(item)} onPlayTrailer={() => onPlayTrailer(item)} />
          </div>
        ))}
         <div className="flex-shrink-0 w-1"></div>
      </div>
    </section>
  );
};