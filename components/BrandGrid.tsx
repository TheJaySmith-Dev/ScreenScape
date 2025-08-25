import React from 'react';
import { BrandCard } from './BrandCard.tsx';
import type { Brand } from '../types.ts';

interface BrandGridProps {
  brands: Brand[];
  onSelect: (brand: Brand) => void;
}

export const BrandGrid: React.FC<BrandGridProps> = ({ brands, onSelect }) => {
  if (brands.length === 0) {
    return <p className="text-gray-400">No brands found.</p>;
  }

  return (
    <div className="w-full max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 fade-in">
      {brands.map((brand, index) => (
        <div 
          key={brand.id} 
          className="fade-in" 
          style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
        >
          <BrandCard brand={brand} onSelect={() => onSelect(brand)} />
        </div>
      ))}
    </div>
  );
};
