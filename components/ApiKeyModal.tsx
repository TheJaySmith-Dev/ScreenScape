import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings.ts';

interface ApiKeyModalProps {
    onSave: (keys: { tmdbKey: string; geminiKey: string; }) => void;
    onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, onClose }) => {
    const { tmdbApiKey, geminiApiKey } = useSettings();
    const [tmdbKey, setTmdbKey] = useState(tmdbApiKey || '');
    const [geminiKey, setGeminiKey] = useState(geminiApiKey || '');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tmdbKey.trim().length < 20 || geminiKey.trim().length < 20) { 
            setError('Please enter valid API keys for both TMDb and Gemini.');
            return;
        }
        setError('');
        onSave({ 
            tmdbKey: tmdbKey.trim(),
            geminiKey: geminiKey.trim(),
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-lg text-center glass-panel p-8 rounded-3xl border-indigo-500/30">
                <h2 className="text-2xl font-bold text-indigo-400 mb-4 text-glow" style={{ "--glow-color": "rgba(129, 140, 248, 0.4)" } as React.CSSProperties}>API Keys Required</h2>
                <p className="text-gray-300 mb-6">
                    This application requires API keys from TMDb (for movie data) and Google Gemini (for AI features). You can get them for free from their respective websites.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="password"
                        value={tmdbKey}
                        onChange={(e) => setTmdbKey(e.target.value)}
                        placeholder="Enter your TMDb API Key (v3 auth)"
                        className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 focus:outline-none transition-colors placeholder-gray-400"
                        aria-label="TMDb API Key"
                    />
                    <a href="https://www.themoviedb.org/signup" target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:underline -mt-2">
                        Get a TMDb API key.
                    </a>

                    <input
                        type="password"
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        placeholder="Enter your Gemini API Key"
                        className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 focus:outline-none transition-colors placeholder-gray-400"
                        aria-label="Gemini API Key"
                    />
                     <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:underline -mt-2">
                        Get a Gemini API key from Google AI Studio.
                    </a>

                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    
                    <button
                        type="submit"
                        className="w-full mt-4 px-4 py-3 text-white bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-500/50 rounded-xl font-semibold transition-all duration-300 disabled:bg-gray-500/20"
                    >
                        Save and Continue
                    </button>
                </form>
            </div>
        </div>
    );
};