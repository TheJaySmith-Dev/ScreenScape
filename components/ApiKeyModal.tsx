import React, { useState } from 'react';
import { ApiKeyInfoModal } from './ApiKeyInfoModal.tsx';

interface ApiKeyModalProps {
    onSave: (keys: { tmdbKey: string; geminiKey: string; kinocheckKey: string; }) => void;
    onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, onClose }) => {
    const [tmdbKey, setTmdbKey] = useState('');
    const [geminiKey, setGeminiKey] = useState('');
    const [kinocheckKey, setKinocheckKey] = useState('');
    const [error, setError] = useState('');
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tmdbKey.trim().length < 20 || geminiKey.trim().length < 20 || kinocheckKey.trim().length < 20) {
            setError('Please enter valid API keys for TMDb, Gemini, and KinoCheck.');
            return;
        }
        setError('');
        onSave({ 
            tmdbKey: tmdbKey.trim(),
            geminiKey: geminiKey.trim(),
            kinocheckKey: kinocheckKey.trim(),
        });
    };

    return (
        <>
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="w-full max-w-lg text-center glass-panel p-8 rounded-3xl border-indigo-500/30">
                    <h2 className="text-2xl font-bold text-indigo-400 mb-4 text-glow" style={{ "--glow-color": "rgba(129, 140, 248, 0.4)" } as React.CSSProperties}>API Keys Required</h2>
                    <p className="text-gray-300 mb-2">
                        This application requires API keys from TMDb (for movie data) and Google Gemini (for AI features). You can get them for free from their respective websites.
                    </p>
                    <p className="text-gray-400 text-sm mb-6">Your keys are saved locally in this browser.</p>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            type="password"
                            value={tmdbKey}
                            onChange={(e) => setTmdbKey(e.target.value)}
                            placeholder="Enter your TMDb API Key (v3 auth)"
                            className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 focus:outline-none transition-colors placeholder-gray-400"
                            aria-label="TMDb API Key"
                        />
                        <a href="https://www.themoviedb.org/signup" target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:underline -mt-2 text-left">
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
                        <div className="text-sm text-gray-400 -mt-2 text-left">
                            For 2 devices you need 2 Gemini API keys to not be charged. 
                            <button type="button" onClick={() => setIsInfoModalOpen(true)} className="text-indigo-400 hover:underline ml-1 font-semibold">
                                Learn More
                            </button>
                        </div>
                         <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:underline -mt-2 text-left">
                            Get a Gemini API key from Google AI Studio.
                        </a>

                        <input
                            type="password"
                            value={kinocheckKey}
                            onChange={(e) => setKinocheckKey(e.target.value)}
                            placeholder="Enter your KinoCheck API Key"
                            className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 focus:outline-none transition-colors placeholder-gray-400"
                            aria-label="KinoCheck API Key"
                        />
                        <a href="https://api.kinocheck.com/register" target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:underline -mt-2 text-left">
                            Get a KinoCheck API key.
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
            {isInfoModalOpen && <ApiKeyInfoModal onClose={() => setIsInfoModalOpen(false)} />}
        </>
    );
};