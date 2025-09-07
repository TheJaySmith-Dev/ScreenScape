
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
      {/* Title is a distinct block, ensuring it's always visible */}
      <div className="mb-4 sm:mb-6 px-4 sm:px-6 lg:px-8">
        <h2 className="font-bold text-white">{title}</h2>
        <div className="h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent w-1/3 mt-1"></div>
      </div>
      
      {/* This container will handle the horizontal scrolling */}
      <div className="overflow-x-auto media-row pb-4">
        {/* The inner flex container holds the cards with appropriate padding */}
        <div className="flex space-x-4 sm:space-x-6 px-4 sm:px-6 lg:px-8">
          {items.map((item, index) => (
            <div 
              key={`${item.id}-${index}`} 
              className="flex-shrink-0 w-36 sm:w-44 md:w-48"
            >
              <RecommendationCard media={item} onSelect={() => onSelect(item)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
      