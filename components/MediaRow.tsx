
import React from 'react';
import { RecommendationCard } from './RecommendationCard.tsx';
import type { MediaDetails } from '../types.ts';

interface MediaRowProps {
  title: string;
  items: MediaDetails[];
  onSelect: (media: MediaDetails) => void;
  animationDelay?: string;
}

export const MediaRow: React.FC<MediaRowProps> = ({ title, items, onSelect, animationDelay = '0ms' }) => {
  if (items.length === 0) return null;

  return (
    <section 
      className="w-full fade-in" 
      style={{ opacity: 0, animationDelay }}
    >
      <h2 className="text-xl md:text-2xl font-bold mb-4 ml-4 md:ml-0 text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>{title}</h2>
      <div className="media-row flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {items.map((item, index) => (
          <div 
            key={`${item.id}-${index}`} 
            className="flex-shrink-0 w-36 sm:w-40 md:w-44"
          >
            <RecommendationCard media={item} onSelect={() => onSelect(item)} />
          </div>
        ))}
         <div className="flex-shrink-0 w-1"></div>
      </div>
    </section>
  );
};
