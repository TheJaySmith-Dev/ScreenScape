
import React from 'react';
import type { MediaDetails } from '../types.ts';

interface RecommendationCardProps {
  media: MediaDetails;
  onSelect: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ media, onSelect }) => {
  const hasPoster = media.posterUrl && !media.posterUrl.includes('picsum.photos');

  // If there's no poster, render a text-based card as a fallback.
  if (!hasPoster) {
    return (
      <div
        onClick={onSelect}
        className="group cursor-pointer rounded-xl overflow-hidden bg-gray-800 border-2 border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 aspect-[2/3] flex flex-col justify-center items-center text-center p-4"
        style={{
          background: 'linear-gradient(to bottom, hsl(220, 13%, 25%), hsl(220, 14%, 18%))'
        }}
      >
        <h3 className="text-white text-lg font-bold leading-tight drop-shadow-lg">
          {media.title}
        </h3>
        <p className="text-gray-400 text-sm mt-2">{media.releaseYear}</p>
      </div>
    );
  }

  // Render the poster-based card
  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer rounded-xl overflow-hidden bg-gray-900 border-2 border-transparent hover:border-blue-500/80 focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 aspect-[2/3] relative flex flex-col justify-end text-white shadow-lg"
      tabIndex={0}
      role="button"
      aria-label={`View details for ${media.title}`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    >
      <img 
        src={media.posterUrl} 
        alt={`Poster for ${media.title}`} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      <div className="relative p-3 z-10">
        <h3 className="font-bold text-sm leading-tight drop-shadow-lg truncate">
          {media.title}
        </h3>
        <p className="text-xs text-gray-300">{media.releaseYear}</p>
      </div>
    </div>
  );
};
