
import React from 'react';

type MediaTypeFilter = 'all' | 'movie' | 'show' | 'short';
type SortBy = 'trending' | 'newest';

interface StudioFiltersProps {
  mediaTypeFilter: MediaTypeFilter;
  setMediaTypeFilter: (filter: MediaTypeFilter) => void;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
}

const FilterButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
      isActive
        ? 'bg-white text-gray-900'
        : 'text-gray-300 bg-white/5 hover:bg-white/10 hover:text-white'
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
}) => {
  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="flex items-center justify-center p-1 space-x-2 bg-black/30 backdrop-blur-sm border border-white/10 rounded-full">
        <FilterButton label="All" isActive={mediaTypeFilter === 'all'} onClick={() => setMediaTypeFilter('all')} />
        <FilterButton label="Movies" isActive={mediaTypeFilter === 'movie'} onClick={() => setMediaTypeFilter('movie')} />
        <FilterButton label="Shows" isActive={mediaTypeFilter === 'show'} onClick={() => setMediaTypeFilter('show')} />
        <FilterButton label="Shorts" isActive={mediaTypeFilter === 'short'} onClick={() => setMediaTypeFilter('short')} />
      </div>

      <div className="flex items-center justify-center p-1 space-x-2 bg-black/30 backdrop-blur-sm border border-white/10 rounded-full">
        <FilterButton label="Trending" isActive={sortBy === 'trending'} onClick={() => setSortBy('trending')} />
        <FilterButton label="Newest" isActive={sortBy === 'newest'} onClick={() => setSortBy('newest')} />
      </div>
    </div>
  );
};
