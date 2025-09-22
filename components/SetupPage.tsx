import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings.ts';
import { KeyIcon, LoginIcon } from './icons.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';

const ApiKeyStep: React.FC = () => {
    const { saveTmdbKey, tmdbApiKey } = useSettings();
    const [keyInput, setKeyInput] = useState(tmdbApiKey || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (keyInput.trim()) {
            saveTmdbKey(keyInput.trim());
        }
    };

    return (
        <div className="w-full max-w-md text-center fade-in">
            <div className="glass-panel p-8 md:p-12">
                <div className="flex justify-center items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center border-2 border-indigo-500/30">
                        <KeyIcon className="w-8 h-8 text-indigo-300" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    TMDb API Key
                </h1>
                <p className="text-gray-300 mb-6">
                    ScreenScape requires a free API key from The Movie Database (TMDb) to fetch content.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder="Paste your TMDb API Key (v3 auth)"
                        className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 focus:outline-none transition-colors placeholder-gray-400"
                        aria-label="TMDb API Key"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!keyInput.trim()}
                        className="w-full glass-button primary text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue
                    </button>
                </form>
                <a 
                    href="https://www.themoviedb.org/settings/api" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block text-sm text-gray-400 mt-4 hover:text-indigo-300 transition-colors"
                >
                    Don't have a key? Get one here &rarr;
                </a>
            </div>
        </div>
    );
};

const LoginStep: React.FC = () => {
    const { loginWithTmdb, tmdb } = useSettings();

    return (
        <div className="w-full max-w-md text-center fade-in">
            <div className="glass-panel p-8 md:p-12">
                 <div className="flex justify-center items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500/30">
                        <LoginIcon className="w-8 h-8 text-green-300 transform -scale-x-100" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Almost there!
                </h1>
                <p className="text-gray-300 mb-8">
                    Log in with your TMDb account to unlock your personalized scape and save your likes.
                </p>
                
                {tmdb.state === 'loading' ? (
                    <div className="flex flex-col items-center justify-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-gray-300">Redirecting to TMDb...</p>
                    </div>
                ) : (
                     <button
                        onClick={loginWithTmdb}
                        className="w-full glass-button primary text-lg"
                    >
                        <span>Login with TMDb</span>
                    </button>
                )}
            </div>
        </div>
    );
};


export const SetupPage: React.FC = () => {
    const { setupState } = useSettings();

    return (
        <div className="w-screen h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <img 
                src="https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg" // Dune backdrop
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-20 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d12] via-[#0d0d12]/80 to-[#0d0d12]"></div>

            {/* Content */}
            <div className="relative z-10">
               {setupState === 'needs_tmdb_key' && <ApiKeyStep />}
               {setupState === 'needs_tmdb_auth' && <LoginStep />}
            </div>
        </div>
    );
};
