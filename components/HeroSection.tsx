import React from 'react';
import type { MediaDetails } from '../types.ts';
import { PlaySolidIcon, InfoIcon } from './icons.tsx';

interface HeroSectionProps {
  item: MediaDetails;
  onPlay: (item: MediaDetails) => void;
  onMoreInfo: (item: MediaDetails) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ item, onPlay, onMoreInfo }) => {
  const truncatedOverview = item.overview.length > 200 
    ? item.overview.substring(0, 200).split(' ').slice(0, -1).join(' ') + '...' 
    : item.overview;

  return (
    <section className="hero-section -mb-24 md:-mb-36">
      <img src={item.backdropUrl} alt="" className="hero-backdrop" />
      <div className="hero-gradient" />
      <div className="hero-content container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-md lg:max-w-lg">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold drop-shadow-xl mb-4 fade-in" style={{ animationDelay: '200ms' }}>
                {item.title}
            </h1>
            <p className="text-base md:text-lg text-gray-200 leading-relaxed drop-shadow-lg mb-6 fade-in" style={{ animationDelay: '400ms' }}>
                {truncatedOverview}
            </p>
            <div className="flex items-center gap-4 fade-in" style={{ animationDelay: '600ms' }}>
                <button
                    onClick={() => onPlay(item)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-semibold transition-transform hover:scale-105"
                >
                    <PlaySolidIcon className="w-5 h-5" />
                    <span>Play</span>
                </button>
                <button
                    onClick={() => onMoreInfo(item)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white/20 text-white rounded-lg font-semibold backdrop-blur-sm hover:bg-white/30 transition-all hover:scale-105"
                >
                    <InfoIcon className="w-6 h-6" />
                    <span>More Info</span>
                </button>
            </div>
        </div>
      </div>
    </section>
  );
};
