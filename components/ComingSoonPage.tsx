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
        <div className="text-center text-white/80 fade-in">
            <h2 className="text-2xl font-bold mb-4 text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>Coming Soon</h2>
            <p>Could not find any upcoming movies or TV shows at this time.</p>
        </div>
    );
  }

  return (
    <div className="w-full max-w-7xl fade-in">
      <h2 className="text-2xl font-bold mb-6 text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>Coming Soon</h2>
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {media.map((item, index) => (
          <div 
            key={item.id} 
            className="fade-in" 
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ComingSoonCard media={item} onSelect={onSelectMedia} />
          </div>
        ))}
      </div>
    </div>
  );
};