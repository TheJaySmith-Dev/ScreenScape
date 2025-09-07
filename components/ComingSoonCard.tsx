import React from 'react';
import type { MediaDetails } from '../types.ts';
import { useCountdown } from '../hooks/useCountdown.ts';

interface ComingSoonCardProps {
  media: MediaDetails;
  onSelect: (media: MediaDetails) => void;
}

const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center leading-none">
        <span className="text-xl font-bold tabular-nums">{String(value).padStart(2, '0')}</span>
        <span className="text-xs uppercase tracking-widest">{label}</span>
    </div>
);

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Dates from TMDb are UTC
    });
};

export const ComingSoonCard: React.FC<ComingSoonCardProps> = ({ media, onSelect }) => {
  const { days, hours, minutes, seconds, isFinished } = useCountdown(media.releaseDate);

  return (
    <div
      onClick={() => onSelect(media)}
      className="group cursor-pointer rounded-xl overflow-hidden bg-gray-900 border-2 border-transparent md:hover:border-white focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-300 aspect-[2/3] relative flex flex-col justify-end text-white shadow-lg"
      tabIndex={0}
      role="button"
      aria-label={`View details for ${media.title}`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(media)}
    >
      <img 
        src={media.posterUrl} 
        alt={`Poster for ${media.title}`} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent" />
      
      {/* Countdown Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center text-white bg-black/50 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
        {isFinished ? (
            <div className="text-2xl font-bold text-green-400">Released!</div>
        ) : (
            <div className="flex justify-center items-center gap-3">
                <TimeUnit value={days} label="Days" />
                <TimeUnit value={hours} label="Hrs" />
                <TimeUnit value={minutes} label="Min" />
                <TimeUnit value={seconds} label="Sec" />
            </div>
        )}
      </div>

      <div className="relative p-3 z-10">
        <h3 className="font-bold text-sm leading-tight drop-shadow-lg truncate">
          {media.title}
        </h3>
        <p className="text-xs text-gray-300">{formatDate(media.releaseDate)}</p>
      </div>
    </div>
  );
};