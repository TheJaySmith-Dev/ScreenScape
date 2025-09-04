
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
      <div className="ml-4 md:ml-0 mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white inline-block">{title}</h2>
        <div className="h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent w-1/3 mt-1"></div>
      </div>
      <div className="media-row -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex space-x-4">
            {items.map((item, index) => (
              <div 
                key={`${item.id}-${index}`} 
                className="flex-shrink-0 w-40 sm:w-44 md:w-48"
              >
                <RecommendationCard media={item} onSelect={() => onSelect(item)} />
              </div>
            ))}
             <div className="flex-shrink-0 w-1"></div>
          </div>
      </div>
    </section>
  );
};