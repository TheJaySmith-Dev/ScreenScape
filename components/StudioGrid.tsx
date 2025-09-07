
import React from 'react';
import { StudioCard } from './StudioCard.tsx';
import type { Studio } from '../types.ts';

interface StudioGridProps {
  studios: Studio[];
  onSelect: (studio: Studio) => void;
}

export const StudioGrid: React.FC<StudioGridProps> = ({ studios, onSelect }) => {
  if (studios.length === 0) {
    return <p className="text-gray-400">No studios found.</p>;
  }

  return (
    <div className="w-full max-w-7xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 fade-in">
      {studios.map((studio, index) => (
        <div 
          key={studio.id} 
          className="fade-in" 
          style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
        >
          <StudioCard studio={studio} onSelect={() => onSelect(studio)} />
        </div>
      ))}
    </div>
  );
};
      