import React, { useState, useEffect } from 'react';
import type { MediaDetails, UserLocation, WatchProviders } from '../types.ts';
import { HomeIcon } from './icons.tsx';
import { Providers } from './Providers.tsx';
import { fetchWatchProviders } from '../services/mediaService.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';

interface StreamingAvailabilityProps {
    item: MediaDetails;
    userLocation: UserLocation;
}

const providersExist = (providers: WatchProviders | null | undefined): boolean => {
    if (!providers) return false;
    return (providers.flatrate && providers.flatrate.length > 0) ||
           (providers.rent && providers.rent.length > 0) ||
           (providers.buy && providers.buy.length > 0);
};

export const StreamingAvailability: React.FC<StreamingAvailabilityProps> = ({ item, userLocation }) => {
    const [currentProviders, setCurrentProviders] = useState<WatchProviders | null | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProvidersForLocation = async () => {
            setIsLoading(true);
            try {
                const newProviders = await fetchWatchProviders(item.id, item.type, userLocation.code);
                setCurrentProviders(newProviders);
            } catch (error) {
                console.error(`Failed to fetch watch providers for ${userLocation.code}:`, error);
                setCurrentProviders(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProvidersForLocation();
    }, [item.id, item.type, userLocation.code]);
    
    const selectedCountryName = userLocation.name;
    const hasProviders = providersExist(currentProviders);
    const justWatchLink = currentProviders?.link;

    return (
        <div>
            <h4 className="text-md font-semibold text-white mb-2 flex items-center gap-2">
                <HomeIcon className="w-5 h-5"/> Where to Watch
            </h4>

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
    );
};