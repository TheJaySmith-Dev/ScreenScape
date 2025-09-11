


import React from 'react';
import type { Brand } from '../types.ts';
import { SparklesIcon } from './icons.tsx';

interface BrandCardProps {
  brand: Brand;
  onSelect: () => void;
  onAiInfoClick: () => void;
}

export const BrandCard: React.FC<BrandCardProps> = ({ brand, onSelect, onAiInfoClick }) => {
  // New style for brands with logos, backgrounds, and hover effects (like DC)
  if (brand.logoUrl) {
    const defaultHoverGifUrl = "https://media.giphy.com/media/TspR2cHt04uDMt0GrQ/giphy.gif";
    const defaultBgColor = '#111111';
    
    const bgColor = brand.bgColor || defaultBgColor;
    const hoverGif = brand.hoverGifUrl === '' ? undefined : (brand.hoverGifUrl || defaultHoverGifUrl);

    const cardStyle = { 
      backgroundColor: bgColor,
      ...(brand.borderColor && { borderColor: brand.borderColor })
    };

    const cardClassName = `relative group cursor-pointer aspect-video rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-300 transform md:hover:scale-105 flex items-center justify-center border-2 ${
      brand.borderColor ? 'md:hover:border-opacity-80' : 'border-white/10 md:hover:border-white/30'
    }`;

    return (
      <div
        onClick={onSelect}
        className={cardClassName}
        style={cardStyle}
        role="button"
        tabIndex={0}
        aria-label={`View the ${brand.name} brand hub`}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      >
        <button
            onClick={(e) => {
                e.stopPropagation();
                onAiInfoClick();
            }}
            className="absolute top-3 right-3 z-10 p-2 glass-button !rounded-full opacity-70 md:group-hover:opacity-100 transition-opacity"
            aria-label={`Get AI insights for ${brand.name}`}
            title={`Get AI insights for ${brand.name}`}
        >
            <SparklesIcon className="w-5 h-5" />
        </button>
        {hoverGif && (
          <div
            style={{ backgroundImage: `url(${hoverGif})` }}
            className="absolute inset-0 bg-cover bg-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-500"
            aria-hidden="true"
          />
        )}
        <img
          src={brand.logoUrl}
          alt={`${brand.name} logo`}
          className="relative w-full h-full object-contain p-4 sm:p-6 drop-shadow-[0_5px_5px_rgba(0,0,0,0.7)] transition-opacity duration-500 md:group-hover:opacity-0"
          loading="lazy"
        />
      </div>
    );
  }

  // Original poster-based card with liquid glass effect for other brands
  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer rounded-xl overflow-hidden bg-black/20 backdrop-blur-md border border-white/10 md:hover:border-white/20 focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-300 transform md:hover:-translate-y-1 aspect-video relative shadow-lg"
      tabIndex={0}
      role="button"
      aria-label={`View details for ${brand.name}`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    >
      <button
            onClick={(e) => {
                e.stopPropagation();
                onAiInfoClick();
            }}
            className="absolute top-3 right-3 z-20 p-2 glass-button !rounded-full opacity-70 md:group-hover:opacity-100 transition-opacity"
            aria-label={`Get AI insights for ${brand.name}`}
            title={`Get AI insights for ${brand.name}`}
        >
            <SparklesIcon className="w-5 h-5" />
        </button>
      <img 
        src={brand.posterUrl} 
        alt={`Poster for ${brand.name}`} 
        className="absolute inset-0 w-full h-full object-cover transition-all duration-300 md:group-hover:scale-105 opacity-80 md:group-hover:opacity-100"
        loading="lazy"
      />
    </div>
  );
};
