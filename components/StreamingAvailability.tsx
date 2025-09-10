
import React from 'react';
import type { MediaDetails, UserLocation, WatchProviders } from '../types.ts';
import { HomeIcon } from './icons.tsx';
import { Providers } from './Providers.tsx';

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
    const hasProviders = providersExist(item.watchProviders);
    const justWatchLink = item.watchProviders?.link;

    return (
        <div>
            <h4 className="text-md font-semibold text-white mb-2 flex items-center gap-2">
                <HomeIcon className="w-5 h-5"/> Where to Watch
            </h4>
            <div className="p-4 rounded-lg bg-white/5">
                {hasProviders ? (
                    <Providers providers={item.watchProviders!} />
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
                        Check your local cinema. Streaming options will appear here when available.
                    </p>
                ) : (
                    <p className="text-sm text-gray-400 text-center">
                        Not currently available on major streaming services in {userLocation?.name || 'your region'}.
                    </p>
                )}
            </div>
        </div>
    );
};
