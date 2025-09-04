import React from 'react';
import type { UserLocation } from '../types.ts';
import { cinemaData } from '../services/cinemaService.ts';
import { TicketIcon } from './icons.tsx';

interface CinemaAvailabilityProps {
    userLocation: UserLocation | null;
    movieTitle: string;
}

export const CinemaAvailability: React.FC<CinemaAvailabilityProps> = ({ userLocation, movieTitle }) => {
    if (!userLocation) return null;

    const chains = cinemaData[userLocation.code.toUpperCase()];
    if (!chains || chains.length === 0) return null;

    return (
        <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <TicketIcon className="w-5 h-5" />
                <span>In Theaters Now</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {chains.map(chain => (
                    <a
                        key={chain.name}
                        href={`https://www.google.com/search?q=${encodeURIComponent(`${chain.name} ${movieTitle} showtimes`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center p-3 bg-black/5 hover:bg-black/10 border border-black/10 rounded-lg transition-colors duration-200"
                    >
                        <span className="text-sm font-medium">{chain.name}</span>
                    </a>
                ))}
            </div>
        </div>
    );
};