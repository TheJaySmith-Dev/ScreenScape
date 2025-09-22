import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings.ts';
import { useTrakt } from '../hooks/useTrakt.ts';
import { RecommendationGrid } from './RecommendationGrid.tsx';
import { OnboardingModal } from './OnboardingModal.tsx';
import { SparklesIcon, Cog6ToothIcon, ThumbsUpIcon, TraktIcon } from './icons.tsx';
import type { MediaDetails } from '../types.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { TraktAuthButton } from './TraktAuthButton.tsx';
import { REDIRECT_URI } from '../services/traktService.ts';

interface MyScapePageProps {
  onSelectMedia: (media: MediaDetails) => void;
}

export const MyScapePage: React.FC<MyScapePageProps> = ({ onSelectMedia }) => {
    const { rateLimit, tmdbApiKey, geminiApiKey, saveApiKeys, clearAllSettings, isAllClearMode, toggleAllClearMode, trakt } = useSettings();
    const { watchlist, isLoading: preferencesLoading } = useTrakt();
    const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
    const [copyText, setCopyText] = useState('Copy');

    if (preferencesLoading) {
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
    }

    const watchlistItems: MediaDetails[] = watchlist.map(item => ({
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
    
    const handleCopyUri = () => {
        navigator.clipboard.writeText(REDIRECT_URI);
        setCopyText('Copied!');
        setTimeout(() => setCopyText('Copy'), 2000);
    };


    return (
        <>
            <div className="w-full max-w-7xl fade-in">
                <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 text-center md:text-left mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-white">MyScape</h1>
                        <p className="text-lg text-gray-400">Your local hub for settings and liked items.</p>
                    </div>
                    <a href="#/home" className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all duration-300">
                        <ThumbsUpIcon className="w-6 h-6 text-green-400" />
                        <span>For You Recommendations</span>
                    </a>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
                                <button onClick={() => setIsOnboardingModalOpen(true)} className="w-full px-4 py-2 text-sm text-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                                    Manage API Keys
                                </button>
                                 <button onClick={clearAllSettings} className="w-full px-4 py-2 text-sm text-center text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                                    Clear All Local Data
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Trakt Settings */}
                     <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><TraktIcon className="w-5 h-5"/> Trakt.tv Sync</h2>
                            <p className="text-sm text-gray-300 mb-4">Connect your Trakt account to sync your watchlist across all your devices.</p>
                        </div>
                        <div className="mt-auto">
                           <TraktAuthButton />
                           {trakt.state !== 'authenticated' && (
                               <div className="mt-4 text-xs text-gray-400">
                                   <p className="font-semibold mb-1">Having trouble connecting?</p>
                                   <p>Make sure your Redirect URI in your Trakt app settings is set to:</p>
                                   <div className="flex items-center justify-between gap-2 mt-1 p-2 bg-black/20 rounded-md">
                                       <code className="truncate text-gray-300">{REDIRECT_URI}</code>
                                       <button 
                                           onClick={handleCopyUri} 
                                           className="text-indigo-400 hover:text-indigo-300 font-bold flex-shrink-0"
                                       >
                                           {copyText}
                                       </button>
                                   </div>
                               </div>
                           )}
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

                {/* Watchlist Section */}
                <div>
                    <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                        <TraktIcon className="w-6 h-6"/>
                        My Trakt Watchlist
                    </h2>
                    {trakt.state !== 'authenticated' ? (
                         <div className="text-center py-12 glass-panel rounded-2xl">
                            <p className="text-gray-300">Connect your Trakt account to see your watchlist.</p>
                        </div>
                    ) : watchlistItems.length > 0 ? (
                        <RecommendationGrid recommendations={watchlistItems} onSelect={onSelectMedia} />
                    ) : (
                        <div className="text-center py-12 glass-panel rounded-2xl">
                            <p className="text-gray-300">Your Trakt watchlist is empty.</p>
                            <p className="text-sm text-gray-400 mt-2">Add movies and shows to see them here.</p>
                        </div>
                    )}
                </div>
            </div>

            {isOnboardingModalOpen && (
                <OnboardingModal
                    onSave={(keys) => {
                        saveApiKeys(keys);
                        setIsOnboardingModalOpen(false);
                    }}
                    onClose={() => setIsOnboardingModalOpen(false)}
                    initialTmdbKey={tmdbApiKey || ''}
                    initialGeminiKey={geminiApiKey || ''}
                    startOnStep={5}
                />
            )}
        </>
    );
};