import React, { useState } from 'react';
import { SearchIcon } from './icons.tsx';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for movies, TV shows..."
        className="w-full pl-5 pr-14 py-4 text-lg text-white bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/80 focus:outline-none backdrop-blur-sm transition-all duration-300 placeholder-gray-400"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="absolute inset-y-0 right-0 flex items-center justify-center w-14 h-full text-gray-400 hover:text-white disabled:text-gray-600 transition-colors duration-300 group"
        disabled={isLoading}
      >
        <SearchIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
      </button>
    </form>
  );
};