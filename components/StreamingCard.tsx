
import React from 'react';
import type { StreamingProviderInfo } from '../types.ts';

interface StreamingCardProps {
  provider: StreamingProviderInfo;
  onSelect: () => void;
}

const defaultHoverGifUrl = "https://media.giphy.com/media/TspR2cHt04uDMt0GrQ/giphy.gif";
const defaultBgColor = '#111111';

export const StreamingCard: React.FC<StreamingCardProps> = ({ provider, onSelect }) => {
  const bgColor = provider.bgColor || defaultBgColor;
  const hoverGif = provider.hoverGifUrl || defaultHoverGifUrl;

  const cardStyle = { 
    backgroundColor: bgColor,
    ...(provider.borderColor && { borderColor: provider.borderColor })
  };

  const cardClassName = `relative group cursor-pointer aspect-video rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-300 transform hover:scale-105 flex items-center justify-center border-2 ${
    provider.borderColor ? 'hover:border-opacity-80' : 'border-white/10 hover:border-white/30'
  }`;

  const imageClassName = `relative w-full h-full ${
    provider.edgeToEdge 
      ? 'object-cover' 
      : 'object-contain p-4 sm:p-6'
  } drop-shadow-[0_5px_5px_rgba(0,0,0,0.7)] transition-opacity duration-500 group-hover:opacity-0`;

  return (
    <div
      onClick={onSelect}
      className={cardClassName}
      style={cardStyle}
    >
      {/* Background GIF for hover effect */}
      <div
        style={{ backgroundImage: `url(${hoverGif})` }}
        className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        aria-hidden="true"
      />
      {/* Provider Logo, positioned above the GIF */}
      <img
        src={provider.logoUrl}
        alt={`${provider.name} logo`}
        className={imageClassName}
        loading="lazy"
      />
    </div>
  );
};