

import React, { useState } from 'react';
import { SearchIcon } from './icons.tsx';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  theme?: 'dark' | 'light';
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, theme = 'dark' }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSearch(query);
    }
  };

  const inputClass = theme === 'light'
    ? 'w-full pl-4 pr-12 py-2 text-base text-black bg-gray-200/80 border border-black/10 rounded-full focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/80 focus:outline-none transition-all duration-300 placeholder-gray-600'
    : 'w-full pl-4 pr-12 py-2 text-base text-white bg-black/20 border border-white/10 rounded-full focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/80 focus:outline-none backdrop-blur-sm transition-all duration-300 placeholder-gray-400';
  
  const buttonClass = `absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full disabled:text-gray-600 transition-colors duration-300 group ${
    theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-gray-400 hover:text-white'
  }`;

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xs sm:max-w-sm">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className={inputClass}
        disabled={isLoading}
      />
      <button
        type="submit"
        className={buttonClass}
        disabled={isLoading}
      >
        <SearchIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
      </button>
    </form>
  );
};
