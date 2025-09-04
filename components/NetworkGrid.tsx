import React from 'react';
import { NetworkCard } from './NetworkCard.tsx';
import type { Network } from '../types.ts';

interface NetworkGridProps {
  networks: Network[];
  onSelect: (network: Network) => void;
}

export const NetworkGrid: React.FC<NetworkGridProps> = ({ networks, onSelect }) => {
  if (networks.length === 0) {
    return <p className="text-gray-400">No networks found.</p>;
  }

  return (
    <div className="w-full max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 fade-in">
      {networks.map((network, index) => (
        <div 
          key={network.id} 
          className="fade-in" 
          style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
        >
          <NetworkCard network={network} onSelect={() => onSelect(network)} />
        </div>
      ))}
    </div>
  );
};
