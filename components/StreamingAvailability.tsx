import React, { useState, useEffect, useMemo } from 'react';
import type { MediaDetails, UserLocation, WatchProviders } from '../types.ts';
import { HomeIcon } from './icons.tsx';
import { Providers } from './Providers.tsx';
import { CountrySelector } from './CountrySelector.tsx';
import { supportedCountries } from '../services/countryService.ts';
import { fetchWatchProviders } from '../services/mediaService.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';

interface StreamingAvailabilityProps {
    item: MediaDetails;
    userLocation: UserLocation | null;
}

const providersExist = (providers: WatchProviders | null | undefined): boolean => {
    if (!providers) return false;
    return (providers.flatrate && providers.flatrate.length > 0) ||
           (providers.rent && providers.rent.length > 0) ||
           (providers.buy && providers.buy.length > 0);
};

export const StreamingAvailability: React.FC<StreamingAvailabilityProps> = ({ item, userLocation }) => {
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>(userLocation?.code || 'US');
    const [currentProviders, setCurrentProviders] = useState<WatchProviders | null | undefined>(item.watchProviders);
    const [isLoading, setIsLoading] = useState(false);

    // Effect to reset state when the media item changes
    useEffect(() => {
        setSelectedCountryCode(userLocation?.code || 'US');
        setCurrentProviders(item.watchProviders);
    }, [item.id, userLocation, item.watchProviders]);

    const handleCountryChange = async (newCountryCode: string) => {
        setSelectedCountryCode(newCountryCode);
        
        setIsLoading(true);
        try {
            const newProviders = await fetchWatchProviders(item.id, item.type, newCountryCode);
            setCurrentProviders(newProviders);
        } catch (error) {
            console.error('Failed to fetch watch providers:', error);
            setCurrentProviders(null);
        } finally {
            setIsLoading(false);
        }
    };
    
    const countryListForSelector = useMemo(() => {
        const userCountry = supportedCountries.find(c => c.code === (userLocation?.code || 'US'));
        if (!userCountry) return supportedCountries;

        // Ensure user's country is at the top of the list for easy access
        const otherCountries = supportedCountries.filter(c => c.code !== userCountry.code);
        return [userCountry, ...otherCountries];
    }, [userLocation]);
    
    const selectedCountryName = supportedCountries.find(c => c.code === selectedCountryCode)?.name || 'your region';
    const hasProviders = providersExist(currentProviders);
    const justWatchLink = currentProviders?.link;

    return (
        <div>
            <h4 className="text-md font-semibold text-white mb-2 flex items-center gap-2">
                <HomeIcon className="w-5 h-5"/> Where to Watch
            </h4>

            <div className="space-y-3">
                <CountrySelector 
                    countries={countryListForSelector}
                    selectedCode={selectedCountryCode}
                    onCountryChange={handleCountryChange}
                />

                <div className="p-4 rounded-lg bg-white/5 min-h-[100px] flex items-center justify-center">
                    {isLoading ? (
                        <LoadingSpinner className="w-8 h-8"/>
                    ) : hasProviders ? (
                        <Providers providers={currentProviders!} />
                    ) : justWatchLink ? (
                        <a
                            href={justWatchLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-center p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors duration-200"
                        >
                            <span className="text-sm font-medium text-gray-200">See all streaming options</span>
                        </a>
                    ) : item.isInTheaters ? (
                        <p className="text-sm text-gray-400 text-center">
                            This title is in theaters. Streaming options will appear here when available.
                        </p>
                    ) : (
                        <p className="text-sm text-gray-400 text-center">
                            Not currently available on major streaming services in {selectedCountryName}.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
