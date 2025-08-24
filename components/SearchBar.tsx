
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
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tell me what you're looking for..."
        className="w-full pl-4 pr-12 py-3 sm:pl-5 sm:py-4 text-base sm:text-lg text-white bg-white/10 border border-white/20 rounded-full focus:ring-2 focus:ring-blue-400 focus:outline-none backdrop-blur-sm transition-all duration-300 placeholder-gray-400"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full sm:w-14 text-gray-300 hover:text-white disabled:text-gray-500 transition-colors duration-300"
        disabled={isLoading}
      >
        <SearchIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </form>
  );
};
