import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings.ts';
import { usePreferences } from '../hooks/usePreferences.ts';
import { RecommendationGrid } from './RecommendationGrid.tsx';
import { ManageKeysModal } from './ManageKeysModal.tsx';
import { SparklesIcon, Cog6ToothIcon, ThumbsUpIcon, DiscordIcon } from './icons.tsx';
import type { MediaDetails } from '../types.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { VersionHistoryTab } from './VersionHistoryTab.tsx';

interface MyScapePageProps {
  onSelectMedia: (media: MediaDetails) => void;
}

export const MyScapePage: React.FC<MyScapePageProps> = ({ onSelectMedia }) => {
    const { rateLimit, tmdbApiKey, geminiApiKey, kinocheckApiKey, clearAllSettings, isAllClearMode, toggleAllClearMode } = useSettings();
    const { likes, isLoading: preferencesLoading } = usePreferences();
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

    if (preferencesLoading) {
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
    }

    const watchlistItems: MediaDetails[] = likes.map(item => ({
        ...item,
        overview: '',
        backdropUrl: '',
        rating: 0,
        trailerUrl: null,
    }));
    
    const DAILY_LIMIT = 500;
    const remainingRequests = Math.max(0, DAILY_LIMIT - rateLimit.count);
    const usagePercentage = (rateLimit.count / DAILY_LIMIT) * 100;

    let progressBarColor = 'bg-green-500';
    if (usagePercentage >= 90) {
        progressBarColor = 'bg-red-500';
    } else if (usagePercentage >= 75) {
        progressBarColor = 'bg-yellow-500';
    }


    return (
        <>
            <div className="w-full max-w-7xl fade-in">
                <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 text-center md:text-left mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-white">MyScape</h1>
                        <p className="text-lg text-gray-400">Your local hub for settings and liked items.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a href="#/foryou" className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all duration-300">
                            <ThumbsUpIcon className="w-6 h-6 text-green-400" />
                            <span>For You Recommendations</span>
                        </a>
                        <a href="https://discord.gg/VqfzVh5kzT" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl text-white font-semibold transition-all duration-300">
                            <DiscordIcon className="w-6 h-6 text-indigo-400" />
                            <span>Join our Discord</span>
                        </a>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Settings */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Cog6ToothIcon className="w-6 h-6"/> Settings</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-300">TMDb API Key:</span>
                                <span className="font-mono text-gray-400">{tmdbApiKey ? `...${tmdbApiKey.slice(-4)}` : 'Not Set'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-300">Gemini API Key:</span>
                                <span className="font-mono text-gray-400">{geminiApiKey ? `...${geminiApiKey.slice(-4)}` : 'Not Set'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-300">KinoCheck API Key:</span>
                                <span className="font-mono text-gray-400">{kinocheckApiKey ? `...${kinocheckApiKey.slice(-4)}` : 'Not Set (Optional)'}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <div>
                                    <label htmlFor="all-clear-toggle" className="text-gray-200 text-sm">"All Clear" Mode</label>
                                    <p className="text-xs text-gray-400 -mt-1">Increases UI transparency.</p>
                                </div>
                                <button
                                    id="all-clear-toggle"
                                    onClick={toggleAllClearMode}
                                    className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 ${
                                        isAllClearMode ? 'bg-indigo-600' : 'bg-gray-700'
                                    }`}
                                    role="switch"
                                    aria-checked={isAllClearMode}
                                >
                                    <span
                                        className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 ease-in-out shadow-lg ring-1 ring-black/10 ${
                                            isAllClearMode ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                            <div className="pt-2 space-y-2">
                                <button onClick={() => setIsApiKeyModalOpen(true)} className="w-full px-4 py-2 text-sm text-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                                    Manage API Keys
                                </button>
                                 <button onClick={clearAllSettings} className="w-full px-4 py-2 text-sm text-center text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                                    Clear All Local Data
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Usage */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><SparklesIcon className="w-6 h-6 text-indigo-400"/> AI Usage</h2>
                         <div className="text-center">
                             {remainingRequests > 0 ? (
                                <>
                                    <p className="text-5xl font-bold text-white">{remainingRequests}</p>
                                    <p className="text-sm text-gray-400 mt-2">AI Requests Remaining Today</p>
                                </>
                             ) : (
                                <>
                                    <p className="text-4xl font-bold text-red-400">Daily Limit Reached</p>
                                    <p className="text-sm text-gray-400 mt-2">Your AI features will reset tomorrow.</p>
                                </>
                             )}
                             <div className="w-full bg-white/10 rounded-full h-2.5 mt-4">
                                <div 
                                    className={`h-2.5 rounded-full transition-all duration-500 ${progressBarColor}`} 
                                    style={{ width: `${usagePercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Version History Section */}
                <div>
                    <h2 className="text-3xl font-bold mb-6 text-white">Version History</h2>
                    <VersionHistoryTab />
                </div>

                {/* Watchlist Section */}
                <div>
                    <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                        <ThumbsUpIcon className="w-8 h-8 text-green-400"/>
                        My Liked Items
                    </h2>
                    {watchlistItems.length > 0 ? (
                        <RecommendationGrid recommendations={watchlistItems} onSelect={onSelectMedia} />
                    ) : (
                        <div className="text-center py-12 glass-panel rounded-2xl">
                            <p className="text-gray-300">Your liked list is empty.</p>
                            <p className="text-sm text-gray-400 mt-2">Like movies and shows to add them here.</p>
                        </div>
                    )}
                </div>
            </div>

            {isApiKeyModalOpen && (
                <ManageKeysModal onClose={() => setIsApiKeyModalOpen(false)} />
            )}
        </>
    );
};