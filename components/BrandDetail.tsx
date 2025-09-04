import React from 'react';
// FIX: Import correct and consistent types from the central types file.
import type { Brand, MediaDetails, Collection, MediaTypeFilter, SortBy } from '../types.ts';
import { RecommendationGrid } from './RecommendationGrid.tsx';
import { StudioFilters } from './StudioFilters.tsx';
import { CollectionCard } from './CollectionCard.tsx';

// FIX: Removed incorrect local type definitions that were too restrictive.
// type MediaTypeFilter = 'all' | 'movie' | 'show' | 'short';
// type SortBy = 'trending' | 'newest';

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
}) => {
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
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={onBack} className="px-4 py-2 text-sm text-gray-200 glass-panel rounded-full hover:bg-white/5 transition-colors">&larr; Back to Brands</button>
                    <h2 className="text-3xl font-bold text-white">{brand.name}</h2>
                </div>

                {brand.characterCollections.length > 0 && (
                    <section className="w-full mb-8 md:mb-12">
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

                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">All {brand.name} Content</h3>
                <StudioFilters
                  mediaTypeFilter={mediaTypeFilter}
                  setMediaTypeFilter={setMediaTypeFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  // FIX: Pass prop to enable timeline sort for brand pages.
                  showTimelineSort
                />
                <RecommendationGrid recommendations={media} onSelect={onSelectMedia} />
            </div>
        </>
    );
};