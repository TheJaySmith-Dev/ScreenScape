
import React from 'react';
import type { Collection } from '../types';

interface CollectionCardProps {
  collection: Collection;
  onSelect: () => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:bg-black/50 transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="aspect-[2/3] w-full">
        <img
          src={collection.posterUrl}
          alt={collection.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="text-white font-semibold truncate group-hover:text-blue-300 transition-colors duration-300">
          {collection.name}
        </h3>
      </div>
    </div>
  );
};
