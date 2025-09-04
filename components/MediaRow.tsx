
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
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white/90 shrink-0" style={{textShadow: '0 2px 5px rgba(0,0,0,0.5)'}}>{title}</h2>
        <div className="w-full h-px bg-white/20"></div>
      </div>
      <div className="media-row flex overflow-x-auto space-x-4 pb-4">
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