import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings.ts';
import { useTmdbAccount } from '../hooks/useTmdbAccount.ts';
import { RecommendationGrid } from './RecommendationGrid.tsx';
import { OnboardingModal } from './OnboardingModal.tsx';
import { SparklesIcon, Cog6ToothIcon, ThumbsUpIcon, LoginIcon } from './icons.tsx';
import type { MediaDetails } from '../types.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';

interface MyScapePageProps {
  onSelectMedia: (media: MediaDetails) => void;
}

const REDIRECT_URI = `${window.location.origin}/callback/tmdb`;

export const MyScapePage: React.FC<MyScapePageProps> = ({ onSelectMedia }) => {
    const { rateLimit, tmdbApiKey, geminiApiKey, saveApiKeys, clearAllSettings, isAllClearMode, toggleAllClearMode, tmdb, loginWithTmdb, logoutTmdb } = useSettings();
    const { watchlist, isLoading: preferencesLoading } = useTmdbAccount();
    const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
    const [copyText, setCopyText] = useState('Copy');

    if (preferencesLoading) {
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(REDIRECT_URI);
        setCopyText('Copied!');
        setTimeout(() => setCopyText('Copy'), 2000);
    };

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
                        <p className="text-lg text-gray-400">Your personal hub for settings and your watchlist.</p>
                    </div>
                    <a href="/" className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all duration-300">
                        <ThumbsUpIcon className="w-6 h-6 text-green-400" />
                        <span>For You Recommendations</span>
                    </a>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <div className="glass-panel p-6 rounded-2xl">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Cog6ToothIcon className="w-6 h-6"/> API Keys</h2>
                        <p className="text-sm text-gray-300 mb-4">Your keys are stored locally and are required for the app to function.</p>
                        <button onClick={() => setIsOnboardingModalOpen(true)} className="w-full px-4 py-2 text-sm text-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                            Manage API Keys
                        </button>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><LoginIcon className="w-5 h-5"/> TMDb Account</h2>
                            {tmdb.state === 'authenticated' ? (
                                <div className="text-center">
                                    <p className="text-gray-300">Logged in as</p>
                                    <p className="font-bold text-white text-lg">{tmdb.accountDetails?.username}</p>
                                </div>
                            ) : (
                                <>
                                  <p className="text-sm text-gray-300 mb-4">Log in with your TMDb account to sync your watchlist and get personalized recommendations.</p>
                                  <div className="text-xs p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg">
                                    <p className="font-bold mb-1">One-Time Setup Required:</p>
                                    <p>Go to your <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-indigo-200">TMDb API Settings</a> and add the URL below to your "Redirect URI" field.</p>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <input type="text" readOnly value={REDIRECT_URI} className="w-full text-xs p-2 bg-black/20 border border-white/10 rounded-md font-mono" />
                                    <button onClick={handleCopy} className="px-3 py-1 text-xs text-indigo-300 bg-indigo-500/10 rounded-md hover:bg-indigo-500/20 transition-colors">{copyText}</button>
                                  </div>
                                </>
                            )}
                        </div>
                        <div className="mt-auto pt-4">
                           {tmdb.state === 'authenticated' ? (
                                <button onClick={logoutTmdb} className="w-full px-4 py-2 text-sm text-center text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                                    Logout
                                </button>
                           ) : (
                                <button onClick={loginWithTmdb} disabled={tmdb.state === 'loading'} className="w-full px-4 py-2 text-sm text-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50">
                                    {tmdb.state === 'loading' ? 'Redirecting...' : 'Login with TMDb'}
                                </button>
                           )}
                        </div>
                    </div>
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
                                    <p className="text-sm text-gray-400 mt-2">Resets tomorrow.</p>
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
                    <div className="glass-panel p-6 rounded-2xl">
                         <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Cog6ToothIcon className="w-6 h-6"/> General Settings</h2>
                        <div className="flex justify-between items-center">
                            <p className="text-gray-200">"All Clear" Mode (more transparent UI)</p>
                            <button
                                onClick={toggleAllClearMode}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out ${isAllClearMode ? 'bg-indigo-600' : 'bg-gray-700'}`}
                                role="switch"
                                aria-checked={isAllClearMode}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${isAllClearMode ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs text-gray-400">This will clear all your local data, including API keys and login sessions.</p>
                            <button onClick={clearAllSettings} className="w-full mt-2 px-4 py-2 text-sm text-center text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                                Clear All Local Data
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                        My TMDb Watchlist
                    </h2>
                    {tmdb.state !== 'authenticated' ? (
                         <div className="text-center py-12 glass-panel rounded-2xl">
                            <p className="text-gray-300">Login with TMDb to see your watchlist.</p>
                        </div>
                    ) : watchlist.length > 0 ? (
                        <RecommendationGrid recommendations={watchlist} onSelect={onSelectMedia} />
                    ) : (
                        <div className="text-center py-12 glass-panel rounded-2xl">
                            <p className="text-gray-300">Your TMDb watchlist is empty.</p>
                            <p className="text-sm text-gray-400 mt-2">Add movies and shows to see them here.</p>
                        </div>
                    )}
                </div>
            </div>
            {isOnboardingModalOpen && (
                <OnboardingModal
                    isOpen={isOnboardingModalOpen}
                    onClose={() => setIsOnboardingModalOpen(false)}
                    onSave={(keys) => {
                        saveApiKeys(keys);
                        setIsOnboardingModalOpen(false);
                    }}
                    startOnStep={5}
                />
            )}
        </>
    );
};
