import React from 'react';
import { AwardCard } from './AwardCard.tsx';
import type { Award } from '../services/awardService';

interface AwardsGridProps {
  awards: Award[];
  onSelect: (award: Award) => void;
}

export const AwardsGrid: React.FC<AwardsGridProps> = ({ awards, onSelect }) => {
  if (awards.length === 0) {
    return <p className="text-gray-400">No awards found.</p>;
  }

  return (
    <div className="w-full max-w-7xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 fade-in">
      {awards.map((award, index) => (
        <div
          key={award.id}
          className="fade-in"
          style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
        >
          <AwardCard award={award} onSelect={() => onSelect(award)} />
        </div>
      ))}
    </div>
  );
};
