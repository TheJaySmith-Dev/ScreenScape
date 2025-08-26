
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
      className="group relative cursor-pointer rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:bg-black/50 transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="aspect-[2/3] w-full">
        <img
          src={collection.posterUrl}
          alt={collection.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      <div className="absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <h3 className="text-white font-semibold truncate">
          {collection.name}
        </h3>
      </div>
    </div>
  );
};
