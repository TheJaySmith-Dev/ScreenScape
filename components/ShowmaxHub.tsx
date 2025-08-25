import React, { useState, useEffect } from 'react';
import type { MediaDetails, StreamingProviderInfo, UserLocation } from '../types.ts';
import { getShowmaxOriginals, getStudioContentOnProvider, getNetworkContentOnProvider } from '../services/tmdbService.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { MediaRow } from './MediaRow.tsx';

const PARAMOUNT_ID = 4;
const UNIVERSAL_ID = 33;
const HBO_ID = 49;
const PEACOCK_ID = 3353;
const ADULT_SWIM_ID = 80;
const CARTOON_NETWORK_ID = 56;


interface ShowmaxHubProps {
  provider: StreamingProviderInfo;
  onBack: () => void;
  onSelectMedia: (media: MediaDetails) => void;
  userLocation: UserLocation | null;
}

export const ShowmaxHub: React.FC<ShowmaxHubProps> = ({ provider, onBack, onSelectMedia, userLocation }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [sections, setSections] = useState<{title: string, items: MediaDetails[]}[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadShowmaxContent = async () => {
          setIsLoading(true);
          setError(null);
          const region = userLocation?.code || 'ZA';
          
          try {
            const [
                originals, 
                paramount, 
                universal,
                hbo,
                peacock,
                adultSwim,
                cartoonNetwork,
            ] = await Promise.all([
              getShowmaxOriginals(provider.id, region),
              getStudioContentOnProvider(PARAMOUNT_ID, provider.id, region),
              getStudioContentOnProvider(UNIVERSAL_ID, provider.id, region),
              getNetworkContentOnProvider(HBO_ID, provider.id, region),
              getNetworkContentOnProvider(PEACOCK_ID, provider.id, region),
              getNetworkContentOnProvider(ADULT_SWIM_ID, provider.id, region),
              getNetworkContentOnProvider(CARTOON_NETWORK_ID, provider.id, region),
            ]);
            
            const newSections = [];
            if (originals.length > 0) newSections.push({ title: 'Showmax Originals', items: originals });
            if (hbo.length > 0) newSections.push({ title: 'From the Home of HBO', items: hbo });
            if (paramount.length > 0) newSections.push({ title: 'Highlights from Paramount+', items: paramount });
            if (universal.length > 0) newSections.push({ title: 'Highlights from Universal', items: universal });
            if (peacock.length > 0) newSections.push({ title: 'Peacock Highlights', items: peacock });
            if (adultSwim.length > 0) newSections.push({ title: 'Adult Swim Favourites', items: adultSwim });
            if (cartoonNetwork.length > 0) newSections.push({ title: 'Cartoon Network Classics', items: cartoonNetwork });
            
            if (newSections.length === 0) {
              setError(`Could not find featured content for ${provider.name} in your region.`);
            }
            setSections(newSections);

          } catch (err) {
            console.error("Failed to load Showmax hub content", err);
            setError(`An error occurred while loading content for ${provider.name}.`);
          } finally {
            setIsLoading(false);
          }
        };

        loadShowmaxContent();
    }, [userLocation, provider.id, provider.name]);

    return (
        <div className="w-full max-w-7xl fade-in">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors">&larr; Back to Streaming Services</button>
                <h2 className="text-3xl font-bold">{provider.name}</h2>
            </div>
            
            {isLoading && <div className="flex justify-center"><LoadingSpinner /></div>}
            
            {error && !isLoading && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
            
            {!isLoading && sections.length > 0 && (
                <div className="flex flex-col gap-8 md:gap-12">
                    {sections.map((section, index) => (
                        <MediaRow 
                          key={section.title} 
                          title={section.title} 
                          items={section.items} 
                          onSelect={onSelectMedia}
                          animationDelay={`${index * 150}ms`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};