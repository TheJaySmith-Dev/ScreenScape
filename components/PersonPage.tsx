import React from 'react';
import type { Person, MediaDetails } from '../types.ts';
import { RecommendationGrid } from './RecommendationGrid.tsx';

interface PersonPageProps {
  person: Person;
  media: MediaDetails[];
  onBack: () => void;
  onSelectMedia: (media: MediaDetails) => void;
  onSelectActor: (actorId: number) => void;
}

export const PersonPage: React.FC<PersonPageProps> = ({
  person,
  media,
  onBack,
  onSelectMedia,
  onSelectActor,
}) => {
  const roleTitle = person.role === 'director' ? 'Acclaimed Director' : 'Iconic Actor';

  return (
    <div className="w-full max-w-7xl fade-in">
      {/* Hero section for the person */}
      <div className="relative mb-8 rounded-2xl overflow-hidden min-h-[300px] flex items-end p-8 glass-panel">
        <img 
          src={person.posterUrl} 
          alt={`Image of ${person.name}`}
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">{person.name}</h1>
          <p className="text-lg text-gray-300">{roleTitle}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="px-4 py-2 text-sm text-gray-200 glass-panel rounded-full hover:bg-white/5 transition-colors">&larr; Back to Talent</button>
        {person.role === 'actor' && (
          <button 
            onClick={() => onSelectActor(person.tmdbId)} 
            className="px-4 py-2 text-sm font-semibold bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
          >
            View Full Biography
          </button>
        )}
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Notable Works</h2>
      <RecommendationGrid recommendations={media} onSelect={onSelectMedia} />
    </div>
  );
};
