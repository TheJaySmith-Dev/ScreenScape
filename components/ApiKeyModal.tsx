import React, { useState } from 'react';

interface ApiKeyModalProps {
    onSave: (apiKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim().length < 20) { // TMDb keys are usually longer
            setError('Please enter a valid TMDb API key.');
            return;
        }
        setError('');
        onSave(apiKey.trim());
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-md text-center glass-panel p-8 rounded-3xl border-indigo-500/30">
                {/* FIX: Cast style object to React.CSSProperties to allow for custom CSS variables. */}
                <h2 className="text-2xl font-bold text-indigo-400 mb-4 text-glow" style={{ "--glow-color": "rgba(129, 140, 248, 0.4)" } as React.CSSProperties}>TMDb API Key Required</h2>
                <p className="text-gray-300 mb-6">
                    To fetch movie and TV show data, this application requires your personal TMDb API key.
                    You can get a free key by signing up on <a href="https://www.themoviedb.org/signup" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">themoviedb.org</a>.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your TMDb API Key (v3 auth)"
                        className="w-full px-4 py-3 text-white bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 focus:outline-none transition-colors placeholder-gray-400"
                        aria-label="TMDb API Key"
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full px-4 py-3 text-white bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-500/50 rounded-xl font-semibold transition-all duration-300 disabled:bg-gray-500/20"
                    >
                        Save and Continue
                    </button>
                </form>
            </div>
        </div>
    );
};