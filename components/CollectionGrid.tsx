import React from 'react';
import { CollectionCard } from './CollectionCard.tsx';
import type { Collection } from '../types.ts';

interface CollectionGridProps {
  collections: Collection[];
  onSelect: (collection: Collection) => void;
}

export const CollectionGrid: React.FC<CollectionGridProps> = ({ collections, onSelect }) => {
  if (collections.length === 0) {
    return <p className="text-gray-400">No collections found.</p>;
  }

  return (
    <div className="w-full max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {collections.map((collection, index) => (
        <div 
          key={collection.id} 
          className="fade-in" 
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CollectionCard collection={collection} onSelect={() => onSelect(collection)} />
        </div>
      ))}
    </div>
  );
};