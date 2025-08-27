
import React from 'react';
import type { Collection } from '../types.ts';

interface CollectionCardProps {
  collection: Collection;
  onSelect: () => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer rounded-xl overflow-hidden bg-gray-800 border-2 border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 aspect-[2/3] flex flex-col justify-center items-center text-center p-4"
      style={{
        background: 'linear-gradient(to bottom, hsl(220, 13%, 25%), hsl(220, 14%, 18%))'
      }}
    >
      <h3 className="text-white text-xl lg:text-2xl font-bold leading-tight drop-shadow-lg">
        {collection.name}
      </h3>
    </div>
  );
};