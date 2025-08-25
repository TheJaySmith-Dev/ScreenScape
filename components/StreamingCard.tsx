import React from 'react';
import type { StreamingProviderInfo } from '../types.ts';

interface StreamingCardProps {
  provider: StreamingProviderInfo;
  onSelect: () => void;
}

export const StreamingCard: React.FC<StreamingCardProps> = ({ provider, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="relative group cursor-pointer aspect-video rounded-xl overflow-hidden backdrop-blur-sm border-2 border-white/10 hover:border-white/30 transition-all duration-300 transform hover:scale-105 flex items-center justify-center p-4"
      style={{ backgroundColor: provider.bgColor || '#111111' }}
    >
      <img
        src={provider.logoUrl}
        alt={`${provider.name} logo`}
        className="relative max-w-[70%] max-h-[50%] object-contain drop-shadow-[0_5px_5px_rgba(0,0,0,0.7)]"
        loading="lazy"
      />
    </div>
  );
};
