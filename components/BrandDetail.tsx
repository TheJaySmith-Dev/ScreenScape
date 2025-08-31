
import React from 'react';
import type { Brand, MediaDetails, Collection } from '../types.ts';
import { RecommendationGrid } from './RecommendationGrid.tsx';
import { StudioFilters } from './StudioFilters.tsx';
import { CollectionCard } from './CollectionCard.tsx';

type MediaTypeFilter = 'all' | 'movie' | 'show' | 'short';
type SortBy = 'trending' | 'newest';

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
                    className="fixed inset-0 w-full h-full -z-10 transition-all duration-500 ease-in-out"
                >
                    <img 
                        src={brand.backdropUrl} 
                        alt={`${brand.name} backdrop`} 
                        className="w-full h-full object-cover opacity-20" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900 to-gray-900/50" />
                </div>
            )}
            <div className="w-full max-w-7xl fade-in">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={onBack} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors">&larr; Back to Brands</button>
                    <h2 className="text-3xl font-bold">{brand.name}</h2>
                </div>

                {brand.characterCollections.length > 0 && (
                    <section className="w-full mb-8 md:mb-12">
                      <h3 className="text-2xl md:text-3xl font-bold mb-4 ml-4 md:ml-0">Character Collections</h3>
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

                <h3 className="text-2xl md:text-3xl font-bold mb-4">All {brand.name} Content</h3>
                <StudioFilters
                  mediaTypeFilter={mediaTypeFilter}
                  setMediaTypeFilter={setMediaTypeFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
                <RecommendationGrid recommendations={media} onSelect={onSelectMedia} />
            </div>
        </>
    );
};
