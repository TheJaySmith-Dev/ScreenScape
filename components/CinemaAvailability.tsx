import React, { useState, useMemo } from 'react';
import type { UserLocation } from '../types.ts';
import { cinemaData } from '../services/cinemaService.ts';
import { TicketIcon } from './icons.tsx';
import { CountrySelector } from './CountrySelector.tsx';
import { supportedCountries } from '../services/countryService.ts';

interface CinemaAvailabilityProps {
    userLocation: UserLocation | null;
    movieTitle: string;
}

export const CinemaAvailability: React.FC<CinemaAvailabilityProps> = ({ userLocation, movieTitle }) => {
    // Initialize with user's detected location, fallback to 'US'
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>(userLocation?.code || 'US');

    // Get the cinema chains for the currently selected country
    const chains = cinemaData[selectedCountryCode.toUpperCase()];
    
    // Memoize the country list to ensure the user's country is always at the top
    const countryListForSelector = useMemo(() => {
        const userCountry = supportedCountries.find(c => c.code === (userLocation?.code || 'US'));
        // If the user's country isn't in our curated list, just return the default sorted list.
        if (!userCountry) return supportedCountries;

        // Otherwise, move the user's country to the top for convenience.
        const otherCountries = supportedCountries.filter(c => c.code !== userCountry.code);
        return [userCountry, ...otherCountries];
    }, [userLocation]);

    if (!userLocation) return null;

    return (
        <div>
            <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                <TicketIcon className="w-5 h-5" />
                <span>In Theaters Now</span>
            </h4>
            
            <div className="space-y-3">
                <CountrySelector 
                    countries={countryListForSelector}
                    selectedCode={selectedCountryCode}
                    onCountryChange={setSelectedCountryCode}
                />
                
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
                            No major cinema chains found for the selected country.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
