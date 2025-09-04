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
        className="group cursor-pointer rounded-2xl overflow-hidden glass-panel hover:border-white/50 transition-all duration-300 transform hover:scale-105 aspect-[2/3] flex flex-col justify-center items-center text-center p-4"
      >
        <h3 className="text-gray-800 text-lg font-bold leading-tight">
          {media.title}
        </h3>
        <p className="text-gray-600 text-sm mt-2">{media.releaseYear}</p>
      </div>
    );
  }

  // Render the poster-based card
  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer rounded-2xl overflow-hidden glass-panel transition-all duration-300 transform hover:scale-105 hover:shadow-2xl aspect-[2/3] relative flex flex-col justify-end text-white"
      tabIndex={0}
      role="button"
      aria-label={`View details for ${media.title}`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    >
      <img 
        src={media.posterUrl} 
        alt={`Poster for ${media.title}`} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-300" />
      <div className="relative p-3 z-10">
        <h3 className="font-semibold text-sm leading-tight drop-shadow-lg truncate">
          {media.title}
        </h3>
        <p className="text-xs text-gray-300">{media.releaseYear}</p>
      </div>
    </div>
  );
};
