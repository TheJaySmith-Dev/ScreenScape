
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
      className="group cursor-pointer rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:bg-black/50 transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="aspect-[2/3] w-full">
        <img
          src={media.posterUrl}
          alt={media.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <h3 className="text-white font-semibold truncate group-hover:text-blue-300 transition-colors duration-300">
          {media.title}
        </h3>
        <p className="text-gray-400 text-sm">{media.releaseYear}</p>
      </div>
    </div>
  );
};