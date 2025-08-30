
import React from 'react';
import type { Network } from '../types.ts';

interface NetworkCardProps {
  network: Network;
  onSelect: () => void;
}

const defaultHoverGifUrl = "https://media.giphy.com/media/TspR2cHt04uDMt0GrQ/giphy.gif";
const defaultBgColor = '#111111';

export const NetworkCard: React.FC<NetworkCardProps> = ({ network, onSelect }) => {
  const bgColor = network.bgColor || defaultBgColor;
  const hoverGif = network.hoverGifUrl || defaultHoverGifUrl;
  const imageStyle = network.forceWhiteLogo ? { filter: 'brightness(0) invert(1)' } : {};

  return (
    <div
      onClick={onSelect}
      className="relative group cursor-pointer aspect-video rounded-xl overflow-hidden backdrop-blur-sm border-2 border-white/10 hover:border-white/30 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
      style={{ backgroundColor: bgColor }}
    >
      {/* Background GIF for hover effect */}
      <div
        style={{ backgroundImage: `url(${hoverGif})` }}
        className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        aria-hidden="true"
      />
      {/* Studio Logo, positioned above the GIF */}
      <img
        src={network.logoUrl}
        alt={`${network.name} logo`}
        className="relative w-full h-full object-contain p-4 sm:p-6 drop-shadow-[0_5px_5px_rgba(0,0,0,0.7)] transition-opacity duration-500 group-hover:opacity-0"
        style={imageStyle}
        loading="lazy"
      />
    </div>
  );
};
