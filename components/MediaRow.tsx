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
      style={{ animationDelay }}
    >
      {/* Title section - remains outside the scrollable area, ensuring it's always visible */}
      <div className="mb-3 px-4 sm:px-0">
        <h2 className="text-xl md:text-2xl font-bold text-white/90" style={{textShadow: '0 2px 5px rgba(0,0,0,0.5)'}}>{title}</h2>
        <div className="mt-1 h-0.5 w-20 bg-sky-400/70 rounded-full"></div>
      </div>
      
      {/* Simplified and robust scrolling container */}
      <div className="media-row flex overflow-x-auto space-x-4 px-4 sm:px-0 py-2">
        {items.map((item, index) => (
          <div 
            key={`${item.id}-${index}`} 
            className="flex-shrink-0 w-36 sm:w-40 md:w-44"
          >
            <RecommendationCard media={item} onSelect={() => onSelect(item)} />
          </div>
        ))}
        {/* Sibling div to ensure there's some space at the end of the scroll */}
        <div className="flex-shrink-0 w-1"></div>
      </div>
    </section>
  );
};