
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
        className="group cursor-pointer rounded-3xl overflow-hidden glass-panel hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105 aspect-[2/3] flex flex-col justify-center items-center text-center p-4"
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
      className="group cursor-pointer rounded-3xl overflow-hidden glass-panel transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_25px_rgba(150,200,255,0.25)] aspect-[2/3] relative flex flex-col justify-end text-white"
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="shimmer-effect absolute inset-0" />
      <div className="relative p-4 z-10">
        <h3 className="font-semibold text-base leading-tight drop-shadow-lg truncate">
          {media.title}
        </h3>
        <p className="text-sm text-gray-300">{media.releaseYear}</p>
      </div>
    </div>
  );
};