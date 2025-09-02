
import React from 'react';
import { PersonCard } from './PersonCard.tsx';
import type { Person } from '../types.ts';

interface PersonGridProps {
  people: Person[];
  onSelect: (person: Person) => void;
}

export const PersonGrid: React.FC<PersonGridProps> = ({ people, onSelect }) => {
  if (people.length === 0) {
    return <p className="text-gray-400">No talent hubs found.</p>;
  }

  return (
    <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 fade-in">
      {people.map((person, index) => (
        <div 
          key={person.id} 
          className="fade-in" 
          style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
        >
          <PersonCard person={person} onSelect={() => onSelect(person)} />
        </div>
      ))}
    </div>
  );
};
