import React from 'react';
import type { Award } from '../services/awardService';

interface AwardCardProps {
  award: Award;
  onSelect: () => void;
}

export const AwardCard: React.FC<AwardCardProps> = ({ award, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="relative group cursor-pointer aspect-video rounded-xl overflow-hidden backdrop-blur-sm border-2 border-white/10 hover:border-white/30 transition-all duration-300 transform hover:scale-105 flex items-center justify-center bg-gray-800"
    >
      <img
        src={award.logoUrl}
        alt={`${award.name} logo`}
        className="relative w-full h-full object-contain p-4 sm:p-6 drop-shadow-[0_5px_5px_rgba(0,0,0,0.7)]"
        loading="lazy"
      />
    </div>
  );
};
