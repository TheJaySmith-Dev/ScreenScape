import React, { useState, useEffect, useCallback, FormEvent, useRef } from 'react';
import type { MediaDetails } from '../types.ts';
import { getSearchParamsFromQuery } from '../services/aiService.ts';
import { discoverMediaFromAi } from '../services/mediaService.ts';
import { CloseIcon, SearchIcon } from './icons.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { RecommendationGrid } from './RecommendationGrid.tsx';

interface AiSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (media: MediaDetails) => void;
}

type SearchState = 'initial' | 'loading' | 'results' | 'error';

const suggestionChips = [
    "something funny and upbeat",
    "I need a good cry",
    "what's new in true crime",
    "stories about dancers",
    "A Marvel movie starring Chris Evans",
    "a mind-bending sci-fi movie from A24"
];

export const AiSearchModal: React.FC<AiSearchModalProps> = ({ isOpen, onClose, onSelectMedia }) => {
    const [searchState, setSearchState] = useState<SearchState>('initial');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<MediaDetails[]>([]);
    const [resultsTitle, setResultsTitle] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('Thinking...');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setSearchState('initial');
                setQuery('');
                setResults([]);
                setResultsTitle('');
            }, 300);
        }
    }, [isOpen]);
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        setSearchState('loading');
        setErrorMessage('');
        
        try {
            setLoadingMessage('Understanding your request...');
            const { search_params, response_title } = await getSearchParamsFromQuery(searchQuery);

            setLoadingMessage('Finding matching titles...');
            const mediaResults = await discoverMediaFromAi(search_params);

            if (mediaResults.length === 0) {
                setResultsTitle(`Results for "${searchQuery}"`);
                setErrorMessage(`No results found for "${searchQuery}". Try being more specific!`);
                setSearchState('error');
            } else {
                setResults(mediaResults);
                setResultsTitle(response_title);
                setSearchState('results');
            }
        } catch (error) {
            console.error("AI Search failed:", error);
            setErrorMessage("An unexpected error occurred. Please try again.");
            setSearchState('error');
        } finally {
            setQuery('');
        }
    }, []);
    
    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    const handleChipClick = (chipQuery: string) => {
        handleSearch(chipQuery);
    };

    const handleStartOver = () => {
        setSearchState('initial');
        setQuery('');
        setResults([]);
        setResultsTitle('');
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    if (!isOpen) return null;

    const renderContent = () => {
        switch (searchState) {
            case 'loading':
                return (
                    <div className="flex flex-col items-center justify-center text-center h-64">
                        <LoadingSpinner className="w-12 h-12" />
                        <p className="mt-4 text-lg text-gray-300">{loadingMessage}</p>
                    </div>
                );
            case 'results':
            case 'error':
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex-shrink-0 p-6">
                            <h2 className="text-lg font-semibold text-gray-200">{resultsTitle}</h2>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto px-6 pb-6">
                             {searchState === 'error' ? (
                                <div className="text-center mt-12">
                                    <p className="text-red-400">{errorMessage}</p>
                                </div>
                            ) : (
                                <RecommendationGrid recommendations={results} onSelect={onSelectMedia} />
                            )}
                        </div>

                        <div className="flex-shrink-0 p-6 border-t border-white/10 mt-auto">
                            <form onSubmit={handleFormSubmit} className="flex items-center gap-3">
                                <div className="relative w-full rounded-full ai-search-input-wrapper">
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Add to your search or start over"
                                        className="w-full pl-5 pr-14 py-3 bg-transparent text-white rounded-full focus:outline-none"
                                        autoFocus
                                    />
                                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2" aria-label="Search">
                                        <SearchIcon className="w-6 h-6 text-white" />
                                    </button>
                                </div>
                                <button type="button" onClick={handleStartOver} className="px-4 py-3 text-sm text-gray-300 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                                    Back
                                </button>
                            </form>
                        </div>
                    </div>
                );
            case 'initial':
            default:
                return (
                    <div className="flex flex-col h-full">
                        <div className="p-6 text-center">
                            <h2 className="text-2xl font-bold">Ask for vibes, themes, titles — <br/> whatever you're craving!</h2>
                            <button onClick={onClose} className="text-sm text-gray-400 hover:text-white transition-colors mt-2">Switch to Standard Search</button>
                        </div>
                        <div className="p-6 flex-grow flex items-center justify-center">
                             <div className="flex flex-wrap justify-center gap-3">
                                {suggestionChips.map(chip => (
                                    <button key={chip} onClick={() => handleChipClick(chip)} className="suggestion-chip px-4 py-2 rounded-full text-sm">
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 mt-auto border-t border-white/10">
                            <form onSubmit={handleFormSubmit}>
                                <div className="relative w-full rounded-full ai-search-input-wrapper">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="What are you in the mood to watch?"
                                        className="w-full pl-5 pr-14 py-3 bg-transparent text-white rounded-full focus:outline-none"
                                        autoFocus
                                    />
                                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2" aria-label="Search">
                                        <SearchIcon className="w-6 h-6 text-white" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 ai-search-modal-bg fade-in" 
            style={{ animationDuration: '300ms' }}
            onClick={onClose}
        >
            <div 
                className="w-full max-w-2xl h-[85vh] max-h-[700px] ai-search-modal-content rounded-3xl overflow-hidden flex flex-col fade-in-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                         <span className="px-2 py-0.5 text-xs font-bold bg-pink-400/20 text-pink-300 border border-pink-400/30 rounded-md">BETA</span>
                         <h1 className="font-semibold">Search</h1>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Close search">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};