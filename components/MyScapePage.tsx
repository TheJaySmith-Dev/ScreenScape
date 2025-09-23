import React, { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings.ts';
import { useLocalLikes } from '../hooks/useLocalLikes.ts';
import { RecommendationGrid } from './RecommendationGrid.tsx';
import { SparklesIcon, Cog6ToothIcon, ThumbsUpIcon, KeyIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, UserCircleIcon } from './icons.tsx';
import type { MediaDetails, IdTokenClaims } from '../types.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { useLogto } from '@logto/react';

interface MyScapePageProps {
  onSelectMedia: (media: MediaDetails) => void;
}

const GeminiKeyManager: React.FC = () => {
    const { geminiApiKey, saveGeminiKey } = useSettings();
    const [geminiKeyInput, setGeminiKeyInput] = useState(geminiApiKey || '');
    const [isGeminiVisible, setIsGeminiVisible] = useState(false);
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [isExpanded, setIsExpanded] = useState(!!geminiApiKey);
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveState('saving');
        saveGeminiKey(geminiKeyInput);
        setTimeout(() => {
            setSaveState('saved');
            setTimeout(() => setSaveState('idle'), 2000);
        }, 500);
    };

    return (
        <div className="bg-white/5 rounded-xl p-4">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <KeyIcon className="w-5 h-5"/>
                    <span className="font-semibold">Gemini API Key (Optional)</span>
                </div>
                 <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>{'>'}</span>
            </button>
            {isExpanded && (
                <form onSubmit={handleSave} className="space-y-3 mt-4 animate-fade-in-fast">
                    <p className="text-xs text-gray-400">Add a Google Gemini key to enable AI features like ScapeAI search, viewing guides, and fun facts.</p>
                    <div className="relative">
                         <input
                            type={isGeminiVisible ? 'text' : 'password'}
                            value={geminiKeyInput}
                            onChange={(e) => setGeminiKeyInput(e.target.value)}
                            placeholder="Enter your Gemini API Key"
                            className="w-full pl-3 pr-10 py-2 text-sm text-white bg-black/20 border border-white/10 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                        <button type="button" onClick={() => setIsGeminiVisible(!isGeminiVisible)} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white">
                            {isGeminiVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                     <button
                        type="submit"
                        className="w-full px-4 py-2 text-sm text-center bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-lg transition-colors flex items-center justify-center gap-2"
                        disabled={saveState === 'saving'}
                    >
                        {saveState === 'saving' && <LoadingSpinner className="w-4 h-4" />}
                        {saveState === 'saved' && <CheckCircleIcon className="w-5 h-5 text-green-400" />}
                        {saveState === 'saved' ? 'Key Saved!' : 'Save Gemini Key'}
                    </button>
                </form>
            )}
        </div>
    );
};

const AuthManager: React.FC = () => {
    const { signIn, signOut, isAuthenticated, isLoading, getIdTokenClaims } = useLogto();
    const [user, setUser] = useState<IdTokenClaims>();

    useEffect(() => {
        (async () => {
          if (isAuthenticated) {
            const claims = await getIdTokenClaims();
            setUser(claims);
          }
        })();
    }, [getIdTokenClaims, isAuthenticated]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-24"><LoadingSpinner /></div>;
    }

    if (isAuthenticated && user) {
        return (
            <div className="text-center">
                {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-16 h-16 rounded-full mx-auto mb-4" />
                ) : (
                    <UserCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                )}
                <p className="text-gray-300">Logged in as</p>
                <p className="font-bold text-white text-lg truncate">{user.name}</p>
                <button
                    onClick={() => signOut(window.location.origin)}
                    className="w-full mt-4 px-4 py-2 text-sm text-center text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                    Logout
                </button>
            </div>
        );
    }

    return (
        <div className="text-center">
            <UserCircleIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-300 mb-4">Login to sync your likes across devices (coming soon!).</p>
            <button
                onClick={() => signIn(window.location.origin)}
                className="w-full glass-button primary"
            >
                Login or Sign Up
            </button>
        </div>
    );
}

export const MyScapePage: React.FC<MyScapePageProps> = ({ onSelectMedia }) => {
    const { rateLimit, clearAllSettings, isAllClearMode, toggleAllClearMode } = useSettings();
    const { likes, isLoading: preferencesLoading } = useLocalLikes();

    if (preferencesLoading) {
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
    }
    
    const DAILY_LIMIT = 500;
    const remainingRequests = Math.max(0, DAILY_LIMIT - rateLimit.count);
    const usagePercentage = (rateLimit.count / DAILY_LIMIT) * 100;

    let progressBarColor = 'bg-green-500';
    if (usagePercentage >= 90) progressBarColor = 'bg-red-500';
    else if (usagePercentage >= 75) progressBarColor = 'bg-yellow-500';

    return (
        <div className="w-full max-w-7xl fade-in">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 text-center md:text-left mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-white">MyScape</h1>
                    <p className="text-lg text-gray-400">Your personal hub for settings and likes.</p>
                </div>
                 <a href="#/" className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all duration-300">
                    <ThumbsUpIcon className="w-6 h-6 text-green-400" />
                    <span>For You Recommendations</span>
                </a>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="glass-panel p-6 rounded-2xl">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><UserCircleIcon className="w-6 h-6"/> Account</h2>
                    <AuthManager />
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
                    <div className="space-y-4">
                        <GeminiKeyManager />
                        <div className="flex justify-between items-center bg-white/5 rounded-xl p-4">
                            <div>
                                <label className="text-gray-200">"All Clear" Mode</label>
                                <p className="text-xs text-gray-400">Increases UI transparency.</p>
                            </div>
                            <button
                                onClick={toggleAllClearMode}
                                className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors duration-300 ease-in-out ${isAllClearMode ? 'bg-indigo-600' : 'bg-gray-700'}`}
                                role="switch"
                                aria-checked={isAllClearMode}
                            >
                                <span className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 ease-in-out shadow-lg ${isAllClearMode ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">This will clear all your local data, including your Gemini key.</p>
                            <button onClick={clearAllSettings} className="w-full mt-2 px-4 py-2 text-sm text-center text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                                Clear All Local Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                    My Likes
                </h2>
                {likes.length > 0 ? (
                    <RecommendationGrid recommendations={likes} onSelect={onSelectMedia} />
                ) : (
                    <div className="text-center py-12 glass-panel rounded-2xl">
                        <p className="text-gray-300">You haven't liked any titles yet.</p>
                        <p className="text-sm text-gray-400 mt-2">Like movies and shows to see them here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};