import React from 'react';
import type { Studio } from '../types.ts';

interface StudioCardProps {
  studio: Studio;
  onSelect: () => void;
}

const defaultHoverGifUrl = "https://media.giphy.com/media/TspR2cHt04uDMt0GrQ/giphy.gif";
const defaultBgColor = '#111111';

export const StudioCard: React.FC<StudioCardProps> = ({ studio, onSelect }) => {
  const bgColor = studio.bgColor || defaultBgColor;
  const hoverGif = studio.hoverGifUrl || defaultHoverGifUrl;
  const imageStyle = studio.forceWhiteLogo ? { filter: 'brightness(0) invert(1)' } : {};
  
  const defaultSizeClass = "max-w-[60%] max-h-[40%]";
  const sizeClass = studio.sizeClass || defaultSizeClass;

  return (
    <div
      onClick={onSelect}
      className="relative group cursor-pointer aspect-video rounded-xl overflow-hidden backdrop-blur-sm border-2 border-white/10 hover:border-white/30 transition-all duration-300 transform hover:scale-105 flex items-center justify-center p-4"
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
        src={studio.logoUrl}
        alt={`${studio.name} logo`}
        className={`relative ${sizeClass} object-contain drop-shadow-[0_5px_5px_rgba(0,0,0,0.7)] transition-opacity duration-500 group-hover:opacity-0`}
        style={imageStyle}
        loading="lazy"
      />
    </div>
  );
};