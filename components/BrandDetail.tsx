import React, { useMemo } from 'react';
import type { Brand, MediaDetails, Collection, MediaTypeFilter, SortBy } from '../types.ts';
import { RecommendationGrid } from './RecommendationGrid.tsx';
import { StudioFilters } from './StudioFilters.tsx';
import { CollectionCard } from './CollectionCard.tsx';
import { SparklesIcon, ChatBubbleIcon } from './icons.tsx';

interface BrandDetailProps {
    brand: Brand;
    media: MediaDetails[];
    mediaTypeFilter: MediaTypeFilter;
    setMediaTypeFilter: (filter: MediaTypeFilter) => void;
    sortBy: SortBy;
    setSortBy: (sort: SortBy) => void;
    onBack: () => void;
    onSelectMedia: (media: MediaDetails) => void;
    onSelectCollection: (collection: Collection) => void;
    onGenerateGuides?: (brand: Brand, media: MediaDetails[]) => void;
    onOpenChat?: (brand: Brand) => void;
}

export const BrandDetail: React.FC<BrandDetailProps> = ({
    brand,
    media,
    mediaTypeFilter,
    setMediaTypeFilter,
    sortBy,
    setSortBy,
    onBack,
    onSelectMedia,
    onSelectCollection,
    onGenerateGuides,
    onOpenChat,
}) => {
    const filteredAndSortedMedia = useMemo(() => {
        let processedMedia = [...media];

        // Filter
        if (mediaTypeFilter !== 'all') {
            processedMedia = processedMedia.filter(item => {
                if (mediaTypeFilter === 'movie') return item.type === 'movie' && item.mediaSubType !== 'short';
                if (mediaTypeFilter === 'show') return item.type === 'tv';
                if (mediaTypeFilter === 'short') return item.mediaSubType === 'short';
                return true;
            });
        }

        // Sort
        switch (sortBy) {
            case 'newest':
                processedMedia.sort((a, b) => new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime());
                break;
            case 'timeline':
                processedMedia.sort((a, b) => new Date(a.releaseDate || 0).getTime() - new Date(b.releaseDate || 0).getTime());
                break;
            case 'trending':
            default:
                processedMedia.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
                break;
        }

        return processedMedia;
    }, [media, mediaTypeFilter, sortBy]);

    return (
        <>
            {brand.backdropUrl && (
                <div 
                    className="fixed inset-0 w-full h-full z-0 transition-all duration-500 ease-in-out"
                >
                    <img 
                        src={brand.backdropUrl} 
                        alt={`${brand.name} backdrop`} 
                        className="w-full h-full object-cover opacity-10" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#4A4A4A] via-[#4A4A4A]/80 to-transparent" />
                </div>
            )}
            <div className="relative z-10 w-full max-w-7xl fade-in">
                <div className="flex items-center gap-4 mb-8 flex-wrap">
                    <button onClick={onBack} className="px-4 py-2 text-sm text-gray-200 glass-panel rounded-full hover:bg-white/5 transition-colors">&larr; Back to Brands</button>
                    <h2 className="text-3xl font-bold text-white">{brand.name}</h2>
                    {onGenerateGuides && (
                        <button
                            onClick={() => onGenerateGuides(brand, media)}
                            className="glass-button text-sm"
                            aria-label={`Generate AI viewing guides for ${brand.name}`}
                        >
                            <SparklesIcon className="w-5 h-5 text-indigo-400" />
                            <span>AI Viewing Guides</span>
                        </button>
                    )}
                    {onOpenChat && (
                        <button
                            onClick={() => onOpenChat(brand)}
                            className="glass-button text-sm"
                            aria-label={`Chat with ScapeAI about ${brand.name}`}
                        >
                            <ChatBubbleIcon className="w-5 h-5"/>
                            <span>Chat with ScapeAI</span>
                        </button>
                    )}
                </div>

                {brand.characterCollections.length > 0 && (
                    <section className="w-full mb-12 md:mb-16">
                      <h3 className="text-2xl md:text-3xl font-bold mb-4 ml-4 md:ml-0 text-white">Character Collections</h3>
                      <div className="media-row flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                        {brand.characterCollections.map(collection => (
                          <div key={collection.id} className="flex-shrink-0 w-40 sm:w-44 md:w-48">
                            <CollectionCard collection={collection} onSelect={() => onSelectCollection(collection)} />
                          </div>
                        ))}
                         <div className="flex-shrink-0 w-1"></div>
                      </div>
                    </section>
                )}

                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white">All {brand.name} Content</h3>
                <StudioFilters
                  mediaTypeFilter={mediaTypeFilter}
                  setMediaTypeFilter={setMediaTypeFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  showTimelineSort
                />
                <RecommendationGrid recommendations={filteredAndSortedMedia} onSelect={onSelectMedia} />
            </div>
        </>
    );
};