

import React from 'react';
import type { MediaDetails } from '../types.ts';
import { PlayIcon } from './icons.tsx';

interface RecommendationCardProps {
  media: MediaDetails;
  onSelect: () => void;
  onPlayTrailer: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ media, onSelect, onPlayTrailer }) => {
  const hasPoster = media.posterUrl && !media.posterUrl.includes('picsum.photos');
  const hasBackdrop = media.backdropUrl && !media.backdropUrl.includes('picsum.photos');

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
      className="group cursor-pointer rounded-xl bg-gray-900 border-2 border-transparent hover:border-white/40 focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-300 ease-in-out absolute inset-0 text-white shadow-lg hover:scale-125 hover:z-20 hover:aspect-video"
      tabIndex={0}
      role="button"
      aria-label={`View details for ${media.title}`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    >
      <img 
        src={media.posterUrl} 
        alt={`Poster for ${media.title}`} 
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
        loading="lazy"
      />
      {hasBackdrop && (
        <img 
          src={media.backdropUrl} 
          alt={`Backdrop for ${media.title}`} 
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity group-hover:opacity-0" />
      <div className="relative p-3 z-10 transition-opacity group-hover:opacity-0">
        <h3 className="font-bold text-sm leading-tight drop-shadow-lg truncate">
          {media.title}
        </h3>
        <p className="text-xs text-gray-300">{media.releaseYear}</p>
      </div>
      
      {/* Hover overlay */}
      <div 
        className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
      >
        <h3 className="text-base font-bold text-center mb-3 drop-shadow-lg">{media.title}</h3>
        <div className="flex flex-col gap-2 w-[80%]">
            <button
                onClick={(e) => { e.stopPropagation(); onPlayTrailer(); }}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-white text-black rounded-md text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
                <PlayIcon className="w-5 h-5" />
                <span>Trailer</span>
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                className="w-full px-3 py-2 bg-white/20 text-white rounded-md text-sm font-semibold hover:bg-white/30 transition-colors"
            >
                More Info
            </button>
        </div>
      </div>
    </div>
  );
};