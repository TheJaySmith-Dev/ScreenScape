
import React from 'react';
import type { MediaDetails } from '../types.ts';

interface RecommendationCardProps {
  media: MediaDetails;
  onSelect: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ media, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="group relative cursor-pointer rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:bg-black/50 transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="aspect-[2/3] w-full">
        <img
          src={media.posterUrl}
          alt={media.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      {/* Hover overlay for title and year */}
      <div className="absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <h3 className="text-white font-semibold truncate">
          {media.title}
        </h3>
        <p className="text-gray-400 text-sm">{media.releaseYear}</p>
      </div>
    </div>
  );
};
