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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-md text-center bg-gray-800 p-8 rounded-2xl border border-blue-500/50">
                <h2 className="text-2xl font-bold text-blue-300 mb-4">TMDb API Key Required</h2>
                <p className="text-gray-300 mb-6">
                    To fetch movie and TV show data, this application requires your personal TMDb API key.
                    You can get a free key by signing up on <a href="https://www.themoviedb.org/signup" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">themoviedb.org</a>.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your TMDb API Key (v3 auth)"
                        className="w-full px-4 py-3 text-white bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-colors placeholder-gray-400"
                        aria-label="TMDb API Key"
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors disabled:bg-gray-500"
                    >
                        Save and Continue
                    </button>
                </form>
            </div>
        </div>
    );
};
