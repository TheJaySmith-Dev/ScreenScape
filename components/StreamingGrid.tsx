import React from 'react';
import { StreamingCard } from './StreamingCard.tsx';
import type { StreamingProviderInfo } from '../types.ts';

interface StreamingGridProps {
  providers: StreamingProviderInfo[];
  onSelect: (provider: StreamingProviderInfo) => void;
}

export const StreamingGrid: React.FC<StreamingGridProps> = ({ providers, onSelect }) => {
  if (providers.length === 0) {
    return <p className="text-gray-400 text-center">No major streaming services found for your region.</p>;
  }

  return (
    <div className="w-full max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 fade-in">
      {providers.map((provider, index) => (
        <div 
          key={provider.id} 
          className="fade-in" 
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <StreamingCard provider={provider} onSelect={() => onSelect(provider)} />
        </div>
      ))}
    </div>
  );
};