
import React from 'react';
import type { Person } from '../types.ts';

interface PersonCardProps {
  person: Person;
  onSelect: () => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({ person, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer rounded-xl overflow-hidden bg-black/20 backdrop-blur-md border border-white/10 hover:border-white/20 focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 aspect-video relative shadow-lg"
      tabIndex={0}
      role="button"
      aria-label={`View work by ${person.name}`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    >
      <img 
        src={person.posterUrl} 
        alt={`Image of ${person.name}`} 
        className="absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="relative p-4 flex flex-col justify-end h-full z-10">
        <h3 className="font-bold text-xl drop-shadow-lg">
          {person.name}
        </h3>
        <p className="text-sm text-gray-300 capitalize">{person.role}</p>
      </div>
    </div>
  );
};
