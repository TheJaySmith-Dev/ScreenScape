import React from 'react';
import type { MediaDetails } from '../types.ts';
import { useCountdown } from '../hooks/useCountdown.ts';
import { PlayIcon } from './icons.tsx';

interface ComingSoonCardProps {
  media: MediaDetails;
  onSelect: () => void;
  onPlayTrailer: () => void;
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

export const ComingSoonCard: React.FC<ComingSoonCardProps> = ({ media, onSelect, onPlayTrailer }) => {
  const { days, hours, minutes, seconds, isFinished } = useCountdown(media.releaseDate);
  const hasBackdrop = media.backdropUrl && !media.backdropUrl.includes('picsum.photos');

  return (
    <div
      className="group cursor-pointer rounded-xl bg-gray-900 border-2 border-transparent hover:border-white/40 focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-300 ease-in-out absolute inset-0 text-white shadow-lg 
                 hover:scale-125 hover:z-20 hover:aspect-video"
      tabIndex={0}
      role="button"
      aria-label={`View details for ${media.title}`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    >
      <img 
        src={media.posterUrl} 
        alt={`Poster for ${media.title}`} 
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
        loading="lazy"
      />
       {hasBackdrop && (
        <img 
            src={media.backdropUrl} 
            alt={`Backdrop for ${media.title}`} 
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity group-hover:opacity-0" />
      
      <div className="relative p-3 z-10 transition-opacity group-hover:opacity-0">
        <h3 className="font-bold text-sm leading-tight drop-shadow-lg truncate">
          {media.title}
        </h3>
        <p className="text-xs text-gray-300">{formatDate(media.releaseDate)}</p>
      </div>

      {/* Hover overlay */}
      <div 
        className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
      >
        <div className="mb-3">
            {isFinished ? (
                <div className="text-xl font-bold text-green-400">Released!</div>
            ) : (
                <div className="flex justify-center items-center gap-2 text-white">
                    <TimeUnit value={days} label="Days" />
                    <TimeUnit value={hours} label="Hrs" />
                    <TimeUnit value={minutes} label="Min" />
                    <TimeUnit value={seconds} label="Sec" />
                </div>
            )}
        </div>
        <div className="flex flex-col gap-2 w-[80%]">
            <button
                onClick={(e) => { e.stopPropagation(); onPlayTrailer(); }}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-white text-black rounded-md text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
                <PlayIcon className="w-5 h-5" />
                <span>Trailer</span>
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                className="w-full px-3 py-2 bg-white/20 text-white rounded-md text-sm font-semibold hover:bg-white/30 transition-colors"
            >
                More Info
            </button>
        </div>
      </div>
    </div>
  );
};