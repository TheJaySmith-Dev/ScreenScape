
import React from 'react';
import type { MediaDetails } from '../types.ts';
import { PlaySolidIcon, InfoIcon } from './icons.tsx';

interface HeroSectionProps {
  item: MediaDetails;
  onMoreInfo: (item: MediaDetails) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ item, onMoreInfo }) => {
  const truncatedOverview = item.overview.length > 200 
    ? item.overview.substring(0, 200).split(' ').slice(0, -1).join(' ') + '...' 
    : item.overview;

  return (
    <section className="hero-section sm:-mb-20 md:-mb-28">
      <img src={item.backdropUrl} alt="" className="hero-backdrop hero-backdrop-animated" />
      <div className="hero-gradient" />
      <div className="hero-content container mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
        <div className="max-w-md lg:max-w-lg">
            <h1 className="text-4xl sm:text-5xl font-bold drop-shadow-xl mb-4 fade-in" style={{ animationDelay: '200ms' }}>
                {item.title}
            </h1>
            <p className="text-sm md:text-base text-gray-200 leading-relaxed drop-shadow-lg mb-6 fade-in" style={{ animationDelay: '400ms' }}>
                {truncatedOverview}
            </p>
            <div className="flex items-center gap-3 sm:gap-4 fade-in" style={{ animationDelay: '600ms' }}>
                <button
                    onClick={() => onMoreInfo(item)}
                    className="glass-button primary text-sm sm:text-base"
                >
                    <PlaySolidIcon className="w-5 h-5" />
                    <span>Play</span>
                </button>
                <button
                    onClick={() => onMoreInfo(item)}
                    className="glass-button text-sm sm:text-base"
                >
                    <InfoIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>More Info</span>
                </button>
            </div>
        </div>
      </div>
    </section>
  );
};