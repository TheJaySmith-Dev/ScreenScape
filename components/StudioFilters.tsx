import React from 'react';
// FIX: Import SortBy type from types.ts to ensure it includes all possible values like 'timeline'.
import type { MediaTypeFilter, SortBy } from '../types.ts';

// FIX: Removed incorrect local type definitions.
// type MediaTypeFilter = 'all' | 'movie' | 'show' | 'short';
// type SortBy = 'trending' | 'newest';

interface StudioFiltersProps {
  mediaTypeFilter: MediaTypeFilter;
  setMediaTypeFilter: (filter: MediaTypeFilter) => void;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
  // FIX: Add a prop to conditionally show the timeline sort option.
  showTimelineSort?: boolean;
}

const FilterButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${
      isActive
        ? 'bg-black/20 text-white shadow-inner'
        : 'text-white/80 bg-white/5 hover:bg-white/20 hover:text-white'
    }`}
  >
    {label}
  </button>
);

export const StudioFilters: React.FC<StudioFiltersProps> = ({
  mediaTypeFilter,
  setMediaTypeFilter,
  sortBy,
  setSortBy,
  // FIX: Default showTimelineSort to false for backward compatibility (e.g., for studio pages).
  showTimelineSort = false,
}) => {
  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="flex items-center justify-center flex-wrap gap-2 p-2 bg-black/10 backdrop-blur-sm border border-white/10 rounded-2xl">
        <FilterButton label="All" isActive={mediaTypeFilter === 'all'} onClick={() => setMediaTypeFilter('all')} />
        <FilterButton label="Movies" isActive={mediaTypeFilter === 'movie'} onClick={() => setMediaTypeFilter('movie')} />
        <FilterButton label="Shows" isActive={mediaTypeFilter === 'show'} onClick={() => setMediaTypeFilter('show')} />
        <FilterButton label="Shorts" isActive={mediaTypeFilter === 'short'} onClick={() => setMediaTypeFilter('short')} />
      </div>

      <div className="flex items-center justify-center flex-wrap gap-2 p-2 bg-black/10 backdrop-blur-sm border border-white/10 rounded-2xl">
        <FilterButton label="Trending" isActive={sortBy === 'trending'} onClick={() => setSortBy('trending')} />
        <FilterButton label="Newest" isActive={sortBy === 'newest'} onClick={() => setSortBy('newest')} />
        {/* FIX: Conditionally render the Timeline sort button. */}
        {showTimelineSort && (
          <FilterButton label="Timeline" isActive={sortBy === 'timeline'} onClick={() => setSortBy('timeline')} />
        )}
      </div>
    </div>
  );
};
