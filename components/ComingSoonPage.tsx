import React from 'react';
import type { MediaDetails } from '../types.ts';
import { ComingSoonCard } from './ComingSoonCard.tsx';

interface ComingSoonPageProps {
  media: MediaDetails[];
  onSelectMedia: (media: MediaDetails) => void;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ media, onSelectMedia }) => {
  if (media.length === 0) {
    return (
        <div className="text-center text-gray-600 fade-in">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Coming Soon</h2>
            <p>Could not find any upcoming movies or TV shows at this time.</p>
        </div>
    );
  }

  return (
    <div className="w-full max-w-7xl fade-in">
      <h2 className="text-3xl font-bold mb-6">Coming Soon</h2>
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {media.map((item, index) => (
          <div 
            key={item.id} 
            className="fade-in" 
            style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
          >
            <ComingSoonCard media={item} onSelect={onSelectMedia} />
          </div>
        ))}
      </div>
    </div>
  );
};