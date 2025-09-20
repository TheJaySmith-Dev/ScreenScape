import React from 'react';
import type { UserLocation } from '../types.ts';
import { cinemaData } from '../services/cinemaService.ts';
import { TicketIcon } from './icons.tsx';

interface CinemaAvailabilityProps {
    userLocation: UserLocation;
    movieTitle: string;
}

export const CinemaAvailability: React.FC<CinemaAvailabilityProps> = ({ userLocation, movieTitle }) => {
    const chains = cinemaData[userLocation.code.toUpperCase()];

    return (
        <div>
            <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                <TicketIcon className="w-5 h-5" />
                <span>In Theaters Now</span>
            </h4>
            
            <div className="p-4 rounded-lg bg-white/5 min-h-[100px] flex items-center justify-center">
                {chains && chains.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
                        {chains.map(chain => (
                            <a
                                key={chain.name}
                                href={`https://www.google.com/search?q=${encodeURIComponent(`${chain.name} ${movieTitle} showtimes`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-center p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors duration-200"
                            >
                                <span className="text-sm font-medium text-gray-200">{chain.name}</span>
                            </a>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 text-center">
                        No major cinema chains found for {userLocation.name}.
                    </p>
                )}
            </div>
        </div>
    );
};