import React, { useState, useEffect } from 'react';
import { RecommendationGrid } from './RecommendationGrid';
import { LoadingSpinner } from './LoadingSpinner';
import { SendIcon } from './icons';
import * as aiService from '../services/aiService';
import * as mediaService from '../services/mediaService';
import type { MediaDetails, ChatMessage } from '../types';
import { useSettings } from '../hooks/useSettings';

export const AwardSearchPage: React.FC<{ onSelectMedia: (media: MediaDetails) => void; }> = ({ onSelectMedia }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [searchResults, setSearchResults] = useState<MediaDetails[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userInput, setUserInput] = useState('');
    const { aiClient } = useSettings();

    useEffect(() => {
        setMessages([{ role: 'model', content: 'What award-winning movies would you like to see? For example, "Show me all Oscar-winning movies for Best Picture".' }]);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !aiClient || isLoading) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);
        setError(null);
        setSearchResults([]);

        try {
            const movieTitles = await aiService.getAwardMovies(userInput, aiClient);

            const promises = movieTitles.map(title => {
                const match = title.match(/(.+) \((\d{4})\)/);
                if (match) {
                    const [, movieTitle, year] = match;
                    return mediaService.searchMedia(`${movieTitle} year:${year}`);
                }
                return mediaService.searchMedia(title);
            });
            const results = await Promise.all(promises);
            const movies = results.flatMap(res => res.length > 0 ? [res[0]] : []); // Take the first result for each search

            setSearchResults(movies);

        } catch (err: any) {
            const errorMessage = err.message || "Sorry, I couldn't get a response. Please try again.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-white">Award Search</h1>
            <p className="text-gray-400">Ask ScapeAI to find movies that have won a specific award.</p>

            <div className="space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-bubble ${msg.role}`}>
                        {msg.content}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="sticky bottom-4">
                <div className="relative w-full rounded-full chat-input-wrapper">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="e.g., Show me all Oscar-winning movies for Best Picture"
                        className="w-full pl-4 pr-12 py-3 bg-transparent text-white rounded-full focus:outline-none"
                        disabled={isLoading}
                        autoFocus
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 disabled:opacity-50 transition-opacity" aria-label="Send message" disabled={isLoading || !userInput.trim()}>
                        <SendIcon className="w-6 h-6" />
                    </button>
                </div>
            </form>

            {isLoading && (
                <div className="flex justify-center items-center h-48">
                    <LoadingSpinner />
                </div>
            )}

            {error && (
                <div className="text-center text-red-400">{error}</div>
            )}

            {searchResults.length > 0 && (
                <RecommendationGrid recommendations={searchResults} onSelect={onSelectMedia} />
            )}
        </div>
    );
};
